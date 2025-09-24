import type { SupabaseClientWithDatabase } from '../lib/config';
import type { Database } from '../types';
import { BaseRepository, type RepositoryLogger } from './base.repository';

export type DebugFailedContentInput =
  Database['public']['Tables']['debug_failed_contents']['Insert'];

export class DebugFailedContentsRepository extends BaseRepository {
  constructor(client: SupabaseClientWithDatabase, logger?: RepositoryLogger) {
    super(client, logger);
  }

  async saveFailedContent(data: DebugFailedContentInput): Promise<void> {
    const { error } = await this.client.from('debug_failed_contents').insert(data);

    if (error) {
      this.logger.error(`Failed to save debug info: ${error.message}`, error);
    }
  }
}
