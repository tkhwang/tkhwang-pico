export const EVENTS = {
  CONTENT: {
    CREATED: 'content.created',
    PROCESSING: 'content.processing',
    READY: 'content.ready',
    FAILED: 'content.failed',
    UPDATED: 'content.updated',
    DELETED: 'content.deleted',
  },
  USER: {
    CONTENT_SAVED: 'user.content.saved',
    CONTENT_ARCHIVED: 'user.content.archived',
    CONTENT_SHARED: 'user.content.shared',
    PREFERENCE_UPDATED: 'user.preference.updated',
  },
  EMBEDDING: {
    REQUESTED: 'embedding.requested',
    COMPLETED: 'embedding.completed',
    FAILED: 'embedding.failed',
  },
  INGEST: {
    STARTED: 'ingest.started',
    COMPLETED: 'ingest.completed',
    FAILED: 'ingest.failed',
  },
} as const;

// Type helpers
export type ContentEventType =
  (typeof EVENTS.CONTENT)[keyof typeof EVENTS.CONTENT];
export type UserEventType = (typeof EVENTS.USER)[keyof typeof EVENTS.USER];
export type EmbeddingEventType =
  (typeof EVENTS.EMBEDDING)[keyof typeof EVENTS.EMBEDDING];
export type IngestEventType =
  (typeof EVENTS.INGEST)[keyof typeof EVENTS.INGEST];

export type AllEventTypes =
  | ContentEventType
  | UserEventType
  | EmbeddingEventType
  | IngestEventType;
