import { nestApi } from './nest';
import type { Recommendation } from '@tkhwang-pico/common';

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

/**
 * Dismiss a recommendation as not interested
 * @param token - Clerk auth token
 * @param contentId - Content ID to dismiss
 * @returns Promise<void>
 */
export async function dismissRecommendation(token: string, contentId: string): Promise<void> {
  return nestApi(`/users/recommendations/${contentId}/dismiss`, {
    method: 'POST',
    token,
  });
}
