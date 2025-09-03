import { createSupabaseClientWithClerkAuth } from '../../utils/supabase';
import type { UserContentWithDetails } from '@tkhwang-pico/common';

export async function getUserContents(
  clerkToken: string,
  userId: string
): Promise<UserContentWithDetails[]> {
  try {
    const supabase = createSupabaseClientWithClerkAuth(clerkToken);

    const { data, error } = await supabase
      .from('user_contents')
      .select(
        `
        *,
        contents!content_id(*)
      `
      )
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error) {
      console.error('Error fetching user contents:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch user contents:', error);
    throw error;
  }
}
