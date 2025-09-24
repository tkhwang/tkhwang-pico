import type {
  PreferenceType,
  TogglePreferenceResult,
  UserContentPreferenceTyped,
} from '@tkhwang-pico/supabase';
import { UserContentsPreferencesRepository as BaseUserContentsPreferencesRepository } from '@tkhwang-pico/supabase';

import { createSupabaseClientWithClerkAuth } from '@/utils/supabase';

// Re-export for convenience
export type { PreferenceType, UserContentPreferenceTyped as UserContentPreference };

/**
 * Repository for managing user content preferences with Clerk authentication
 * Handles likes, bookmarks, and other user preferences for content
 */
export class UserContentsPreferencesRepository {
  private repository: BaseUserContentsPreferencesRepository;

  constructor(clerkToken: string) {
    const supabase = createSupabaseClientWithClerkAuth(clerkToken);
    this.repository = new BaseUserContentsPreferencesRepository(supabase);
  }

  /**
   * Set or update a user's preference for a content
   * Uses upsert to handle both create and update cases
   */
  async setContentPreference(
    userId: string,
    contentId: string,
    preferenceType: PreferenceType,
    reason?: string,
  ): Promise<UserContentPreferenceTyped> {
    return this.repository.setContentPreference(userId, contentId, preferenceType, reason);
  }

  /**
   * Get a user's preference for a specific content
   */
  async getContentPreference(
    userId: string,
    contentId: string,
  ): Promise<UserContentPreferenceTyped | null> {
    return this.repository.getContentPreference(userId, contentId);
  }

  /**
   * Get all preferences for a user, optionally filtered by type
   */
  async getUserPreferences(
    userId: string,
    preferenceType?: PreferenceType,
  ): Promise<UserContentPreferenceTyped[]> {
    return this.repository.getUserPreferences(userId, preferenceType);
  }

  /**
   * Remove a user's preference for a content
   */
  async removeContentPreference(userId: string, contentId: string): Promise<void> {
    await this.repository.removeContentPreference(userId, contentId);
  }

  /**
   * Check if content has a specific preference
   * Useful for UI state management
   */
  async hasPreference(
    userId: string,
    contentId: string,
    preferenceType: PreferenceType,
  ): Promise<boolean> {
    return this.repository.hasPreference(userId, contentId, preferenceType);
  }

  /**
   * Toggle a preference (like/unlike)
   * If the preference exists and matches, remove it
   * Otherwise, set it
   */
  async togglePreference(
    userId: string,
    contentId: string,
    preferenceType: PreferenceType,
    reason?: string,
  ): Promise<TogglePreferenceResult> {
    return this.repository.togglePreference(userId, contentId, preferenceType, reason);
  }
}
