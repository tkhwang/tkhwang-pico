import type { PostgrestError } from '@supabase/supabase-js';

import type { SupabaseClientWithDatabase } from '../lib/config';
import type { PreferenceType, UserContentPreferenceTyped } from '../types';

export class UserContentsPreferencesRepository {
  constructor(private readonly client: SupabaseClientWithDatabase) {}

  async setContentPreference(
    userId: string,
    contentId: string,
    preferenceType: PreferenceType,
    reason?: string
  ): Promise<UserContentPreferenceTyped> {
    try {
      const { data, error } = await this.client
        .from('user_content_preferences')
        .upsert(
          {
            user_id: userId,
            content_id: contentId,
            preference_type: preferenceType,
            reason: reason || null,
          },
          { onConflict: 'user_id,content_id' }
        )
        .select()
        .single();

      this.assertNoError(error, 'Error setting content preference');

      if (!data) {
        throw new Error('No data returned from preference upsert');
      }

      return {
        ...data,
        preference_type: preferenceType,
      } satisfies UserContentPreferenceTyped;
    } catch (error) {
      console.error('Failed to set content preference:', error);
      throw error;
    }
  }

  async getContentPreference(
    userId: string,
    contentId: string
  ): Promise<UserContentPreferenceTyped | null> {
    try {
      const { data, error } = await this.client
        .from('user_content_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('content_id', contentId)
        .single();

      if (error?.code === 'PGRST116') {
        return null;
      }

      this.assertNoError(error, 'Error getting content preference');

      if (!data) {
        return null;
      }

      return {
        ...data,
        preference_type: data.preference_type as PreferenceType,
      } satisfies UserContentPreferenceTyped;
    } catch (error) {
      console.error('Failed to get content preference:', error);
      throw error;
    }
  }

  async getUserPreferences(
    userId: string,
    preferenceType?: PreferenceType
  ): Promise<UserContentPreferenceTyped[]> {
    try {
      let query = this.client
        .from('user_content_preferences')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (preferenceType) {
        query = query.eq('preference_type', preferenceType);
      }

      const { data, error } = await query;

      this.assertNoError(error, 'Error getting user preferences');

      return (data || []).map((preference) => ({
        ...preference,
        preference_type: preference.preference_type as PreferenceType,
      }));
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      throw error;
    }
  }

  async removeContentPreference(userId: string, contentId: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('user_content_preferences')
        .delete()
        .eq('user_id', userId)
        .eq('content_id', contentId);

      this.assertNoError(error, 'Error removing content preference');
    } catch (error) {
      console.error('Failed to remove content preference:', error);
      throw error;
    }
  }

  async hasPreference(
    userId: string,
    contentId: string,
    preferenceType: PreferenceType
  ): Promise<boolean> {
    const preference = await this.getContentPreference(userId, contentId);
    return preference?.preference_type === preferenceType;
  }

  async togglePreference(
    userId: string,
    contentId: string,
    preferenceType: PreferenceType,
    reason?: string
  ): Promise<{ action: 'set' | 'removed'; preference?: UserContentPreferenceTyped }> {
    try {
      const existing = await this.getContentPreference(userId, contentId);

      if (existing && existing.preference_type === preferenceType) {
        await this.removeContentPreference(userId, contentId);
        return { action: 'removed' };
      }

      const preference = await this.setContentPreference(userId, contentId, preferenceType, reason);
      return { action: 'set', preference };
    } catch (error) {
      console.error('Failed to toggle preference:', error);
      throw error;
    }
  }

  private assertNoError(error: PostgrestError | null, message: string): asserts error is null {
    if (error) {
      throw new Error(`${message}: ${error.message}`);
    }
  }
}
