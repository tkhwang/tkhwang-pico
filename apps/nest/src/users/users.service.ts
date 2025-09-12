import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service';
import { UserContentsRepository } from '../supabase/user-contents.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly userContentsRepository: UserContentsRepository,
  ) {}

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
      this.logger.error('Failed to get recommendations:', rpcError);
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
      this.logger.error('Failed to fetch content details:', contentError);
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

  async deleteUserContent(userId: string, contentId: string) {
    // First check if the user_content link exists and belongs to the user
    const userContent = await this.userContentsRepository.findByUserAndContent(
      userId,
      contentId,
    );

    if (!userContent) {
      this.logger.error(
        `No user_content link found for userId=${userId}, contentId=${contentId}`,
      );
      throw new NotFoundException(
        `Content with ID ${contentId} not found for this user`,
      );
    }

    // Delete the user_content link - now with user_id check
    await this.userContentsRepository.deleteByUserAndContent(userId, contentId);
    this.logger.log(
      `Successfully deleted user_content link for userId=${userId}, contentId=${contentId}`,
    );

    return {
      success: true,
      message: 'User content link deleted successfully',
      deletedContentId: contentId,
    };
  }
}
