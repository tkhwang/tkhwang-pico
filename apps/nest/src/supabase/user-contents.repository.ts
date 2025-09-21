import { Injectable, Logger } from '@nestjs/common';

import { SupabaseService } from './supabase.service';

// interface UserContentLink {
//   user_id: string;
//   content_id: string;
// }

@Injectable()
export class UserContentsRepository {
  private readonly logger = new Logger(UserContentsRepository.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.serviceClient;
  }

  async linkUserContent(userId: string, contentId: string) {
    const { error } = await this.client.from('user_contents').upsert(
      {
        user_id: userId,
        content_id: contentId,
      },
      { onConflict: 'user_id,content_id' },
    );

    if (error) {
      this.logger.error(`Failed to link user content: ${error.message}`);
      throw error;
    }
  }

  async deleteByContentId(contentId: string) {
    const { error } = await this.client.from('user_contents').delete().eq('content_id', contentId);

    if (error) {
      this.logger.error(
        `Failed to delete user_contents for content ${contentId}: ${error.message}`,
      );
      // Don't throw here as this might be a cleanup operation
    }
  }

  async deleteByUserAndContent(userId: string, contentId: string) {
    const { error } = await this.client
      .from('user_contents')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', contentId);

    if (error) {
      this.logger.error(
        `Failed to delete user_content for user ${userId} and content ${contentId}: ${error.message}`,
      );
      throw error;
    }
  }

  async deleteByUserId(userId: string) {
    const { error } = await this.client.from('user_contents').delete().eq('user_id', userId);

    if (error) {
      this.logger.error(`Failed to delete user_contents for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  async findByUserId(
    userId: string,
    filters?: {
      archived?: boolean;
      todo_status?: 'pending' | 'completed';
      limit?: number;
      offset?: number;
    },
  ) {
    let query = this.client.from('user_contents').select('*, contents(*)').eq('user_id', userId);

    if (filters?.archived !== undefined) {
      query = query.eq('archived', filters.archived);
    }

    if (filters?.todo_status) {
      query = query.eq('todo_status', filters.todo_status);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query.order('saved_at', { ascending: false });

    if (error) {
      this.logger.error(`Failed to find user contents: ${error.message}`);
      throw error;
    }

    return data;
  }

  async findByUserAndContent(userId: string, contentId: string) {
    const { data, error } = await this.client
      .from('user_contents')
      .select('*')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .maybeSingle();

    if (error) {
      this.logger.error(`Failed to find user content link: ${error.message}`);
      throw error;
    }

    return data;
  }

  async updateUserContent(
    userId: string,
    contentId: string,
    updates: {
      archived?: boolean;
      todo_status?: 'pending' | 'completed';
      note?: string | null;
      labels?: string[] | null;
      completed_at?: string | null;
    },
  ) {
    const { error } = await this.client
      .from('user_contents')
      .update(updates)
      .eq('user_id', userId)
      .eq('content_id', contentId);

    if (error) {
      this.logger.error(`Failed to update user content: ${error.message}`);
      throw error;
    }
  }
}
