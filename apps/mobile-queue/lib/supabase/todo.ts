import { createSupabaseClientWithClerkAuth } from '../../utils/supabase';

export async function toggleTodoStatus(
  clerkToken: string,
  userContentId: string
): Promise<boolean> {
  try {
    const supabase = createSupabaseClientWithClerkAuth(clerkToken);

    // First, get the current status
    const { data: currentItem, error: fetchError } = await supabase
      .from('user_contents')
      .select('todo_status')
      .eq('id', userContentId)
      .single();

    if (fetchError) {
      console.error('Error fetching current status:', fetchError);
      throw fetchError;
    }

    // Toggle the status
    const newStatus = currentItem.todo_status === 'completed' ? 'pending' : 'completed';

    // Update the status
    const { error: updateError } = await supabase
      .from('user_contents')
      .update({
        todo_status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', userContentId);

    if (updateError) {
      console.error('Error updating todo status:', updateError);
      throw updateError;
    }

    return true;
  } catch (error) {
    console.error('Failed to toggle todo status:', error);
    throw error;
  }
}

export async function markAsComplete(clerkToken: string, userContentId: string): Promise<boolean> {
  try {
    const supabase = createSupabaseClientWithClerkAuth(clerkToken);

    const { error } = await supabase
      .from('user_contents')
      .update({
        todo_status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', userContentId);

    if (error) {
      console.error('Error marking as complete:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to mark as complete:', error);
    throw error;
  }
}

export async function markAsPending(clerkToken: string, userContentId: string): Promise<boolean> {
  try {
    const supabase = createSupabaseClientWithClerkAuth(clerkToken);

    const { error } = await supabase
      .from('user_contents')
      .update({
        todo_status: 'pending',
        completed_at: null,
      })
      .eq('id', userContentId);

    if (error) {
      console.error('Error marking as pending:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to mark as pending:', error);
    throw error;
  }
}
