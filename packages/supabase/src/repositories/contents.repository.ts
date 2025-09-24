import type { SupabaseClientWithDatabase } from '../lib/config';
import type { Content, Json, SimilarContentRecommendation } from '../types';
import { BaseRepository, type RepositoryLogger } from './base.repository';

export interface ContentUpsertInput {
  url: string;
  canonical_url: string;
  metadata?: Json;
}

export interface ContentUpdateInput {
  title?: string;
  summary?: string | null;
  author?: string | null;
  lang?: string;
  tags?: string[] | null;
  domain?: string | null;
  published_at?: string | null;
  word_count?: number | null;
  fetched_at?: string;
  status?: 'pending' | 'ready' | 'failed' | 'archived';
  metadata?: Json | null;
}

interface SimilarContentResult {
  content_id: string;
  distance: number;
}

export class ContentsRepository extends BaseRepository {
  constructor(client: SupabaseClientWithDatabase, logger?: RepositoryLogger) {
    super(client, logger);
  }

  async upsertContent(data: ContentUpsertInput): Promise<Content> {
    const { data: content, error } = await this.client
      .from('contents')
      .upsert(data, { onConflict: 'url' })
      .select('*')
      .single();

    this.throwIfError(error, 'Failed to upsert content');

    return content as Content;
  }

  async findById(id: string): Promise<Content> {
    const { data, error } = await this.client.from('contents').select('*').eq('id', id).single();

    this.throwIfError(error, `Failed to find content by id ${id}`);

    return data as Content;
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'ready' | 'failed' | 'archived',
  ): Promise<void> {
    const { error } = await this.client.from('contents').update({ status }).eq('id', id);

    this.throwIfError(error, `Failed to update content status to ${status}`);
  }

  async updateContent(id: string, data: ContentUpdateInput): Promise<void> {
    const { error } = await this.client.from('contents').update(data).eq('id', id);

    this.throwIfError(error, `Failed to update content ${id}`);
  }

  async deleteContent(id: string): Promise<void> {
    const { error } = await this.client.from('contents').delete().eq('id', id);

    this.throwIfError(error, `Failed to delete content ${id}`);
  }

  async getMetadata(id: string): Promise<Content['metadata'] | null> {
    const { data, error } = await this.client
      .from('contents')
      .select('metadata')
      .eq('id', id)
      .single();

    this.throwIfError(error, `Failed to get metadata for content ${id}`);

    return (data?.metadata ?? null) as Content['metadata'] | null;
  }

  async getSimilarContents(
    userId: string,
    contentId: string,
    limit = 10,
  ): Promise<SimilarContentRecommendation[]> {
    const { data, error } = await this.client.rpc('similar_to_content', {
      p_content_id: contentId,
      p_limit: limit,
      p_user_id: userId,
    });

    this.throwIfError(error, 'Failed to get similar contents');

    const results = (data as SimilarContentResult[] | null) ?? [];
    if (results.length === 0) {
      return [];
    }

    const contentIds = results
      .map((item) => item.content_id)
      .filter((id): id is string => Boolean(id));

    const uniqueContentIds = Array.from(new Set(contentIds));

    if (uniqueContentIds.length === 0) {
      return [];
    }

    const { data: contents, error: contentError } = await this.client
      .from('contents')
      .select('*')
      .in('id', uniqueContentIds)
      .eq('status', 'ready');

    this.throwIfError(contentError, 'Failed to fetch similar content details');

    const contentMap = new Map<string, Content>(
      ((contents as Content[] | null) ?? []).map((content) => [content.id, content]),
    );

    return results.map((item) => ({
      content_id: item.content_id,
      distance: item.distance,
      score: (2 - item.distance) / 2,
      contents: contentMap.get(item.content_id) ?? null,
    }));
  }
}
