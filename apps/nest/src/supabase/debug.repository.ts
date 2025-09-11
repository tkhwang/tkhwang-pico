import { Injectable, Logger } from '@nestjs/common';

import { SupabaseService } from './supabase.service';

interface DebugFailedContentData {
  url: string;
  user_id: string;
  error_code?: number;
  error_message: string;
  error_type?: string;
  metadata?: any;
}

@Injectable()
export class DebugRepository {
  private readonly logger = new Logger(DebugRepository.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.serviceClient;
  }

  async saveFailedContent(data: DebugFailedContentData) {
    const { error } = await this.client
      .from('debug_failed_contents')
      .insert(data);

    if (error) {
      this.logger.error(`Failed to save debug info: ${error.message}`, error);
      // Don't throw - this is best effort logging
    }
  }

  async getFailedContentsByUser(userId: string, limit = 50) {
    const { data, error } = await this.client
      .from('debug_failed_contents')
      .select('*')
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false })
      .limit(limit);

    if (error) {
      this.logger.error(
        `Failed to get debug contents: ${error.message}`,
        error,
      );
      return [];
    }

    return data || [];
  }

  async getFailedContentsByErrorType(errorType: string, limit = 100) {
    const { data, error } = await this.client
      .from('debug_failed_contents')
      .select('*')
      .eq('error_type', errorType)
      .order('attempted_at', { ascending: false })
      .limit(limit);

    if (error) {
      this.logger.error(
        `Failed to get debug contents by error type: ${error.message}`,
        error,
      );
      return [];
    }

    return data || [];
  }
}
