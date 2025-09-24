import { Logger } from '@nestjs/common';

import type { RepositoryLogger } from '@tkhwang-pico/supabase';

export const createRepositoryLogger = (context: string): RepositoryLogger => {
  const logger = new Logger(context);
  return {
    log: (message?: unknown, ...optionalParams: unknown[]) =>
      logger.log(message, ...optionalParams),
    warn: (message?: unknown, ...optionalParams: unknown[]) =>
      logger.warn(message, ...optionalParams),
    error: (message?: unknown, ...optionalParams: unknown[]) =>
      logger.error(message, ...optionalParams),
  };
};
