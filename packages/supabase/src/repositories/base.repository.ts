import type { PostgrestError } from '@supabase/supabase-js';

import type { SupabaseClientWithDatabase } from '../lib/config';

export interface RepositoryLogger {
  log: (message?: unknown, ...optionalParams: unknown[]) => void;
  warn: (message?: unknown, ...optionalParams: unknown[]) => void;
  error: (message?: unknown, ...optionalParams: unknown[]) => void;
}

const defaultLogger: RepositoryLogger = {
  log: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
};

export abstract class BaseRepository {
  protected readonly client: SupabaseClientWithDatabase;
  protected readonly logger: RepositoryLogger;

  protected constructor(
    client: SupabaseClientWithDatabase,
    logger: RepositoryLogger = defaultLogger,
  ) {
    this.client = client;
    this.logger = logger;
  }

  protected throwIfError(error: PostgrestError | null, message: string): asserts error is null {
    if (error) {
      this.logger.error(`${message}: ${error.message}`, error);
      throw new Error(`${message}: ${error.message}`);
    }
  }
}
