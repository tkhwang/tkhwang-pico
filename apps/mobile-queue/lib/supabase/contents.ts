import { createSupabaseClientWithClerkAuth } from '../../utils/supabase';
import type { UserContentWithDetails, TodoFilterType } from '@tkhwang-pico/common';

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

    const { data, error } = await query;

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
