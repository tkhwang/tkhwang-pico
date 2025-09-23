import type { PreferenceType, UserContentPreferenceTyped } from '@tkhwang-pico/supabase';
import { UserContentsPreferencesRepository } from '@tkhwang-pico/supabase';

import { createSupabaseClientWithClerkAuth } from '@/utils/supabase';

// Re-export for convenience
export type { PreferenceType, UserContentPreferenceTyped as UserContentPreference };

function createRepository(clerkToken: string) {
  const supabase = createSupabaseClientWithClerkAuth(clerkToken);
  return new UserContentsPreferencesRepository(supabase);
}

/**
 * Set or update a user's preference for a content
 * Uses upsert to handle both create and update cases
 */
export async function setContentPreference(
  clerkToken: string,
  userId: string,
  contentId: string,
  preferenceType: PreferenceType,
  reason?: string,
): Promise<UserContentPreferenceTyped> {
  const repository = createRepository(clerkToken);
  return repository.setContentPreference(userId, contentId, preferenceType, reason);
}

/**
 * Get a user's preference for a specific content
 */
export async function getContentPreference(
  clerkToken: string,
  userId: string,
  contentId: string,
): Promise<UserContentPreferenceTyped | null> {
  const repository = createRepository(clerkToken);
  return repository.getContentPreference(userId, contentId);
}

/**
 * Get all preferences for a user, optionally filtered by type
 */
export async function getUserPreferences(
  clerkToken: string,
  userId: string,
  preferenceType?: PreferenceType,
): Promise<UserContentPreferenceTyped[]> {
  const repository = createRepository(clerkToken);
  return repository.getUserPreferences(userId, preferenceType);
}

/**
 * Remove a user's preference for a content
 */
export async function removeContentPreference(
  clerkToken: string,
  userId: string,
  contentId: string,
): Promise<void> {
  const repository = createRepository(clerkToken);
  await repository.removeContentPreference(userId, contentId);
}

/**
 * Check if content has a specific preference
 * Useful for UI state management
 */
export async function hasPreference(
  clerkToken: string,
  userId: string,
  contentId: string,
  preferenceType: PreferenceType,
): Promise<boolean> {
  const repository = createRepository(clerkToken);
  return repository.hasPreference(userId, contentId, preferenceType);
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
  reason?: string,
): Promise<{ action: 'set' | 'removed'; preference?: UserContentPreferenceTyped }> {
  const repository = createRepository(clerkToken);
  return repository.togglePreference(userId, contentId, preferenceType, reason);
}
