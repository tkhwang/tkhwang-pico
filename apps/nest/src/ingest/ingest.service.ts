import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { HtmlCacheService } from '../cache/html-cache.service';
import { EVENTS } from '../common/constants/events';
import { ContentsRepository } from '../supabase/contents.repository';
import { UserContentsRepository } from '../supabase/user-contents.repository';

import { IngestEmbeddingService } from './ingest-embedding.service';
import { IngestExtractService } from './ingest-extract.service';
import { IngestSummaryService } from './ingest-summary.service';

export interface ContentCreatedEvent {
  contentId: string;
  url: string;
  userId: string;
}

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(
    private readonly extractService: IngestExtractService,
    private readonly summaryService: IngestSummaryService,
    private readonly embeddingService: IngestEmbeddingService,
    private readonly htmlCache: HtmlCacheService,
    private readonly contentsRepository: ContentsRepository,
    private readonly userContentsRepository: UserContentsRepository,
  ) {}

  @OnEvent(EVENTS.CONTENT.CREATED, { async: true })
  async handleContentCreated(payload: ContentCreatedEvent) {
    this.logger.log(`Processing content: ${payload.contentId}`);

    try {
      await this.processContent(payload.contentId, payload.url);
    } catch (error) {
      this.logger.error(
        `Failed to process content ${payload.contentId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  async processContent(contentId: string, url: string) {
    try {
      // Keep status as pending during processing
      // Note: Consider adding 'processing' to the database enum if needed

      // Try to get HTML from cache first
      let html = this.htmlCache.get(contentId);

      if (html) {
        this.logger.log(`Using cached HTML for ${url}`);
      } else {
        // Fetch HTML if not in cache
        this.logger.log(`Fetching HTML for ${url} (cache miss)`);
        html = await this.extractService.fetchHtml(url);
        // Write-through so subsequent steps can reuse it
        try {
          this.htmlCache.set(contentId, html, url);
        } catch (e) {
          this.logger.warn(
            `Failed to cache HTML for ${contentId}: ${e instanceof Error ? e.message : 'Unknown error'}`,
          );
        }
      }

      // Extract metadata
      this.logger.log(`Extracting metadata for ${url}`);
      const metadata = this.extractService.extractMetadata(html, url);

      // Generate AI summary if needed
      let finalSummary = metadata.summary;
      const normalizedLang = (metadata.lang || 'en').slice(0, 2).toLowerCase();

      if (!finalSummary || finalSummary.length < 50) {
        this.logger.log(`Generating AI summary for ${url}`);
        const aiSummary = await this.summaryService.generateSummary(
          metadata.summary || metadata.title || '',
          normalizedLang,
        );
        if (aiSummary) {
          finalSummary = aiSummary;
        }
      }

      // Extract keywords if we have OpenAI configured
      let keywords = metadata.tags || [];
      if (keywords.length === 0 && finalSummary) {
        const extractedKeywords =
          await this.summaryService.extractKeywords(finalSummary);
        if (extractedKeywords.length > 0) {
          keywords = extractedKeywords;
        }
      }

      // Preserve existing metadata, then update content in database
      const existingMetadata =
        await this.contentsRepository.getMetadata(contentId);

      // Ensure metadata is an object before spreading
      const baseMetadata =
        typeof existingMetadata === 'object' &&
        existingMetadata !== null &&
        !Array.isArray(existingMetadata)
          ? existingMetadata
          : {};

      const mergedMetadata = {
        ...baseMetadata,
        image_url: metadata.imageUrl,
        site_name: metadata.siteName,
      };

      await this.contentsRepository.updateContent(contentId, {
        title: metadata.title,
        summary: finalSummary,
        author: metadata.author,
        lang: normalizedLang,
        tags: keywords,
        domain: metadata.domain,
        published_at: metadata.publishedAt?.toISOString(),
        word_count: metadata.wordCount,
        fetched_at: new Date().toISOString(),
        status: 'ready',
        metadata: mergedMetadata,
      });

      // Create/Update summary embedding (best-effort; don't fail the whole ingest)
      try {
        const baseText =
          finalSummary || metadata.summary || metadata.title || '';
        const upsertSummaryEmbeddingResult =
          await this.embeddingService.upsertSummaryEmbedding(
            contentId,
            baseText,
          );
        if (!upsertSummaryEmbeddingResult.ok) {
          this.logger.warn(
            `Embedding not saved for contentId=${contentId} (model=${upsertSummaryEmbeddingResult.model ?? 'n/a'})`,
          );
        }
      } catch (e) {
        this.logger.warn(
          `Embedding generation failed for contentId=${contentId}: ${
            e instanceof Error ? e.message : 'Unknown error'
          }`,
        );
      }

      this.logger.log(`Successfully processed content: ${contentId}`);
    } catch (error) {
      this.logger.error(
        `Error processing content ${contentId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );

      // Check if this is an unrecoverable error (403, 404, etc.)
      if (this.extractService.isUnrecoverableError(error)) {
        this.logger.warn(
          `Deleting content ${contentId} due to unrecoverable error: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );

        // Delete from user_contents first (foreign key constraint)
        await this.userContentsRepository.deleteByContentId(contentId);

        // Then delete from contents
        await this.contentsRepository.deleteContent(contentId);
      } else {
        // For recoverable errors, just mark as failed
        await this.contentsRepository.updateStatus(contentId, 'failed');
      }

      throw error;
    }
  }
}
