import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { HtmlCacheService } from '../cache/html-cache.service';
import { EVENTS } from '../common/constants/events';
import { IngestExtractService } from '../ingest/ingest-extract.service';
import { ContentsRepository } from '../supabase/contents.repository';
import { DebugRepository } from '../supabase/debug.repository';
import { UserContentsRepository } from '../supabase/user-contents.repository';
import { redactUrl, toCanonicalUrl } from '../utils/url';

@Injectable()
export class ContentsService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly ingestExtractService: IngestExtractService,
    private readonly htmlCache: HtmlCacheService,
    private readonly contentsRepository: ContentsRepository,
    private readonly userContentsRepository: UserContentsRepository,
    private readonly debugRepository: DebugRepository,
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

    // 1) Try to fetch the URL first to validate it's accessible
    let html: string;
    try {
      html = await this.ingestExtractService.fetchHtml(canonicalUrl);
    } catch (fetchError) {
      // Save debug info for failed fetch
      await this.debugRepository.saveFailedContent({
        url: canonicalUrl,
        user_id: userId,
        error_message:
          fetchError instanceof Error
            ? fetchError.message
            : 'Failed to fetch URL',
        error_type: this.ingestExtractService.getErrorType(fetchError),
        metadata: { original_url: redactUrl(url) },
      });

      // Determine appropriate error response based on error type
      const errorType = this.ingestExtractService.getErrorType(fetchError);
      const errorResponse = this.getErrorResponse(errorType, fetchError);

      throw new HttpException(errorResponse.message, errorResponse.statusCode);
    }

    // 2) If fetch succeeded, save to database
    const contents = await this.contentsRepository.upsertContent({
      url: canonicalUrl, // 유니크 키로 사용
      canonical_url: canonicalUrl, // 보조 컬럼
      metadata: { original_url: redactUrl(url) }, // 원본 URL(민감 파라미터 제거)
    });

    // 3) Cache the HTML for later use by IngestService
    this.htmlCache.set(contents.id, html, canonicalUrl);

    // 4) user_contents upsert
    try {
      await this.userContentsRepository.linkUserContent(userId, contents.id);
    } catch {
      throw new InternalServerErrorException(
        'Failed to save user content link',
      );
    }

    // 5) Emit events for processing and personalization
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

  /*
   *  Private methods
   */
  private getErrorResponse(
    errorType: string,
    error: unknown,
  ): { message: string; statusCode: number } {
    let message = 'Failed to access the URL';
    let statusCode = HttpStatus.BAD_REQUEST;

    switch (errorType) {
      case 'access_denied':
        message =
          'Access denied. The website requires authentication or blocks automated access.';
        statusCode = HttpStatus.FORBIDDEN;
        break;
      case 'not_found':
        message = 'The URL does not exist or has been removed.';
        statusCode = HttpStatus.NOT_FOUND;
        break;
      case 'timeout':
        message =
          'The website took too long to respond. Please try again later.';
        statusCode = HttpStatus.REQUEST_TIMEOUT;
        break;
      case 'unsupported_protocol':
        message = 'Only HTTP and HTTPS URLs are supported.';
        break;
      case 'unsupported_content':
        message = 'The URL does not contain HTML content.';
        break;
      case 'security_block':
        message = 'The URL points to a private or restricted network.';
        statusCode = HttpStatus.FORBIDDEN;
        break;
      case 'too_large':
        message = 'The content is too large to process.';
        statusCode = HttpStatus.PAYLOAD_TOO_LARGE;
        break;
      case 'network_error':
        message =
          'Unable to connect to the website. Please check the URL and try again.';
        statusCode = HttpStatus.SERVICE_UNAVAILABLE;
        break;
      default:
        message = `Failed to access the URL: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
    }

    return { message, statusCode };
  }
}
