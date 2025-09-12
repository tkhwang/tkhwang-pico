-- ============================================================================
-- Cleanup Unused Recommendation System Tables and Functions
-- Date: 2025-01-12
-- Description: Remove unused recommendation system components while keeping
--              the embedding-based functionality intact
-- ============================================================================

-- 1. Drop Functions
-- ============================================================================
DROP FUNCTION IF EXISTS public.similar_to_content_cf(uuid, int);

-- 2. Modify recommend_feed function to remove user_content_interactions reference
-- ============================================================================
CREATE OR REPLACE FUNCTION public.recommend_feed(
  p_limit int default 20,
  p_model text default null,
  p_lang text default null
)
RETURNS TABLE (content_id uuid, distance float4)
LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  WITH me AS ( SELECT public.current_clerk_user_id() uid ),
  ue AS (
    SELECT embedding, embedding_model
    FROM public.user_embeddings, me
    WHERE user_id = me.uid
    LIMIT 1
  ),
  base AS (
    SELECT ce.content_id,
           (ce.embedding <=> ue.embedding)::float4 AS distance
    FROM ue
    JOIN public.content_embeddings ce
      ON ce.scope='summary'
     AND (p_model IS NULL OR ce.embedding_model = coalesce(p_model, ue.embedding_model))
    JOIN public.contents c ON c.id = ce.content_id
    WHERE c.status='ready'
      AND (p_lang IS NULL OR c.lang = p_lang)
  )
  SELECT b.content_id, b.distance
  FROM base b
  LEFT JOIN public.user_contents uc
    ON uc.content_id = b.content_id AND uc.user_id = (SELECT uid FROM me)
  WHERE uc.id IS NULL  -- 이미 저장한 콘텐츠는 제외
  ORDER BY b.distance
  LIMIT greatest(1, p_limit);
$$;

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