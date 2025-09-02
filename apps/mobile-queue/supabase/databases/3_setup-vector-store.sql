-- ----------------------------------------------------------------------------
-- extensions
-- ----------------------------------------------------------------------------
create extension if not exists vector;
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ----------------------------------------------------------------------------
-- types
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
-- helper: 현재 Clerk 사용자 ID (JWT sub) 얻기
-- ----------------------------------------------------------------------------
create or replace function public.current_clerk_user_id()
returns text
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'sub', '');
$$;

-- ----------------------------------------------------------------------------
-- contents (전역 콘텐츠)
-- ----------------------------------------------------------------------------
create table if not exists public.contents (
  id            uuid primary key default gen_random_uuid(),
  url           text not null,
  canonical_url text,
  domain        text,
  title         text,
  author        text,
  lang          text,
  summary       text,
  tags          text[] default '{}',
  word_count    int,
  token_count   int,
  published_at  timestamptz,
  fetched_at    timestamptz,
  status        content_status not null default 'pending',
  is_public     boolean not null default false,
  metadata      jsonb not null default '{}'
);

create unique index if not exists idx_contents_url on public.contents(url);
create unique index if not exists idx_contents_unique_url on public.contents (coalesce(canonical_url, url));
create index if not exists idx_contents_domain on public.contents(domain);
create index if not exists idx_contents_status on public.contents(status);
create index if not exists idx_contents_is_public on public.contents(is_public);
create index if not exists idx_contents_tags on public.contents using gin(tags);
create index if not exists idx_contents_title_trgm on public.contents using gin(title gin_trgm_ops);

-- 상태 전이 가드: ready면 domain 있어야 함
alter table public.contents
  drop constraint if exists contents_ready_requires_domain;
alter table public.contents
  add constraint contents_ready_requires_domain
  check (status <> 'ready' or domain is not null);

-- ----------------------------------------------------------------------------
-- user_contents (개인 라이브러리)
-- ----------------------------------------------------------------------------
create table if not exists public.user_contents (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,  -- Clerk ID (e.g., user_***)
  content_id  uuid not null references public.contents(id) on delete cascade,
  note        text,
  labels      text[] default '{}',
  archived    boolean not null default false,
  saved_at    timestamptz not null default now(),
  unique (user_id, content_id)
);
create index if not exists idx_user_contents_user on public.user_contents(user_id);
create index if not exists idx_user_contents_content on public.user_contents(content_id);
create index if not exists idx_user_contents_archived on public.user_contents(archived);

-- ----------------------------------------------------------------------------
-- content_embeddings (콘텐츠 임베딩)
-- ----------------------------------------------------------------------------
create table if not exists public.content_embeddings (
  id               bigserial primary key,
  content_id       uuid not null references public.contents(id) on delete cascade,
  scope            embedding_scope not null default 'summary',
  chunk_index      int,
  embedding        vector(1536) not null,
  embedding_model  text not null,
  created_at       timestamptz not null default now()
);
create unique index if not exists idx_content_embeddings_unique
  on public.content_embeddings (content_id, scope, coalesce(chunk_index,-1), embedding_model);

-- ANN index
create index if not exists content_embeddings_embedding_ivfflat
  on public.content_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ----------------------------------------------------------------------------
-- user_embeddings (개인화 임베딩)
-- ----------------------------------------------------------------------------
create table if not exists public.user_embeddings (
  user_id         text primary key,   -- Clerk ID
  source          text not null default 'history',
  embedding       vector(1536) not null,
  embedding_model text not null,
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- interactions (행동 로그)
-- ----------------------------------------------------------------------------
create table if not exists public.user_content_interactions (
  id          bigserial primary key,
  user_id     text not null,   -- Clerk ID
  content_id  uuid not null references public.contents(id) on delete cascade,
  type        interaction_type not null,
  value       smallint,
  dwell_ms    int,
  weight      real,
  created_at  timestamptz not null default now()
);
create index if not exists idx_uci_user on public.user_content_interactions(user_id);
create index if not exists idx_uci_content on public.user_content_interactions(content_id);
create index if not exists idx_uci_type on public.user_content_interactions(type);

-- ----------------------------------------------------------------------------
-- recommendation_logs (서빙 로깅)
-- ----------------------------------------------------------------------------
create table if not exists public.recommendation_logs (
  id          bigserial primary key,
  user_id     text not null,   -- Clerk ID
  algo        text not null,   -- 'cbf','hybrid','trending'...
  request_ctx jsonb not null default '{}',
  results     jsonb not null,  -- [{content_id, score}, ...]
  served_at   timestamptz not null default now(),
  clicked_id  uuid,
  converted_id uuid
);
create index if not exists idx_reclogs_user on public.recommendation_logs(user_id);
create index if not exists idx_reclogs_served_at on public.recommendation_logs(served_at);

-- ----------------------------------------------------------------------------
-- CF 확장: 잠재요인/공저장/유사아이템(옵션)
-- ----------------------------------------------------------------------------
-- 잠재요인 차원 K=64 (필요 시 변경)
create table if not exists public.user_factors (
  user_id   text primary key,           -- Clerk ID
  factors   vector(64) not null,
  bias      real default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.content_factors (
  content_id uuid primary key references public.contents(id) on delete cascade,
  factors    vector(64) not null,
  bias       real default 0,
  updated_at timestamptz not null default now()
);

-- 함께 본(co-visitation) 집계
create table if not exists public.co_visitation (
  src_content_id uuid not null references public.contents(id) on delete cascade,
  dst_content_id uuid not null references public.contents(id) on delete cascade,
  score          double precision not null, -- 가중 동시노출/연속뷰 등
  updated_at     timestamptz not null default now(),
  primary key (src_content_id, dst_content_id)
);

-- CF 기반 유사 아이템 프리컴퓨트
create table if not exists public.similar_items_cf (
  content_id  uuid not null references public.contents(id) on delete cascade,
  neighbor_id uuid not null references public.contents(id) on delete cascade,
  score       real not null,
  primary key (content_id, neighbor_id)
);

-- ----------------------------------------------------------------------------
-- domain 자동 채우기 (간단 fallback)
-- ----------------------------------------------------------------------------
create or replace function public.set_content_domain()
returns trigger language plpgsql as $$
begin
  if new.domain is null and new.url is not null then
    new.domain := regexp_replace(new.url, '^[a-z]+://([^/ :]+).*$','\1');
  end if;
  return new;
end $$;

drop trigger if exists trg_set_content_domain on public.contents;
create trigger trg_set_content_domain
before insert or update of url on public.contents
for each row execute function public.set_content_domain();

-- ----------------------------------------------------------------------------
-- RLS (모든 테이블에 적용)
-- ----------------------------------------------------------------------------
alter table public.contents                      enable row level security;
alter table public.user_contents                 enable row level security;
alter table public.content_embeddings            enable row level security;
alter table public.user_embeddings               enable row level security;
alter table public.user_content_interactions     enable row level security;
alter table public.recommendation_logs           enable row level security;
alter table public.user_factors                  enable row level security;
alter table public.content_factors               enable row level security;
alter table public.co_visitation                 enable row level security;
alter table public.similar_items_cf              enable row level security;

-- 기본 권한 정리: 익명/인증 사용자에 대한 테이블 권한 최소화
revoke all on public.contents from anon, authenticated;
revoke all on public.content_embeddings from anon, authenticated;
revoke all on public.user_contents from anon, authenticated;
revoke all on public.user_embeddings from anon, authenticated;
revoke all on public.user_content_interactions from anon, authenticated;
revoke all on public.recommendation_logs from anon, authenticated;
revoke all on public.user_factors from anon, authenticated;
revoke all on public.content_factors from anon, authenticated;
revoke all on public.co_visitation from anon, authenticated;
revoke all on public.similar_items_cf from anon, authenticated;

-- 필요한 최소 권한 부여 (RLS가 최종 필터링)
grant select on public.contents to authenticated, anon;      -- RLS로 공개/소유만 허용
grant select, insert, update, delete on public.user_contents to authenticated;
grant select, insert, update, delete on public.user_embeddings to authenticated;
grant select, insert, update, delete on public.user_content_interactions to authenticated;
grant select, insert on public.recommendation_logs to authenticated;
grant select on public.user_factors, public.content_factors to authenticated;
grant select on public.co_visitation, public.similar_items_cf to authenticated;

-- contents: 공개이거나(모두) OR 내가 저장한 경우에만 조회 가능
drop policy if exists contents_select on public.contents;
create policy contents_select on public.contents
for select
to authenticated, anon
using (
  is_public
  or exists (
    select 1 from public.user_contents uc
    where uc.content_id = contents.id
      and uc.user_id = public.current_clerk_user_id()
  )
);

-- user_contents: 본인만 접근/수정
drop policy if exists user_contents_rw on public.user_contents;
create policy user_contents_rw on public.user_contents
for all to authenticated
using (user_id = public.current_clerk_user_id())
with check (user_id = public.current_clerk_user_id());

-- user_embeddings: 본인만
drop policy if exists user_embeddings_rw on public.user_embeddings;
create policy user_embeddings_rw on public.user_embeddings
for all to authenticated
using (user_id = public.current_clerk_user_id())
with check (user_id = public.current_clerk_user_id());

-- interactions: 본인만
drop policy if exists uci_rw on public.user_content_interactions;
create policy uci_rw on public.user_content_interactions
for all to authenticated
using (user_id = public.current_clerk_user_id())
with check (user_id = public.current_clerk_user_id());

-- recommendation_logs: 본인만 읽기/쓰기
drop policy if exists reclogs_rw on public.recommendation_logs;
create policy reclogs_rw on public.recommendation_logs
for all to authenticated
using (user_id = public.current_clerk_user_id())
with check (user_id = public.current_clerk_user_id());

-- content_embeddings: 직접 노출 금지(정책 미설정). RPC/Service role로만 접근.
-- user_factors/content_factors/co_visitation/similar_items_cf: read-only 공개 추천 풀
drop policy if exists cf_read on public.user_factors;
create policy cf_read on public.user_factors for select to authenticated using (true);

drop policy if exists cf_item_read on public.content_factors;
create policy cf_item_read on public.content_factors for select to authenticated using (true);

drop policy if exists covis_read on public.co_visitation;
create policy covis_read on public.co_visitation for select to authenticated using (true);

drop policy if exists simcf_read on public.similar_items_cf;
create policy simcf_read on public.similar_items_cf for select to authenticated using (true);

-- ----------------------------------------------------------------------------
-- RPC (JWT 기반, p_user_id 제거)
-- ----------------------------------------------------------------------------
-- 유사 콘텐츠 (공개+ready, 내 라이브러리에 있으면 제외하고 싶으면 filtered 버전 사용)
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
grant execute on function public.similar_to_content(uuid,int,text) to authenticated, anon;

-- 내 피드: 현재 JWT의 sub로 사용자 추론 (이미 본/저장 제외)
create or replace function public.recommend_feed(
  p_limit int default 20,
  p_model text default null,
  p_lang text default null
)
returns table (content_id uuid, distance float4)
language sql security definer set search_path=public as $$
  with me as (
    select public.current_clerk_user_id() as uid
  ),
  ue as (
    select embedding, embedding_model
    from public.user_embeddings, me
    where user_id = me.uid
    limit 1
  ),
  base as (
    select ce.content_id,
           (ce.embedding <=> ue.embedding)::float4 as distance
    from ue
    join public.content_embeddings ce
      on ce.scope='summary'
     and (p_model is null or ce.embedding_model = coalesce(p_model, ue.embedding_model))
    join public.contents c on c.id=ce.content_id
    where c.status='ready' and c.is_public=true
      and (p_lang is null or c.lang = p_lang)
  )
  select b.content_id, b.distance
  from base b
  left join public.user_contents uc
    on uc.content_id = b.content_id
   and uc.user_id = (select uid from me)
  left join public.user_content_interactions uci
    on uci.content_id = b.content_id
   and uci.user_id = (select uid from me)
  where uc.id is null and uci.id is null
  order by b.distance
  limit greatest(1, p_limit);
$$;

revoke all on function public.recommend_feed(int,text,text) from public;
grant execute on function public.recommend_feed(int,text,text) to authenticated;

-- (옵션) CF 기반 유사 아이템 RPC
create or replace function public.similar_to_content_cf(
  p_content_id uuid,
  p_limit int default 20
)
returns table (neighbor_id uuid, score real)
language sql security definer set search_path=public as $$
  select neighbor_id, score
  from public.similar_items_cf
  where content_id = p_content_id
  order by score desc
  limit greatest(1, p_limit);
$$;

revoke all on function public.similar_to_content_cf(uuid,int) from public;
grant execute on function public.similar_to_content_cf(uuid,int) to authenticated, anon;
