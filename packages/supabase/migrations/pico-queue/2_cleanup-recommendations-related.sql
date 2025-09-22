-- ============================================================================
-- Cleanup Unused Recommendation System Tables and Functions
-- Date: 2025-01-12
-- Description: Remove unused recommendation system components while keeping
--              the embedding-based functionality intact
-- ============================================================================

-- 1. Drop Functions
-- ============================================================================
DROP FUNCTION IF EXISTS public.similar_to_content_cf(uuid, int);

-- 3. Drop RLS Policies
-- ============================================================================
DROP POLICY IF EXISTS uci_rw ON public.user_content_interactions;
DROP POLICY IF EXISTS reclogs_rw ON public.recommendation_logs;
DROP POLICY IF EXISTS cf_read ON public.user_factors;
DROP POLICY IF EXISTS cf_item_read ON public.content_factors;
DROP POLICY IF EXISTS covis_read ON public.co_visitation;
DROP POLICY IF EXISTS simcf_read ON public.similar_items_cf;

-- 4. Drop Tables (in dependency order)
-- ============================================================================
DROP TABLE IF EXISTS public.recommendation_logs CASCADE;
DROP TABLE IF EXISTS public.similar_items_cf CASCADE;
DROP TABLE IF EXISTS public.co_visitation CASCADE;
DROP TABLE IF EXISTS public.content_factors CASCADE;
DROP TABLE IF EXISTS public.user_factors CASCADE;
DROP TABLE IF EXISTS public.user_content_interactions CASCADE;

-- 5. Drop Unused Type
-- ============================================================================
DROP TYPE IF EXISTS interaction_type CASCADE;

-- ============================================================================
-- Summary of removed components:
-- - Tables: user_content_interactions, recommendation_logs, user_factors,
--           content_factors, co_visitation, similar_items_cf
-- - Functions: similar_to_content_cf
-- - Types: interaction_type
-- - Updated: recommend_feed function (removed user_content_interactions reference)
-- ============================================================================