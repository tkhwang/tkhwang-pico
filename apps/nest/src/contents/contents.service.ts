import { SupabaseService } from './../supabase/supabase.service';
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { redactUrl, toCanonicalUrl } from '../utils/url';
import { EVENTS } from '../common/constants/events';

@Injectable()
export class ContentsService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async saveUrl({ url, userId }: { url: string; userId: string }) {
    let canonicalUrl: string;
    try {
      canonicalUrl = toCanonicalUrl(url);
    } catch (error) {
      throw new BadRequestException(
        `Invalid URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    // 1) contents upsert (정규화된 URL을 키로 사용)
    const { data: contents, error: upsertContentsError } =
      await this.supabaseService.serviceClient
        .from('contents')
        .upsert(
          {
            url: canonicalUrl, // 유니크 키로 사용
            canonical_url: canonicalUrl, // 보조 컬럼
            metadata: { original_url: redactUrl(url) }, // 원본 URL(민감 파라미터 제거)
          },
          { onConflict: 'url' },
        )
        .select('*')
        .single();

    if (upsertContentsError) {
      throw new Error(
        upsertContentsError?.message ?? 'No content returned from upsert',
      );
    }

    // 2) user_contents upsert
    const { error: upsertUserContentsError } =
      await this.supabaseService.serviceClient.from('user_contents').upsert(
        {
          user_id: userId,
          content_id: contents.id,
        },
        { onConflict: 'user_id,content_id' },
      );

    if (upsertUserContentsError) {
      throw new InternalServerErrorException(
        'Failed to save user content link',
      );
    }

    // Emit events for processing and personalization
    this.eventEmitter.emit(EVENTS.CONTENT.CREATED, {
      contentId: contents.id,
      url: canonicalUrl,
      userId,
    });

    this.eventEmitter.emit(EVENTS.USER.CONTENT_SAVED, {
      userId,
      contentId: contents.id,
    });

    return {
      contentId: contents.id,
      status: contents.status, // pending → 워커가 ready로 변경
    };
  }

  async getSimilarContents(contentId: string, limit = 10) {
    const { data, error } = await this.supabaseService.serviceClient.rpc(
      'similar_to_content',
      { p_content_id: contentId, p_limit: limit },
    );

    if (error) throw error;

    return (data ?? []).map((item) => ({
      ...item,
      // cosine distance ∈ [0,2] → score ∈ [0,1]
      score: (2 - item.distance) / 2,
    }));
  }
}
