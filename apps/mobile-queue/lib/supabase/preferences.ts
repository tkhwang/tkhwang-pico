import {
  type PreferenceType,
  type UserContentPreferenceTyped as UserContentPreference,
} from '@tkhwang-pico/common';

import { createSupabaseClientWithClerkAuth } from '@/utils/supabase';

// Re-export for convenience
export type { PreferenceType, UserContentPreference };

/**
 * Set or update a user's preference for a content
 * Uses upsert to handle both create and update cases
 */
export async function setContentPreference(
  clerkToken: string,
  userId: string,
  contentId: string,
  preferenceType: PreferenceType,
  reason?: string
): Promise<UserContentPreference> {
  try {
    const supabase = createSupabaseClientWithClerkAuth(clerkToken);

    const { data, error } = await supabase
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

    if (error) {
      console.error('Error setting content preference:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from preference upsert');
    }

    return data as UserContentPreference;
  } catch (error) {
    console.error('Failed to set content preference:', error);
    throw error;
  }
}

/**
 * Get a user's preference for a specific content
 */
export async function getContentPreference(
  clerkToken: string,
  userId: string,
  contentId: string
): Promise<UserContentPreference | null> {
  try {
    const supabase = createSupabaseClientWithClerkAuth(clerkToken);

    const { data, error } = await supabase
      .from('user_content_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows found", which is expected
      console.error('Error getting content preference:', error);
      throw error;
    }

    return data as UserContentPreference | null;
  } catch (error) {
    console.error('Failed to get content preference:', error);
    throw error;
  }
}

/**
 * Get all preferences for a user, optionally filtered by type
 */
export async function getUserPreferences(
  clerkToken: string,
  userId: string,
  preferenceType?: PreferenceType
): Promise<UserContentPreference[]> {
  try {
    const supabase = createSupabaseClientWithClerkAuth(clerkToken);

    let query = supabase
      .from('user_content_preferences')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (preferenceType) {
      query = query.eq('preference_type', preferenceType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }

    return (data as UserContentPreference[]) || [];
  } catch (error) {
    console.error('Failed to get user preferences:', error);
    throw error;
  }
}

/**
 * Remove a user's preference for a content
 */
export async function removeContentPreference(
  clerkToken: string,
  userId: string,
  contentId: string
): Promise<void> {
  try {
    const supabase = createSupabaseClientWithClerkAuth(clerkToken);

    const { error } = await supabase
      .from('user_content_preferences')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', contentId);

    if (error) {
      console.error('Error removing content preference:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to remove content preference:', error);
    throw error;
  }
}

/**
 * Check if content has a specific preference
 * Useful for UI state management
 */
export async function hasPreference(
  clerkToken: string,
  userId: string,
  contentId: string,
  preferenceType: PreferenceType
): Promise<boolean> {
  try {
    const preference = await getContentPreference(clerkToken, userId, contentId);
    return preference?.preference_type === preferenceType;
  } catch (error) {
    console.error('Failed to check preference:', error);
    return false;
  }
}

/**
 * Toggle a preference (like/unlike)
 * If the preference exists and matches, remove it
 * Otherwise, set it
 */
export async function togglePreference(
  clerkToken: string,
  userId: string,
  contentId: string,
  preferenceType: PreferenceType,
  reason?: string
): Promise<{ action: 'set' | 'removed'; preference?: UserContentPreference }> {
  try {
    const existing = await getContentPreference(clerkToken, userId, contentId);

    if (existing && existing.preference_type === preferenceType) {
      // Remove if it's the same preference
      await removeContentPreference(clerkToken, userId, contentId);
      return { action: 'removed' };
    } else {
      // Set or update the preference
      const preference = await setContentPreference(
        clerkToken,
        userId,
        contentId,
        preferenceType,
        reason
      );
      return { action: 'set', preference };
    }
  } catch (error) {
    console.error('Failed to toggle preference:', error);
    throw error;
  }
}
