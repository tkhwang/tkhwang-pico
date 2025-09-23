import type { PostgrestError } from '@supabase/supabase-js';

import type { SupabaseClientWithDatabase } from '../lib/config';
import type {
  ContentTodoStatus,
  TodoFilterType,
  UserContentPreferenceTyped,
  UserContentWithDetails,
} from '../types';

export interface GetUserContentsOptions {
  filter?: TodoFilterType;
}

export class UserContentsRepository {
  constructor(private readonly client: SupabaseClientWithDatabase) {}

  async getUserContents(
    userId: string,
    { filter = 'all' }: GetUserContentsOptions = {}
  ): Promise<UserContentWithDetails[]> {
    try {
      let query = this.client
        .from('user_contents')
        .select(
          `
          *,
          contents:contents!content_id(*)
        `
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

      const [{ data, error }, { data: preferenceData, error: preferencesError }] =
        await Promise.all([
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
    } catch (error) {
      console.error('Failed to fetch user contents:', error);
      throw error;
    }
  }

  async toggleTodoStatus(userContentId: string): Promise<ContentTodoStatus> {
    try {
      const { data: currentItem, error: fetchError } = await this.client
        .from('user_contents')
        .select('todo_status')
        .eq('id', userContentId)
        .single();

      this.assertNoError(fetchError, 'Error fetching current status');

      const newStatus: ContentTodoStatus =
        (currentItem?.todo_status as ContentTodoStatus) === 'completed' ? 'pending' : 'completed';

      const { error: updateError } = await this.client
        .from('user_contents')
        .update({
          todo_status: newStatus,
        })
        .eq('id', userContentId);

      this.assertNoError(updateError, 'Error updating todo status');

      return newStatus;
    } catch (error) {
      console.error('Failed to toggle todo status:', error);
      throw error;
    }
  }

  async markAsComplete(userContentId: string): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('user_contents')
        .update({ todo_status: 'completed' })
        .eq('id', userContentId)
        .select('id')
        .single();

      this.assertNoError(error, 'Error marking as complete');

      return true;
    } catch (error) {
      console.error('Failed to mark as complete:', error);
      throw error;
    }
  }

  async markAsPending(userContentId: string): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('user_contents')
        .update({
          todo_status: 'pending',
          completed_at: null,
        })
        .eq('id', userContentId);

      this.assertNoError(error, 'Error marking as pending');

      return true;
    } catch (error) {
      console.error('Failed to mark as pending:', error);
      throw error;
    }
  }

  private assertNoError(error: PostgrestError | null, message: string): asserts error is null {
    if (error) {
      throw new Error(`${message}: ${error.message}`);
    }
  }
}
