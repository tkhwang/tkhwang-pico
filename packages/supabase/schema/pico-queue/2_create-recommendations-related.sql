-- ============================================================================
-- Extensions 
-- ============================================================================
create extension if not exists vector;     -- pgvector
create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists pg_trgm;    -- fuzzy search (optional)

-- ============================================================================
-- Types
-- ============================================================================
do $$ begin
  if not exists (select 1 from pg_type where typname='content_status') then
    create type content_status as enum ('pending','ready','failed','archived');
  end if;
  if not exists (select 1 from pg_type where typname='embedding_scope') then
    create type embedding_scope as enum ('summary','chunk','title','tags');
  end if;
  if not exists (select 1 from pg_type where typname='content_todo_status') then
    create type content_todo_status as enum ('pending','completed');
  end if;
  if not exists (select 1 from pg_type where typname='content_priority') then
    create type content_priority as enum ('low','normal','high');
  end if;
end $$;

-- ============================================================================
-- Helper: 현재 Clerk 사용자 ID (JWT sub)
-- ============================================================================
create or replace function public.current_clerk_user_id()
returns text
language sql stable
as $$
  select nullif(auth.jwt() ->> 'sub', '');
$$;

-- ============================================================================
-- Contents (전역 카탈로그)  ※ is_public 없음
-- ============================================================================
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
  metadata      jsonb not null default '{}'
);

create unique index if not exists idx_contents_url on public.contents(url);
create unique index if not exists idx_contents_unique_url on public.contents (coalesce(canonical_url, url));
create index if not exists idx_contents_domain on public.contents(domain);
create index if not exists idx_contents_status on public.contents(status);
create index if not exists idx_contents_tags on public.contents using gin(tags);
create index if not exists idx_contents_title_trgm on public.contents using gin(title gin_trgm_ops);

-- 상태 전이 가드: ready면 domain 있어야 함
alter table public.contents
  add constraint contents_ready_requires_domain
  check (status <> 'ready' or domain is not null);

-- ============================================================================
-- User Contents (개인 라이브러리)
-- ============================================================================
create table if not exists public.user_contents (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,  -- Clerk ID (e.g., user_***)
  content_id  uuid not null references public.contents(id) on delete cascade,
  todo_status content_todo_status not null default 'pending',
  scheduled_for date,
  priority    content_priority not null default 'normal',
  note        text,
  labels      text[] default '{}',
  archived    boolean not null default false,
  completed_at timestamptz,
  saved_at    timestamptz not null default now(),
  unique (user_id, content_id)
);
create index if not exists idx_user_contents_user on public.user_contents(user_id);
create index if not exists idx_user_contents_content on public.user_contents(content_id);
create index if not exists idx_user_contents_archived on public.user_contents(archived);
create index if not exists idx_user_contents_user_saved_at on public.user_contents(user_id, saved_at DESC);
create index if not exists idx_user_contents_todo_status on public.user_contents(user_id, todo_status, saved_at DESC);
create index if not exists idx_user_contents_user_scheduled_for on public.user_contents(user_id, scheduled_for);
create index if not exists idx_user_contents_user_priority on public.user_contents(user_id, priority, saved_at DESC);

-- ============================================================================
-- Content Embeddings (벡터)
-- ============================================================================
create table if not exists public.content_embeddings (
  id               bigserial primary key,
  content_id       uuid not null references public.contents(id) on delete cascade,
  scope            embedding_scope not null default 'summary',
  chunk_index      int,
  embedding        vector(1536) not null,         -- 필요 시 차원 변경
  embedding_model  text not null,
  created_at       timestamptz not null default now()
);
create unique index if not exists idx_content_embeddings_unique
  on public.content_embeddings (content_id, scope, coalesce(chunk_index,-1), embedding_model);

-- ANN index (IVFFlat 예시)
create index if not exists content_embeddings_embedding_ivfflat
  on public.content_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ============================================================================
-- User Embeddings (개인화)
-- ============================================================================
create table if not exists public.user_embeddings (
  user_id         text primary key,   -- Clerk ID
  source          text not null default 'history',
  embedding       vector(1536) not null,
  embedding_model text not null,
  updated_at      timestamptz not null default now()
);

-- ============================================================================
-- User Content Preferences (사용자 콘텐츠 선호도)
-- ============================================================================
create table if not exists public.user_content_preferences (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null,  -- Clerk ID
  content_id      uuid not null references public.contents(id) on delete cascade,
  preference_type text not null default 'not_interested', -- 'liked', 'not_interested', 'blocked', etc.
  reason          text,           -- optional reason for the preference
  created_at      timestamptz not null default now(),
  unique (user_id, content_id)
);

-- Indexes for efficient filtering
create index if not exists idx_user_preferences_user on public.user_content_preferences(user_id);
create index if not exists idx_user_preferences_content on public.user_content_preferences(content_id);
create index if not exists idx_user_preferences_type on public.user_content_preferences(preference_type);
create index if not exists idx_user_preferences_user_created on public.user_content_preferences(user_id, created_at DESC);

-- ============================================================================
-- Debug Failed Contents (fetch 실패한 URL 정보)
-- ============================================================================
create table if not exists public.debug_failed_contents (
  id            uuid primary key default gen_random_uuid(),
  url           text not null,
  user_id       text not null,   -- Clerk ID
  error_code    int,
  error_message text not null,
  error_type    text,             -- 'unrecoverable', 'timeout', 'network', etc.
  attempted_at  timestamptz not null default now(),
  metadata      jsonb not null default '{}'
);

-- Composite indexes optimized for WHERE + ORDER BY
create index if not exists idx_debug_failed_user_attempted
  on public.debug_failed_contents(user_id, attempted_at desc);
create index if not exists idx_debug_failed_error_type_attempted
  on public.debug_failed_contents(error_type, attempted_at desc);

-- ============================================================================
-- Domain 자동 채우기 (간단 Fallback)
-- ============================================================================
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

-- ============================================================================
-- Todo Status 자동 관리
-- ============================================================================
create or replace function public.auto_set_completed_timestamp()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    if new.todo_status = 'completed' and new.completed_at is null then
      new.completed_at := now();
    elsif new.todo_status <> 'completed' then
      new.completed_at := null;
    end if;
  else
    if new.todo_status = 'completed' and old.todo_status <> 'completed' then
      new.completed_at := now();
    elsif new.todo_status <> 'completed' and old.todo_status = 'completed' then
      new.completed_at := null;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_auto_completed_timestamp on public.user_contents;
create trigger trg_auto_completed_timestamp
before insert or update on public.user_contents
for each row execute function public.auto_set_completed_timestamp();

-- ============================================================================
-- RLS 설정
-- ============================================================================
alter table public.contents enable row level security;
alter table public.user_contents enable row level security;
alter table public.content_embeddings enable row level security;
alter table public.user_embeddings enable row level security;
alter table public.user_content_preferences enable row level security;
alter table public.debug_failed_contents enable row level security;

-- 권한 최소화
revoke all on public.contents from anon, authenticated;
revoke all on public.content_embeddings from anon, authenticated;
revoke all on public.user_contents from anon, authenticated;
revoke all on public.user_embeddings from anon, authenticated;
revoke all on public.user_content_preferences from anon, authenticated;
revoke all on public.debug_failed_contents from anon, authenticated;

-- 필요한 최소 권한 (RLS가 최종 필터링)
grant select on public.contents to authenticated, anon;         -- 전역 read only
grant select, insert, update, delete on public.user_contents to authenticated;
grant select, insert, update, delete on public.user_embeddings to authenticated;
grant select, insert, update, delete on public.user_content_preferences to authenticated;
grant select on public.debug_failed_contents to authenticated;

-- RLS Policies
-- contents: 누구나 읽기 가능(전역 공개 카탈로그), 쓰기는 서버에서만
drop policy if exists contents_select on public.contents;
create policy contents_select on public.contents
for select to authenticated, anon
using (true);

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

-- user_content_preferences: 본인만 접근/수정
drop policy if exists user_preferences_rw on public.user_content_preferences;
create policy user_preferences_rw on public.user_content_preferences
for all to authenticated
using (user_id = public.current_clerk_user_id())
with check (user_id = public.current_clerk_user_id());

-- debug_failed_contents: 본인의 실패 기록만 볼 수 있음
drop policy if exists debug_failed_contents_select on public.debug_failed_contents;
create policy debug_failed_contents_select on public.debug_failed_contents
for select to authenticated
using (user_id = public.current_clerk_user_id());

-- ============================================================================
-- RPC (JWT 기반)
-- ============================================================================
-- 유사 콘텐츠: 전역 ready 코퍼스에서만, 개인 라이브러리/선호도 고려
create or replace function public.similar_to_content(
  p_content_id uuid,
  p_limit int default 20,
  p_model text default null,
  p_user_id text default null
)
returns table (content_id uuid, distance float4)
language sql security definer set search_path=public as $$
  with me as (
    select case
             when auth.role() = 'service_role'
               then coalesce(p_user_id, public.current_clerk_user_id())
             else public.current_clerk_user_id()
           end as uid
  ),
  seed as (
    select ce.embedding, ce.embedding_model
    from public.content_embeddings ce
    where ce.content_id = p_content_id
      and ce.scope = 'summary'
      and (p_model is null or ce.embedding_model = p_model)
      and ce.embedding_model is not null
    limit 1
  ),
  base as (
    select ce2.content_id,
           (ce2.embedding <=> seed.embedding)::float4 as distance
    from seed
    join public.content_embeddings ce2
      on ce2.scope = 'summary'
     and ce2.content_id <> p_content_id
     and ce2.embedding_model = coalesce(p_model, seed.embedding_model)
    join public.contents c2 on c2.id = ce2.content_id
    where c2.status = 'ready'
  )
  select b.content_id, b.distance
  from base b
  join me on me.uid is not null
  where not exists (
          select 1
          from public.user_contents uc
          where uc.content_id = b.content_id
            and uc.user_id = me.uid
        )
    and not exists (
          select 1
          from public.user_content_preferences ucp
          where ucp.content_id = b.content_id
            and ucp.user_id = me.uid
            and ucp.preference_type in ('not_interested', 'blocked')
        )
  order by b.distance
  limit greatest(1, p_limit);
$$;

revoke all on function public.similar_to_content(uuid,int,text,text) from public;
grant execute on function public.similar_to_content(uuid,int,text,text) to authenticated;

-- 개인화 피드: 내가 저장한 것과 관심 없는 것은 제외
create or replace function public.recommend_feed(
  p_limit int default 20,
  p_model text default null,
  p_lang text default null
)
returns table (content_id uuid, distance float4)
language sql security definer set search_path=public as $$
  with me as ( select public.current_clerk_user_id() uid ),
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
     AND ce.embedding_model = coalesce(p_model, ue.embedding_model)
    join public.contents c on c.id = ce.content_id
    where c.status='ready'
      and (p_lang is null or c.lang = p_lang)
  )
  select b.content_id, b.distance
  from base b
  left join public.user_contents uc
    on uc.content_id = b.content_id and uc.user_id = (select uid from me)
  left join public.user_content_preferences ucp
    on ucp.content_id = b.content_id
    and ucp.user_id = (select uid from me)
    and ucp.preference_type in ('not_interested', 'blocked')
  where uc.id is null  -- 이미 저장한 콘텐츠는 제외
    and ucp.id is null  -- 관심 없음/차단된 콘텐츠도 제외
  order by b.distance
  limit greatest(1, p_limit);
$$;

revoke all on function public.recommend_feed(int,text,text) from public;
grant execute on function public.recommend_feed(int,text,text) to authenticated;

-- 사용자 todo 상태 토글: 단일 UPDATE로 원자적 토글 수행
create or replace function public.toggle_user_content_status(
  p_user_content_id uuid
)
returns content_todo_status
language plpgsql
set search_path = public
as $$
declare
  v_new_status public.content_todo_status;
begin
  update public.user_contents
     set todo_status = case
                         when todo_status = 'completed' then 'pending'
                         else 'completed'
                       end::public.content_todo_status
   where id = p_user_content_id
   returning todo_status into v_new_status;

  if v_new_status is null then
    raise exception 'user_contents row % not found or not accessible', p_user_content_id;
  end if;

  return v_new_status;
end;
$$;

revoke all on function public.toggle_user_content_status(uuid) from public;
grant execute on function public.toggle_user_content_status(uuid) to authenticated;

-- 사용자 콘텐츠 조회: 상태 필터 및 정렬 기준 통일
create or replace function public.get_user_contents(
  p_status public.content_todo_status default null
)
returns table (
  id uuid,
  user_id text,
  content_id uuid,
  todo_status public.content_todo_status,
  scheduled_for date,
  priority public.content_priority,
  note text,
  labels text[],
  archived boolean,
  completed_at timestamptz,
  saved_at timestamptz,
  contents jsonb,
  preferences jsonb
)
language sql
security definer
set search_path = public
as $$
  with me as (
    select public.current_clerk_user_id() as uid
  )
  select
    uc.id,
    uc.user_id,
    uc.content_id,
    uc.todo_status,
    uc.scheduled_for,
    uc.priority,
    uc.note,
    uc.labels,
    uc.archived,
    uc.completed_at,
    uc.saved_at,
    to_jsonb(c) as contents,
    coalesce(
      (
        select jsonb_agg(to_jsonb(ucp) order by ucp.created_at desc)
        from public.user_content_preferences ucp
        where ucp.user_id = me.uid
          and ucp.content_id = uc.content_id
      ),
      '[]'::jsonb
    ) as preferences
  from me
  join public.user_contents uc on uc.user_id = me.uid
  join public.contents c on c.id = uc.content_id
  where me.uid is not null
    and (p_status is null or uc.todo_status = p_status)
  order by
    coalesce(uc.scheduled_for::timestamptz, uc.saved_at) asc,
    case uc.priority
      when 'high' then 1
      when 'normal' then 2
      else 3
    end,
    uc.saved_at asc;
$$;

revoke all on function public.get_user_contents(public.content_todo_status) from public;
grant execute on function public.get_user_contents(public.content_todo_status) to authenticated;
