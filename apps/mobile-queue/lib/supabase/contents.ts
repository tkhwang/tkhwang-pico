import type {
  TodoFilterType,
  UserContentPreference,
  UserContentPreferenceTyped,
  UserContentWithDetails,
} from '@tkhwang-pico/supabase';

import { createSupabaseClientWithClerkAuth } from '../../utils/supabase';

export async function getUserContents(
  clerkToken: string,
  userId: string,
  todoFilter: TodoFilterType = 'all'
): Promise<UserContentWithDetails[]> {
  try {
    const supabase = createSupabaseClientWithClerkAuth(clerkToken);

    let query = supabase
      .from('user_contents')
      .select(
        `
        *,
        contents!content_id(*)
      `
      )
      .eq('user_id', userId);

    // Apply todo status filter
    if (todoFilter !== 'all') {
      query = query.eq('todo_status', todoFilter);
    }

    // Order by saved_at for most filters, but by completed_at for completed items
    if (todoFilter === 'completed') {
      query = query.order('completed_at', { ascending: false });
    } else {
      query = query.order('saved_at', { ascending: false });
    }

    const [{ data, error }, { data: preferenceData, error: preferencesError }] = await Promise.all([
      query,
      supabase.from('user_content_preferences').select('*').eq('user_id', userId),
    ]);

    if (error) {
      console.error('Error fetching user contents:', error);
      throw error;
    }

    if (preferencesError) {
      console.error('Error fetching content preferences:', preferencesError);
      throw preferencesError;
    }

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

    const enrichedData = (data || []).map((item) => {
      return {
        ...item,
        preferences: preferenceMap.get(item.content_id) ?? [],
      };
    });

    return enrichedData;
  } catch (error) {
    console.error('Failed to fetch user contents:', error);
    throw error;
  }
}
