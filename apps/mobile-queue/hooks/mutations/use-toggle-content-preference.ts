import { useAuth, useUser } from '@clerk/clerk-expo';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  PreferenceType,
  UserContentPreferenceTyped,
  UserContentWithDetails,
} from '@tkhwang-pico/supabase';
import { Alert } from 'react-native';

import { queryKey } from '@/hooks/keys/query-key';
import { togglePreference } from '@/lib/supabase/user-contents-preferences';

interface ToggleContentPreferenceParams {
  contentId: string;
  preferenceType: PreferenceType;
  reason?: string;
}

type TogglePreferenceResult = Awaited<ReturnType<typeof togglePreference>>;

interface UseToggleContentPreferenceOptions {
  onSuccess?: (result: TogglePreferenceResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Toggle a content preference (liked, not_interested, blocked)
 * Automatically manages authentication and cache invalidation
 */
export function useToggleContentPreference(options?: UseToggleContentPreferenceOptions) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { user } = useUser();

  return useMutation<
    TogglePreferenceResult,
    Error,
    ToggleContentPreferenceParams,
    {
      previousUserContents?: {
        queryKey: readonly unknown[];
        data: UserContentWithDetails[] | undefined;
      }[];
    }
  >({
    mutationFn: async ({ contentId, preferenceType, reason }) => {
      const token = await getToken();
      if (!token) throw new Error('Authentication token not available');
      if (!user?.id) throw new Error('User not found');

      return togglePreference(token, user.id, contentId, preferenceType, reason);
    },

    onMutate: async ({ contentId, preferenceType, reason }) => {
      if (!user?.id) return {};

      const userContentsKey = queryKey.userContents.byUserId(user.id);

      await queryClient.cancelQueries({ queryKey: userContentsKey, exact: false });

      const previousUserContents = queryClient
        .getQueriesData<UserContentWithDetails[]>({ queryKey: userContentsKey })
        .map(([key, data]) => ({ queryKey: key, data }));

      const optimisticPreference: UserContentPreferenceTyped = {
        id: `temp-${preferenceType}-${contentId}`,
        user_id: user.id,
        content_id: contentId,
        preference_type: preferenceType,
        reason: reason ?? null,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueriesData<UserContentWithDetails[]>(
        { queryKey: userContentsKey, exact: false },
        (old) => updatePreferences(old, contentId, preferenceType, optimisticPreference, 'toggle'),
      );

      return { previousUserContents };
    },

    onSuccess: (result, variables) => {
      if (user?.id) {
        // Invalidate cached content lists and recommendations to reflect preference changes
        const userContentsKey = queryKey.userContents.byUserId(user.id);

        const serverPreference = result.preference
          ? {
              ...result.preference,
              preference_type: result.preference.preference_type as PreferenceType,
            }
          : undefined;

        queryClient.setQueriesData<UserContentWithDetails[]>(
          { queryKey: userContentsKey, exact: false },
          (old) =>
            updatePreferences(
              old,
              variables.contentId,
              variables.preferenceType,
              serverPreference,
              result.action === 'set' ? 'set' : 'remove',
            ),
        );

        queryClient.invalidateQueries({
          queryKey: queryKey.userContents.byUserId(user.id),
          exact: false,
        });

        queryClient.invalidateQueries({
          queryKey: queryKey.recommendations.byUserId(user.id),
          exact: false,
        });
      }

      options?.onSuccess?.(result);
    },

    onError: (error, _variables, context) => {
      console.error('Failed to toggle content preference:', error);
      Alert.alert('Error', 'An error occurred while setting your preference.', [{ text: 'OK' }]);

      if (context?.previousUserContents) {
        context.previousUserContents.forEach(({ queryKey: key, data }) => {
          queryClient.setQueryData(key, data);
        });
      }

      options?.onError?.(error);
    },
  });
}

type UpdateMode = 'toggle' | 'set' | 'remove';

function updatePreferences(
  items: UserContentWithDetails[] | undefined,
  contentId: string,
  preferenceType: PreferenceType,
  preference: UserContentPreferenceTyped | undefined,
  mode: UpdateMode,
): UserContentWithDetails[] | undefined {
  if (!items) return items;

  return items.map((item) => {
    if (item.content_id !== contentId) return item;

    const currentPreferences = item.preferences ?? [];

    if (mode === 'toggle') {
      const exists = currentPreferences.some((pref) => pref.preference_type === preferenceType);
      if (exists) {
        return {
          ...item,
          preferences: currentPreferences.filter((pref) => pref.preference_type !== preferenceType),
        };
      }

      if (preference) {
        return {
          ...item,
          preferences: [...currentPreferences, preference],
        };
      }

      return item;
    }

    if (mode === 'set' && preference) {
      const filtered = currentPreferences.filter((pref) => pref.preference_type !== preferenceType);
      return {
        ...item,
        preferences: [...filtered, preference],
      };
    }

    if (mode === 'remove') {
      return {
        ...item,
        preferences: currentPreferences.filter((pref) => pref.preference_type !== preferenceType),
      };
    }

    return item;
  });
}
