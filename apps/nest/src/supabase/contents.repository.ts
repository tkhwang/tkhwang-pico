import { Injectable, Logger } from '@nestjs/common';
import { QUERY_SIMILAR_CONTENTS_DEFAULT_LIMIT } from 'src/consts/app-consts';

import type { Content, SimilarContentRecommendation } from '@tkhwang-pico/supabase';

import { SupabaseService } from './supabase.service';

interface ContentUpsertData {
  url: string;
  canonical_url: string;
  metadata?: any;
}

interface ContentUpdateData {
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
  metadata?: any;
}

interface SimilarContentResult {
  content_id: string;
  distance: number;
}

@Injectable()
export class ContentsRepository {
  private readonly logger = new Logger(ContentsRepository.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.serviceClient;
  }

  async upsertContent(data: ContentUpsertData) {
    const { data: content, error } = await this.client
      .from('contents')
      .upsert(data, { onConflict: 'url' })
      .select('*')
      .single();

    if (error) {
      this.logger.error(`Failed to upsert content: ${error.message}`);
      throw error;
    }

    return content;
  }

  async findById(id: string) {
    const { data, error } = await this.client.from('contents').select('*').eq('id', id).single();

    if (error) {
      this.logger.error(`Failed to find content by id ${id}: ${error.message}`);
      throw error;
    }

    return data;
  }

  async updateStatus(id: string, status: 'pending' | 'ready' | 'failed' | 'archived') {
    const { error } = await this.client.from('contents').update({ status }).eq('id', id);

    if (error) {
      this.logger.error(`Failed to update content status to ${status}: ${error.message}`);
      throw error;
    }
  }

  async updateContent(id: string, data: ContentUpdateData) {
    const { error } = await this.client.from('contents').update(data).eq('id', id);

    if (error) {
      this.logger.error(`Failed to update content ${id}: ${error.message}`);
      throw error;
    }
  }

  async deleteContent(id: string) {
    const { error } = await this.client.from('contents').delete().eq('id', id);

    if (error) {
      this.logger.error(`Failed to delete content ${id}: ${error.message}`);
      throw error;
    }
  }

  async getMetadata(id: string) {
    const { data, error } = await this.client
      .from('contents')
      .select('metadata')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error(`Failed to get metadata for content ${id}: ${error.message}`);
      throw error;
    }

    return data?.metadata;
  }

  async getSimilarContents(
    userId: string,
    contentId: string,
    limit = QUERY_SIMILAR_CONTENTS_DEFAULT_LIMIT,
  ): Promise<SimilarContentRecommendation[]> {
    const { data, error } = await this.client.rpc('similar_to_content', {
      p_content_id: contentId,
      p_limit: limit,
      p_user_id: userId,
    });

    if (error) {
      this.logger.error(`Failed to get similar contents: ${error.message}`);
      throw error;
    }

    const results = (data as SimilarContentResult[] | null) ?? [];
    if (results.length === 0) {
      return [];
    }

    const contentIds = results.map((item) => item.content_id).filter((id) => id);

    const uniqueContentIds = Array.from(new Set(contentIds));

    if (uniqueContentIds.length === 0) {
      return [];
    }

    const { data: contents, error: contentError } = await this.client
      .from('contents')
      .select('*')
      .in('id', uniqueContentIds)
      .eq('status', 'ready');

    if (contentError) {
      this.logger.error(`Failed to fetch similar content details: ${contentError.message}`);
      throw contentError;
    }

    const contentMap = new Map<string, Content>(
      (contents as Content[] | null)?.map((content) => [content.id, content]) ?? [],
    );

    return results.map((item) => ({
      content_id: item.content_id,
      distance: item.distance,
      // cosine distance ∈ [0,2] → score ∈ [0,1]
      score: (2 - item.distance) / 2,
      contents: contentMap.get(item.content_id) ?? null,
    }));
  }
}
