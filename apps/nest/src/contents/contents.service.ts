import { ContentsRepository } from '../supabase/contents.repository';
import { UserContentsRepository } from '../supabase/user-contents.repository';
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
    private readonly eventEmitter: EventEmitter2,
    private readonly contentsRepository: ContentsRepository,
    private readonly userContentsRepository: UserContentsRepository,
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
    const contents = await this.contentsRepository.upsertContent({
      url: canonicalUrl, // 유니크 키로 사용
      canonical_url: canonicalUrl, // 보조 컬럼
      metadata: { original_url: redactUrl(url) }, // 원본 URL(민감 파라미터 제거)
    });

    // 2) user_contents upsert
    try {
      await this.userContentsRepository.linkUserContent(userId, contents.id);
    } catch {
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
    return this.contentsRepository.getSimilarContents(contentId, limit);
  }
}
