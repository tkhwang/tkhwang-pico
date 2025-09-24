-- ============================================================================
-- DROP SCRIPT FOR VECTOR STORE TABLES
-- Excludes: profiles, messages, threads
-- Note: Recommendation system tables already removed (user_content_interactions, 
--       recommendation_logs, user_factors, content_factors, co_visitation, similar_items_cf)
-- ============================================================================

-- Drop policies first
drop policy if exists contents_select on public.contents;
drop policy if exists user_contents_rw on public.user_contents;
drop policy if exists user_embeddings_rw on public.user_embeddings;
drop policy if exists user_preferences_rw on public.user_content_preferences;
drop policy if exists debug_failed_contents_select on public.debug_failed_contents;

-- Disable RLS before removing tables
alter table if exists public.contents disable row level security;
alter table if exists public.user_contents disable row level security;
alter table if exists public.content_embeddings disable row level security;
alter table if exists public.user_embeddings disable row level security;
alter table if exists public.user_content_preferences disable row level security;
alter table if exists public.debug_failed_contents disable row level security;

-- Drop triggers first (before functions they depend on)
drop trigger if exists trg_auto_completed_timestamp on public.user_contents;
drop trigger if exists trg_set_content_domain on public.contents;

-- Drop functions
drop function if exists public.recommend_feed(int, text, text);
drop function if exists public.similar_to_content(uuid, int, text, text);
drop function if exists public.auto_set_completed_timestamp();
drop function if exists public.set_content_domain();
drop function if exists public.current_clerk_user_id();
drop function if exists public.toggle_user_content_status(uuid);

-- Drop tables (order matters due to foreign key constraints)
drop table if exists public.debug_failed_contents cascade;
drop table if exists public.user_content_preferences cascade;
drop table if exists public.user_embeddings cascade;
drop table if exists public.content_embeddings cascade;
drop table if exists public.user_contents cascade;
drop table if exists public.contents cascade;

-- Drop types
drop type if exists content_todo_status;
drop type if exists embedding_scope;
drop type if exists content_status;

-- Drop extensions
drop extension if exists pg_trgm;
drop extension if exists pgcrypto;
drop extension if exists vector;
