import type { SupabaseClientWithDatabase } from '../lib/config';
import type {
  Content,
  ContentTodoStatus,
  Enums,
  TablesInsert,
  TodoFilterType,
  UserContent,
  UserContentPreferenceTyped,
  UserContentWithDetails,
} from '../types';
import type { Database, Json } from '../types/supabase-database.types';
import { BaseRepository, type RepositoryLogger } from './base.repository';

export interface GetUserContentsOptions {
  filter?: TodoFilterType;
  userId?: string;
}

export interface FindUserContentsFilters {
  archived?: boolean;
  todo_status?: ContentTodoStatus;
  limit?: number;
  offset?: number;
}

export interface UpdateUserContentInput {
  archived?: boolean;
  todo_status?: ContentTodoStatus;
  note?: string | null;
  labels?: string[] | null;
  completed_at?: string | null;
}

type ContentPriority = Enums<'content_priority'>;

type GetUserContentsRpcRow =
  Database['public']['Functions']['get_user_contents']['Returns'][number];
type PreferenceRow = Database['public']['Tables']['user_content_preferences']['Row'];

const isJsonRecord = (value: Json): value is Record<string, Json> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeContent = (value: Json): Content | undefined =>
  isJsonRecord(value) ? (value as unknown as Content) : undefined;

const normalizePreferences = (value: Json): UserContentPreferenceTyped[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((preference): preference is Record<string, Json> => isJsonRecord(preference))
    .map((preference) => {
      const rawPreference = preference as PreferenceRow;
      return {
        ...rawPreference,
        preference_type:
          rawPreference.preference_type as UserContentPreferenceTyped['preference_type'],
      } as UserContentPreferenceTyped;
    });
};

const mapRpcRowToUserContent = (row: GetUserContentsRpcRow): UserContentWithDetails => {
  const { contents, preferences, ...userContentFields } = row;

  return {
    ...(userContentFields as UserContent),
    contents: normalizeContent(contents),
    preferences: normalizePreferences(preferences),
  };
};

interface LinkUserContentOptions {
  scheduledFor?: string | null;
  priority?: ContentPriority;
}

export class UserContentsRepository extends BaseRepository {
  constructor(client: SupabaseClientWithDatabase, logger?: RepositoryLogger) {
    super(client, logger);
  }

  async linkUserContent(
    userId: string,
    contentId: string,
    options?: LinkUserContentOptions,
  ): Promise<void> {
    const upsertData: TablesInsert<'user_contents'> = {
      user_id: userId,
      content_id: contentId,
    };

    if (options?.scheduledFor !== undefined) upsertData.scheduled_for = options.scheduledFor;
    if (options?.priority !== undefined) upsertData.priority = options.priority;

    const { error } = await this.client
      .from('user_contents')
      .upsert(upsertData, { onConflict: 'user_id,content_id' });

    if (error) {
      this.logger.error(`Failed to link user content: ${error.message}`);
      throw error;
    }
  }

  async deleteByContentId(contentId: string): Promise<void> {
    const { error } = await this.client.from('user_contents').delete().eq('content_id', contentId);

    if (error) {
      this.logger.error(
        `Failed to delete user_contents for content ${contentId}: ${error.message}`,
      );
      // Best-effort cleanup; keep processing even on failure
    }
  }

  async deleteByUserAndContent(userId: string, contentId: string): Promise<void> {
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

  async deleteByUserId(userId: string): Promise<void> {
    const { error } = await this.client.from('user_contents').delete().eq('user_id', userId);

    if (error) {
      this.logger.error(`Failed to delete user_contents for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  async findByUserId(
    userId: string,
    filters?: FindUserContentsFilters,
  ): Promise<UserContentWithDetails[]> {
    let query = this.client.from('user_contents').select('*, contents(*)').eq('user_id', userId);

    if (filters?.archived !== undefined) {
      query = query.eq('archived', filters.archived);
    }

    if (filters?.todo_status) {
      query = query.eq('todo_status', filters.todo_status);
    }

    if (typeof filters?.limit === 'number') {
      query = query.limit(filters.limit);
    }

    if (typeof filters?.offset === 'number') {
      const rangeLimit = typeof filters?.limit === 'number' ? filters.limit : 10;
      query = query.range(filters.offset, filters.offset + rangeLimit - 1);
    }

    const { data, error } = await query.order('saved_at', { ascending: false });

    if (error) {
      this.logger.error(`Failed to find user contents: ${error.message}`);
      throw error;
    }

    return (data || []) as UserContentWithDetails[];
  }

  async findByUserAndContent(userId: string, contentId: string): Promise<UserContent | null> {
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

    return (data as UserContent | null) ?? null;
  }

  async updateUserContent(
    userId: string,
    contentId: string,
    updates: UpdateUserContentInput,
  ): Promise<void> {
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

  async getUserContents({ userId, filter = 'all' }: GetUserContentsOptions = {}): Promise<
    UserContentWithDetails[]
  > {
    const statusFilter = filter === 'all' ? undefined : filter;

    const { data, error } = await this.client.rpc('get_user_contents', {
      p_status: statusFilter,
    });

    this.throwIfError(error, 'Error fetching user contents');

    const rows = (data ?? []) as GetUserContentsRpcRow[];
    const targetRows = userId ? rows.filter((row) => row.user_id === userId) : rows;

    if (userId && targetRows.length !== rows.length) {
      this.logger.warn(
        `get_user_contents RPC returned rows for mismatched user. Expected ${userId}.`,
      );
    }

    return targetRows.map(mapRpcRowToUserContent);
  }

  async toggleTodoStatus(userContentId: string): Promise<ContentTodoStatus> {
    const { data, error } = await this.client.rpc('toggle_user_content_status', {
      p_user_content_id: userContentId,
    });

    this.throwIfError(error, 'Failed to toggle todo status');

    if (!data) {
      throw new Error('Failed to toggle todo status: No data returned from RPC.');
    }

    return data;
  }

  async markAsComplete(userContentId: string): Promise<boolean> {
    const { error } = await this.client
      .from('user_contents')
      .update({ todo_status: 'completed' })
      .eq('id', userContentId)
      .select('id')
      .single();

    this.throwIfError(error, 'Error marking as complete');

    return true;
  }

  async markAsPending(userContentId: string): Promise<boolean> {
    const { error } = await this.client
      .from('user_contents')
      .update({
        todo_status: 'pending',
        completed_at: null,
      })
      .eq('id', userContentId);

    this.throwIfError(error, 'Error marking as pending');

    return true;
  }
}
