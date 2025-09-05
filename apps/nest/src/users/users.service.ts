import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getRecommendations(userToken: string, limit = 20, lang?: string) {
    // Use user-specific client with RLS
    const userClient = this.supabaseService.getClientForUser(userToken);

    const { data, error } = await userClient.rpc('recommend_feed', {
      p_limit: limit,
      ...(lang && { p_lang: lang }),
    });

    if (error) {
      console.error('Failed to get recommendations:', error);
      throw new InternalServerErrorException('Failed to get recommendations');
    }

    return (data ?? []).map((item) => ({
      ...item,
      // cosine distance ∈ [0,2] → score ∈ [0,1]
      score: (2 - item.distance) / 2,
    }));
  }
}
