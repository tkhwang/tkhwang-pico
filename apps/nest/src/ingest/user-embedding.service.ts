import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { EVENTS } from '../common/constants/events';

function parsePgvectorString(input: string): number[] {
  // Accept "[0.1,0.2,0.3]" or "{0.1,0.2}" fallback
  const s = input.trim();
  const body = s.startsWith('[')
    ? s.substring(1, s.length - 1)
    : s.startsWith('{')
      ? s.substring(1, s.length - 1)
      : s;
  if (!body) return [];
  return body.split(',').map((v) => Number(v.trim()));
}

function toPgvectorString(vec: number[]): string {
  return `[${vec.join(',')}]`;
}

function avgVectors(vectors: number[][]): number[] {
  if (!vectors.length) return [];
  const dim = vectors[0].length;
  const sum = new Array(dim).fill(0) as number[];
  let count = 0;
  for (const v of vectors) {
    if (v.length !== dim) continue;
    for (let i = 0; i < dim; i++) sum[i] += v[i];
    count++;
  }
  if (count === 0) return [];
  for (let i = 0; i < dim; i++) sum[i] /= count;
  return sum;
}

@Injectable()
export class UserEmbeddingService {
  private readonly logger = new Logger(UserEmbeddingService.name);
  private readonly defaultEmbeddingModel = 'text-embedding-3-small';

  constructor(
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
  ) {}

  /*
   *  Event handlers
   */
  @OnEvent(EVENTS.USER.CONTENT_SAVED, { async: true })
  async onUserContentSaved(payload: { userId: string; contentId: string }) {
    try {
      await this.recomputeForUser(payload.userId);
    } catch (e) {
      this.logger.warn(
        `recomputeForUser on save failed: ${
          e instanceof Error ? e.message : 'Unknown error'
        }`,
      );
    }
  }

  @OnEvent(EVENTS.EMBEDDING.COMPLETED, { async: true })
  async onEmbeddingCompleted(payload: { contentId: string; model?: string }) {
    // Find all users who saved this content and recompute
    const { data: users, error } = await this.supabase.serviceClient
      .from('user_contents')
      .select('user_id')
      .eq('content_id', payload.contentId)
      .limit(1000);
    if (error) return;
    const uniqueUsers = Array.from(
      new Set((users ?? []).map((u) => u.user_id)),
    );
    for (const uid of uniqueUsers) {
      try {
        await this.recomputeForUser(uid, payload.model);
      } catch (e) {
        this.logger.warn(
          `recomputeForUser on embedding completed failed: ${
            e instanceof Error ? e.message : 'Unknown error'
          }`,
        );
      }
    }
  }

  /*
   *  Public methods
   */
  async recomputeForUser(userId: string, model?: string): Promise<boolean> {
    const embeddingModel =
      model ||
      this.config.get<string>('OPENAI_EMBEDDING_MODEL') ||
      this.defaultEmbeddingModel;

    // 1) Fetch user's saved content ids (cap to recent N)
    const { data: saved, error: savedErr } = await this.supabase.serviceClient
      .from('user_contents')
      .select('content_id')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })
      .limit(200);

    if (savedErr) {
      this.logger.error(`Failed to load saved contents: ${savedErr.message}`);
      return false;
    }
    const contentIds = (saved ?? []).map((r) => r.content_id);
    if (contentIds.length === 0) return false;

    // 2) Load embeddings for those contents
    const { data: embRows, error: embErr } = await this.supabase.serviceClient
      .from('content_embeddings')
      .select('content_id, embedding, embedding_model')
      .in('content_id', contentIds)
      .eq('scope', 'summary')
      .eq('chunk_index', 0)
      .eq('embedding_model', embeddingModel)
      .limit(1000);

    if (embErr) {
      this.logger.error(`Failed to load embeddings: ${embErr.message}`);
      return false;
    }

    const vectors: number[][] = [];
    for (const row of embRows ?? []) {
      const raw = row.embedding as unknown as string;
      if (!raw) continue;
      const vec = parsePgvectorString(raw);
      if (vec.length) vectors.push(vec);
    }

    if (vectors.length === 0) {
      this.logger.log(
        `No vectors available for user=${userId} (model=${embeddingModel}).`,
      );
      return false;
    }

    // 3) Average and upsert
    const avg = avgVectors(vectors);
    if (!avg.length) return false;

    const { error: upErr } = await this.supabase.serviceClient
      .from('user_embeddings')
      .upsert({
        user_id: userId,
        source: 'history',
        embedding_model: embeddingModel,
        embedding: toPgvectorString(avg),
        updated_at: new Date().toISOString(),
      });

    if (upErr) {
      this.logger.error(`Failed to upsert user embedding: ${upErr.message}`);
      return false;
    }

    return true;
  }
}
