import type { PostgrestError } from '@supabase/supabase-js';

import type { SupabaseClientWithDatabase } from '../lib/config';

export abstract class BaseRepository {
  protected readonly client: SupabaseClientWithDatabase;

  protected constructor(client: SupabaseClientWithDatabase) {
    this.client = client;
  }

  protected assertNoError(error: PostgrestError | null, message: string): asserts error is null {
    if (error) {
      throw new Error(`${message}: ${error.message}`);
    }
  }
}
