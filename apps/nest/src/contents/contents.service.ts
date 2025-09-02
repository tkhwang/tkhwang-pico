import { SupabaseService } from './../supabase/supabase.service';
import { Injectable, BadRequestException } from '@nestjs/common';
import { toCanonicalUrl } from '../utils/url';

@Injectable()
export class ContentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async saveUrl({
    url,
    userId,
    isPublic = false,
  }: {
    url: string;
    userId: string;
    isPublic?: boolean;
  }) {
    let canonicalUrl: string;
    try {
      canonicalUrl = toCanonicalUrl(url);
    } catch (error) {
      throw new BadRequestException(
        `Invalid URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    const { data: contents, error: errorOfUpsert } =
      await this.supabaseService.client
        .from('contents')
        .upsert(
          { url: canonicalUrl, is_public: isPublic },
          { onConflict: 'url' },
        )
        .select('*')
        .single();

    if (errorOfUpsert) {
      throw new Error(
        errorOfUpsert?.message ?? 'No content returned from upsert',
      );
    }

    const { error: errorOfUpsertUserContents } =
      await this.supabaseService.client.from('user_contents').upsert(
        {
          user_id: userId,
          content_id: contents.id,
        },
        { onConflict: 'user_id,content_id' },
      );

    if (errorOfUpsertUserContents) {
      throw new Error(errorOfUpsertUserContents.message);
    }

    return {
      contentId: contents.id,
      status: contents.status,
    };
  }

  async getSimilarContents(contentId: string, limit = 10) {
    const { data, error } = await this.supabaseService.client.rpc(
      'similar_to_content',
      { p_content_id: contentId, p_limit: limit },
    );

    if (error) throw error;

    return (data ?? []).map((item) => ({
      ...item,
      // map distance∈[0,2] → score∈[0,1]
      score: (2 - item.distance) / 2,
    }));
  }
}
