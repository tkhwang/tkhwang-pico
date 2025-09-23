import {
  type TodoFilterType,
  UserContentsRepository,
  type UserContentWithDetails,
} from '@tkhwang-pico/supabase';

import { createSupabaseClientWithClerkAuth } from '@/utils/supabase';

function createRepository(clerkToken: string) {
  const supabase = createSupabaseClientWithClerkAuth(clerkToken);
  return new UserContentsRepository(supabase);
}

export async function toggleUserContentsTodoStatus(
  clerkToken: string,
  userContentId: string,
): Promise<boolean> {
  const repository = createRepository(clerkToken);
  const newStatus = await repository.toggleTodoStatus(userContentId);
  return newStatus === 'completed';
}

export async function getUserContents(
  clerkToken: string,
  userId: string,
  todoFilter: TodoFilterType = 'all',
): Promise<UserContentWithDetails[]> {
  try {
    const repository = createRepository(clerkToken);
    return await repository.getUserContents(userId, { filter: todoFilter });
  } catch (error) {
    console.error('Failed to fetch user contents:', error);
    throw error;
  }
}

export async function markAsComplete(clerkToken: string, userContentId: string): Promise<boolean> {
  const repository = createRepository(clerkToken);
  return repository.markAsComplete(userContentId);
}

export async function markAsPending(clerkToken: string, userContentId: string): Promise<boolean> {
  const repository = createRepository(clerkToken);
  return repository.markAsPending(userContentId);
}
