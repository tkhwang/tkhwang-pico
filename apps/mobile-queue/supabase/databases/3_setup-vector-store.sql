-- ----------------------------------------------------------------------------
-- update extensions
-- ----------------------------------------------------------------------------
create extension if not exists vector;   -- pgvector
create extension if not exists pgcrypto; -- gen_random_uuid()
create extension if not exists pg_trgm;  -- fuzzy text search (optional)

-- ----------------------------------------------------------------------------
-- update types
-- ----------------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname='content_status') then
    create type content_status as enum ('pending','ready','failed','archived');
  end if;
  if not exists (select 1 from pg_type where typname='embedding_scope') then
    create type embedding_scope as enum ('summary','chunk','title','tags');
  end if;
  if not exists (select 1 from pg_type where typname='interaction_type') then
    create type interaction_type as enum
      ('save','open','click','like','complete','share','archive','dismiss','rating');
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- contents table
-- ----------------------------------------------------------------------------
create table if not exists public.contents (
  id            uuid primary key default gen_random_uuid(),
  url           text not null,                     -- 원본 URL
  canonical_url text,                              -- 정규화된 URL
  domain        text,                              -- 예: example.com
  title         text,
  author        text,
  lang          text,
  summary       text,
  tags          text[] default '{}',
  word_count    int,
  token_count   int,
  published_at  timestamptz,
  fetched_at    timestamptz,                       -- 크롤/파싱 시각
  status        content_status not null default 'pending',
  is_public     boolean not null default false,    -- 공개 추천 풀 포함 여부
  metadata      jsonb not null default '{}'
  -- unique 제약 조건 제거, 대신 아래에 unique index 추가
);

-- URL 유니크 인덱스 (coalesce 함수 사용)
create unique index if not exists idx_contents_unique_url 
  on public.contents (coalesce(canonical_url, url));

create index if not exists idx_contents_domain on public.contents(domain);
create index if not exists idx_contents_status on public.contents(status);
create index if not exists idx_contents_is_public on public.contents(is_public);
create index if not exists idx_contents_tags on public.contents using gin(tags);
create index if not exists idx_contents_title_trgm on public.contents using gin (title gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- user_contents table
-- ----------------------------------------------------------------------------
create table if not exists public.user_contents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  content_id  uuid not null references public.contents(id) on delete cascade,
  note        text,                  -- 개인 메모 (optional)
  labels      text[] default '{}',   -- 개인 라벨/폴더
  archived    boolean not null default false,
  saved_at    timestamptz not null default now(),

  unique (user_id, content_id)
);

create index if not exists idx_user_contents_user on public.user_contents(user_id);
create index if not exists idx_user_contents_content on public.user_contents(content_id);
create index if not exists idx_user_contents_archived on public.user_contents(archived);

-- ----------------------------------------------------------------------------
-- content_embeddings table
-- ----------------------------------------------------------------------------
create table if not exists public.content_embeddings (
  id               bigserial primary key,
  content_id       uuid not null references public.contents(id) on delete cascade,
  scope            embedding_scope not null default 'summary',
  chunk_index      int,                              -- scope='chunk'용
  embedding        vector(1536) not null,            -- ⬅️ DIM 수정
  embedding_model  text not null,                    -- 예: text-embedding-3-small
  created_at       timestamptz not null default now()
  -- unique 제약 조건 제거, 대신 아래에 unique index 추가
);

-- content_embeddings 유니크 인덱스 (coalesce 사용)
create unique index if not exists idx_content_embeddings_unique
  on public.content_embeddings (content_id, scope, coalesce(chunk_index,-1), embedding_model);

-- ANN 인덱스 (코사인 권장)
create index if not exists content_embeddings_embedding_ivfflat
  on public.content_embeddings
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ----------------------------------------------------------------------------
-- user_embeddings table
-- ----------------------------------------------------------------------------
create table if not exists public.user_embeddings (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  source          text not null default 'history',   -- history/onboarding/mix
  embedding       vector(1536) not null,             -- ⬅️ DIM 수정
  embedding_model text not null,
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- user_content_interactions table
-- ----------------------------------------------------------------------------
create table if not exists public.user_content_interactions (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  content_id  uuid not null references public.contents(id) on delete cascade,
  type        interaction_type not null,
  value       smallint,      -- rating 등 점수형
  dwell_ms    int,
  weight      real,          -- 후처리 가중치
  created_at  timestamptz not null default now()
);

create index if not exists idx_uci_user on public.user_content_interactions(user_id);
create index if not exists idx_uci_content on public.user_content_interactions(content_id);
create index if not exists idx_uci_type on public.user_content_interactions(type);

-- ----------------------------------------------------------------------------
-- set_content_domain trigger
-- ----------------------------------------------------------------------------
create or replace function public.set_content_domain()
returns trigger language plpgsql as $$
begin
  if new.domain is null and new.url is not null then
    -- 단순 도메인 추출(스킴/포트 제거)
    new.domain := regexp_replace(new.url, '^[a-z]+://([^/ :]+).*$','\1');
  end if;
  return new;
end $$;

drop trigger if exists trg_set_content_domain on public.contents;
create trigger trg_set_content_domain
before insert or update of url on public.contents
for each row execute function public.set_content_domain();

-- ----------------------------------------------------------------------------
-- recommendation_logs table (참조되었지만 정의되지 않은 테이블 추가)
-- ----------------------------------------------------------------------------
create table if not exists public.recommendation_logs (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  content_id  uuid references public.contents(id) on delete cascade,
  rec_type    text not null,                       -- 'content', 'comment' 등
  score       float4,
  shown_at    timestamptz not null default now(),
  clicked     boolean not null default false,
  metadata    jsonb not null default '{}'
);

create index if not exists idx_recommendation_logs_user on public.recommendation_logs(user_id);
create index if not exists idx_recommendation_logs_shown_at on public.recommendation_logs(shown_at);

-- ----------------------------------------------------------------------------
-- enable row level security
-- ----------------------------------------------------------------------------
alter table public.contents                      enable row level security;
alter table public.user_contents                 enable row level security;
alter table public.content_embeddings            enable row level security;
alter table public.user_embeddings               enable row level security;
alter table public.user_content_interactions     enable row level security;
alter table public.recommendation_logs           enable row level security;

-- contents: 공개 또는 내가 저장한 것
drop policy if exists "contents_select" on public.contents;
create policy "contents_select" on public.contents
for select
to authenticated, anon
using (
  is_public
  or exists (
    select 1 from public.user_contents uc
    where uc.content_id = contents.id and uc.user_id = auth.uid()
  )
);

-- contents: 쓰기는 서버에서만(일반 클라이언트 금지)
revoke all on public.contents from anon, authenticated;

-- user_contents: 본인만
drop policy if exists "user_contents_rw" on public.user_contents;
create policy "user_contents_rw" on public.user_contents
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- content_embeddings: 정책 미설정(=차단). RPC/Service key로만 사용.
revoke all on public.content_embeddings from anon, authenticated;

-- user_embeddings: 본인만
drop policy if exists "user_embeddings_rw" on public.user_embeddings;
create policy "user_embeddings_rw" on public.user_embeddings
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- interactions: 본인만
drop policy if exists "uci_rw" on public.user_content_interactions;
create policy "uci_rw" on public.user_content_interactions
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- recommendation_logs: 본인만 읽기
drop policy if exists "reclogs_select" on public.recommendation_logs;
create policy "reclogs_select" on public.recommendation_logs
for select to authenticated
using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- similar_to_content function
-- ----------------------------------------------------------------------------
create or replace function public.similar_to_content(
  p_content_id uuid,
  p_limit int default 20,
  p_model text default null
)
returns table (content_id uuid, distance float4)
language sql security definer set search_path=public as $$
  select ce2.content_id,
         (ce2.embedding <=> ce.embedding)::float4 as distance
  from public.content_embeddings ce
  join public.content_embeddings ce2
    on ce2.scope='summary'
   and (p_model is null or ce2.embedding_model = coalesce(p_model, ce.embedding_model))
   and ce2.content_id <> ce.content_id
  join public.contents c2 on c2.id = ce2.content_id
  where ce.content_id = p_content_id
    and ce.scope = 'summary'
    and (p_model is null or ce.embedding_model = p_model)
    and c2.status = 'ready'
    and c2.is_public = true
  order by ce2.embedding <=> ce.embedding
  limit greatest(1, p_limit);
$$;

revoke all on function public.similar_to_content(uuid,int,text) from public;
grant execute on function public.similar_to_content(uuid,int,text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- recommend_for_user function
-- ----------------------------------------------------------------------------
create or replace function public.recommend_for_user(
  p_limit int default 20,
  p_model text default null
)
returns table (content_id uuid, distance float4)
language sql security definer set search_path=public as $$
  with ue as (
    select embedding, embedding_model
    from public.user_embeddings
    where user_id = auth.uid()
    limit 1
  )
  select ce.content_id,
         (ce.embedding <=> ue.embedding)::float4 as distance
  from ue
  join public.content_embeddings ce
    on ce.scope='summary'
   and (p_model is null or ce.embedding_model = coalesce(p_model, ue.embedding_model))
  join public.contents c on c.id = ce.content_id
  where c.status='ready' and c.is_public = true
  order by ce.embedding <=> ue.embedding
  limit greatest(1, p_limit);
$$;

revoke all on function public.recommend_for_user(int,text) from public;
grant execute on function public.recommend_for_user(int,text) to authenticated;
