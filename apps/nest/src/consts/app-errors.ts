const POSTGRES_ERROR_CODES = {
  UNIQUE_VIOLATION: '23505',
} as const;

export const APP_ERRORS = {
  POSTGRES: POSTGRES_ERROR_CODES,
} as const;
