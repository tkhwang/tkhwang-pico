-- ============================================================================
-- DROP SCRIPT FOR VECTOR STORE TABLES
-- Excludes: profiles, messages, threads
-- ============================================================================

-- Drop policies first
drop policy if exists contents_select on public.contents;
drop policy if exists user_contents_rw on public.user_contents;
drop policy if exists user_embeddings_rw on public.user_embeddings;
drop policy if exists uci_rw on public.user_content_interactions;
drop policy if exists reclogs_rw on public.recommendation_logs;
drop policy if exists cf_read on public.user_factors;
drop policy if exists cf_item_read on public.content_factors;
drop policy if exists covis_read on public.co_visitation;
drop policy if exists simcf_read on public.similar_items_cf;

-- Drop triggers first (before functions they depend on)
drop trigger if exists trg_auto_completed_timestamp on public.user_contents;
drop trigger if exists trg_set_content_domain on public.contents;

-- Drop functions
drop function if exists public.similar_to_content_cf(uuid, int);
drop function if exists public.recommend_feed(int, text, text);
drop function if exists public.similar_to_content(uuid, int, text);
drop function if exists public.auto_set_completed_timestamp();
drop function if exists public.set_content_domain();
drop function if exists public.current_clerk_user_id();

-- Drop tables (order matters due to foreign key constraints)
drop table if exists public.similar_items_cf cascade;
drop table if exists public.co_visitation cascade;
drop table if exists public.content_factors cascade;
drop table if exists public.user_factors cascade;
drop table if exists public.recommendation_logs cascade;
drop table if exists public.user_content_interactions cascade;
drop table if exists public.user_embeddings cascade;
drop table if exists public.content_embeddings cascade;
drop table if exists public.user_contents cascade;
drop table if exists public.contents cascade;

-- Drop types
drop type if exists content_todo_status;
drop type if exists interaction_type;
drop type if exists embedding_scope;
drop type if exists content_status;
