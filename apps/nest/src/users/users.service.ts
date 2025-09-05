import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getRecommendations(userToken: string, limit = 20, lang?: string) {
    // Use user-specific client with RLS
    const userClient = this.supabaseService.getClientForUser(userToken);

    // First get recommendations from RPC
    const { data: recommendations, error: rpcError } = await userClient.rpc(
      'recommend_feed',
      {
        p_limit: limit,
        ...(lang && { p_lang: lang }),
      },
    );

    if (rpcError) {
      console.error('Failed to get recommendations:', rpcError);
      throw new InternalServerErrorException('Failed to get recommendations');
    }

    if (!recommendations || recommendations.length === 0) {
      return [];
    }

    interface RecommendationItem {
      content_id: string;
      distance: number;
    }

    // Type-safe extraction of content IDs
    const contentIds = (recommendations as RecommendationItem[]).map(
      (rec) => rec.content_id,
    );

    // Fetch full content data
    const { data: contents, error: contentError } = await userClient
      .from('contents')
      .select('*')
      .in('id', contentIds);

    if (contentError) {
      console.error('Failed to fetch content details:', contentError);
      throw new InternalServerErrorException('Failed to fetch content details');
    }

    // Create a map for quick lookup
    const contentMap = new Map(
      contents?.map((content) => [content.id, content]) ?? [],
    );

    // Merge recommendations with content data
    return (recommendations as RecommendationItem[]).map((item) => ({
      content_id: item.content_id,
      distance: item.distance,
      // cosine distance ∈ [0,2] → score ∈ [0,1]
      score: (2 - item.distance) / 2,
      contents: contentMap.get(item.content_id) || null,
    }));
  }
}
