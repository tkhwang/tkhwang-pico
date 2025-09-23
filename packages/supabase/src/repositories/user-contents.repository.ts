import type { SupabaseClientWithDatabase } from '../lib/config';
import type {
  ContentTodoStatus,
  TodoFilterType,
  UserContentPreferenceTyped,
  UserContentWithDetails,
} from '../types';
import { BaseRepository } from './base.repository';

export interface GetUserContentsOptions {
  filter?: TodoFilterType;
}

export class UserContentsRepository extends BaseRepository {
  constructor(client: SupabaseClientWithDatabase) {
    super(client);
  }

  async getUserContents(
    userId: string,
    { filter = 'all' }: GetUserContentsOptions = {},
  ): Promise<UserContentWithDetails[]> {
    let query = this.client
      .from('user_contents')
      .select(
        `
        *,
        contents:contents!content_id(*)
      `,
      )
      .eq('user_id', userId);

    if (filter !== 'all') {
      query = query.eq('todo_status', filter);
    }

    if (filter === 'completed') {
      query = query.order('completed_at', { ascending: false });
    } else {
      query = query.order('saved_at', { ascending: false });
    }

    const [{ data, error }, { data: preferenceData, error: preferencesError }] = await Promise.all([
      query,
      this.client.from('user_content_preferences').select('*').eq('user_id', userId),
    ]);

    this.assertNoError(error, 'Error fetching user contents');
    this.assertNoError(preferencesError, 'Error fetching content preferences');

    const preferenceMap = new Map<string, UserContentPreferenceTyped[]>();
    preferenceData?.forEach((preference) => {
      const typedPreference: UserContentPreferenceTyped = {
        ...preference,
        preference_type:
          preference.preference_type as UserContentPreferenceTyped['preference_type'],
      };

      const contentPreferences = preferenceMap.get(preference.content_id) ?? [];
      contentPreferences.push(typedPreference);
      preferenceMap.set(preference.content_id, contentPreferences);
    });

    return (data || []).map((item) => ({
      ...(item as UserContentWithDetails),
      preferences: preferenceMap.get(item.content_id) ?? [],
    }));
  }

  async toggleTodoStatus(userContentId: string): Promise<ContentTodoStatus> {
    const { data, error } = await this.client.rpc('toggle_user_content_status', {
      p_user_content_id: userContentId,
    });

    this.assertNoError(error, 'Failed to toggle todo status');

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

    this.assertNoError(error, 'Error marking as complete');

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

    this.assertNoError(error, 'Error marking as pending');

    return true;
  }
}
