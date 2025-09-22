import type { UserContentWithDetails } from '@tkhwang-pico/supabase';

export const isContentLiked = (item: UserContentWithDetails): boolean => {
  return item.preferences?.some((p) => p.preference_type === 'liked') ?? false;
};
