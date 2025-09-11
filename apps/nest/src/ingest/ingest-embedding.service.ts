import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import OpenAI from 'openai';

import { EVENTS } from '../common/constants/events';
import { APP_ERRORS } from '../consts/app-errors';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class IngestEmbeddingService {
  private readonly logger = new Logger(IngestEmbeddingService.name);
  private readonly openai: OpenAI;
  private readonly defaultEmbeddingModel = 'text-embedding-3-small';
  private readonly pgvectorDimension: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.error('OpenAI API key not configured.');
      throw new Error('OpenAI API key not configured.');
    }

    this.openai = new OpenAI({
      apiKey,
      timeout: 15_000,
      maxRetries: 2,
    });

    // Get expected pgvector dimension from config or use default
    this.pgvectorDimension = this.configService.get<number>(
      'PGVECTOR_DIM',
      1536,
    );
    this.logger.log(`Expected pgvector dimension: ${this.pgvectorDimension}`);
  }

  async upsertSummaryEmbedding(
    contentId: string,
    text: string,
  ): Promise<{ ok: boolean; model?: string }> {
    const cleanedText = (text ?? '').trim();
    if (!cleanedText) {
      this.logger.warn(
        `Skip embedding: empty text for contentId=${contentId.substring(0, 8)}...`,
      );
      return { ok: false };
    }

    const model =
      this.configService.get<string>('OPENAI_EMBEDDING_MODEL') ||
      this.defaultEmbeddingModel;

    try {
      const createEmbeddingsResult = await this.openai.embeddings.create({
        model,
        input: cleanedText,
      });

      const vector: number[] | undefined =
        createEmbeddingsResult.data?.[0]?.embedding;
      if (!vector || vector.length === 0) {
        this.logger.warn(
          `Empty embedding returned for contentId=${contentId.substring(0, 8)}...`,
        );
        return { ok: false };
      }

      // Validate embedding dimension
      if (vector.length !== this.pgvectorDimension) {
        const errorMsg = `Embedding dimension mismatch for contentId=${contentId.substring(0, 8)}... Expected ${this.pgvectorDimension} dimensions but received ${vector.length} dimensions from model ${model}`;
        this.logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      const insertEmbeddingsResult = await this.supabaseService.serviceClient
        .from('content_embeddings')
        .insert({
          content_id: contentId,
          scope: 'summary' as const,
          chunk_index: 0,
          embedding_model: model,
          embedding: this.toPgvectorString(vector),
        })
        .select('id')
        .single();

      if (insertEmbeddingsResult.error) {
        if (
          insertEmbeddingsResult.error.code !==
          APP_ERRORS.POSTGRES.UNIQUE_VIOLATION
        ) {
          this.logger.error(
            `Insert embedding failed for contentId=${contentId}: ${insertEmbeddingsResult.error.message}`,
          );
          return { ok: false };
        }

        const updateContentEmbeddingsResult =
          await this.supabaseService.serviceClient
            .from('content_embeddings')
            .update({
              embedding: this.toPgvectorString(vector),
              created_at: new Date().toISOString(),
            })
            .eq('content_id', contentId)
            .eq('scope', 'summary')
            .eq('chunk_index', 0)
            .eq('embedding_model', model);

        if (updateContentEmbeddingsResult.error) {
          this.logger.error(
            `Update embedding failed for contentId=${contentId}: ${updateContentEmbeddingsResult.error.message}`,
          );
          return { ok: false };
        }
      }

      // Notify downstream that this content's embedding is ready
      this.eventEmitter.emit(EVENTS.EMBEDDING.COMPLETED, { contentId, model });

      return { ok: true, model };
    } catch (error) {
      this.logger.error(
        `Failed to upsert summary embedding: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      return { ok: false };
    }
  }

  /*
   *  Private methods
   */

  private toPgvectorString(vec: number[]): string {
    // pgvector accepts text format like "[0.1,0.2,0.3]"
    return `[${vec.join(',')}]`;
  }
}
