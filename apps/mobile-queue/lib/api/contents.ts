import type { SimilarContentRecommendation } from '@tkhwang-pico/supabase';

import { nestApi } from './nest';

interface SaveContentRequest {
  url: string;
}

interface SaveContentResponse {
  contentId: string;
  status: 'pending' | 'ready' | 'failed' | 'archived';
}

/**
 * Save a new content URL to the backend
 */
export async function saveContent(url: string, token: string): Promise<SaveContentResponse> {
  const response = await nestApi<SaveContentResponse>('/contents/save', {
    method: 'POST',
    body: { url } as SaveContentRequest,
    token,
  });

  return response;
}

interface SimilarContentsOptions {
  limit?: number;
}

/**
 * Fetch contents that are similar to the provided content ID.
 */
export async function getSimilarContents(
  token: string,
  contentId: string,
  options?: SimilarContentsOptions,
): Promise<SimilarContentRecommendation[]> {
  const params = new URLSearchParams();

  if (options?.limit) {
    params.set('limit', String(options.limit));
  }

  const endpoint = params.size
    ? `/contents/${contentId}/similar?${params.toString()}`
    : `/contents/${contentId}/similar`;

  return nestApi<SimilarContentRecommendation[]>(endpoint, {
    token,
  });
}
