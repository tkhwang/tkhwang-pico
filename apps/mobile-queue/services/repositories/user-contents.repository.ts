import {
  type TodoFilterType,
  UserContentsRepository as BaseUserContentsRepository,
  type UserContentWithDetails,
} from '@tkhwang-pico/supabase';

import { createSupabaseClientWithClerkAuth } from '@/utils/supabase';

/**
 * Repository for managing user contents with Clerk authentication
 * Provides a consistent interface for all user content operations
 */
export class UserContentsRepository {
  private repository: BaseUserContentsRepository;

  constructor(clerkToken: string) {
    const supabase = createSupabaseClientWithClerkAuth(clerkToken);
    this.repository = new BaseUserContentsRepository(supabase);
  }

  /**
   * Get all user contents with optional todo status filtering
   */
  async getUserContents(
    userId: string,
    todoFilter: TodoFilterType = 'all',
  ): Promise<UserContentWithDetails[]> {
    return this.repository.getUserContents(userId, { filter: todoFilter });
  }

  /**
   * Toggle the todo status of a user content between pending and completed
   * @returns true if the new status is 'completed', false if 'pending'
   */
  async toggleTodoStatus(userContentId: string): Promise<boolean> {
    const newStatus = await this.repository.toggleTodoStatus(userContentId);
    return newStatus === 'completed';
  }

  /**
   * Mark a user content as completed
   */
  async markAsComplete(userContentId: string): Promise<boolean> {
    return this.repository.markAsComplete(userContentId);
  }

  /**
   * Mark a user content as pending
   */
  async markAsPending(userContentId: string): Promise<boolean> {
    return this.repository.markAsPending(userContentId);
  }
}
