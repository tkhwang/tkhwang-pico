import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SupabaseService } from '../supabase/supabase.service';
import { IngestExtractService } from './ingest-extract.service';
import { IngestSummaryService } from './ingest-summary.service';
import { EVENTS } from '../common/constants/events';

export interface ContentCreatedEvent {
  contentId: string;
  url: string;
  userId: string;
}

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly extractService: IngestExtractService,
    private readonly summaryService: IngestSummaryService,
  ) {}

  @OnEvent(EVENTS.CONTENT.CREATED)
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

      // Fetch HTML
      this.logger.log(`Fetching HTML for ${url}`);
      const html = await this.extractService.fetchHtml(url);

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
      const { data: existingMetaRow } = await this.supabaseService.serviceClient
        .from('contents')
        .select('metadata')
        .eq('id', contentId)
        .single();

      // Ensure metadata is an object before spreading
      const existingMeta = existingMetaRow?.metadata;
      const baseMetadata =
        typeof existingMeta === 'object' &&
        existingMeta !== null &&
        !Array.isArray(existingMeta)
          ? existingMeta
          : {};

      const mergedMetadata = {
        ...baseMetadata,
        image_url: metadata.imageUrl,
        site_name: metadata.siteName,
      };

      const { error } = await this.supabaseService.serviceClient
        .from('contents')
        .update({
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
        })
        .eq('id', contentId);

      if (error) {
        throw new Error(`Failed to update content: ${error.message}`);
      }

      this.logger.log(`Successfully processed content: ${contentId}`);
    } catch (error) {
      this.logger.error(
        `Error processing content ${contentId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );

      // Update status to failed
      await this.updateContentStatus(contentId, 'failed');
      throw error;
    }
  }

  private async updateContentStatus(
    contentId: string,
    status: 'pending' | 'ready' | 'failed' | 'archived',
  ) {
    const { error } = await this.supabaseService.serviceClient
      .from('contents')
      .update({ status })
      .eq('id', contentId);

    if (error) {
      this.logger.error(
        `Failed to update content status to ${status}: ${error.message}`,
      );
    }
  }
}
