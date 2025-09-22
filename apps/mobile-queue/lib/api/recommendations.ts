import type { Recommendation } from '@tkhwang-pico/supabase';

import { nestApi } from './nest';

interface GetRecommendationsParams {
  limit?: number;
  lang?: string;
}

/**
 * Get personalized content recommendations for the authenticated user
 * @param token - Clerk auth token
 * @param params - Query parameters for recommendations
 * @returns Promise<Recommendation[]>
 */
export async function getRecommendations(
  token: string,
  params?: GetRecommendationsParams
): Promise<Recommendation[]> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.lang) queryParams.append('lang', params.lang);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/users/recommendations?${queryString}` : '/users/recommendations';

  return nestApi<Recommendation[]>(endpoint, {
    method: 'GET',
    token,
  });
}
