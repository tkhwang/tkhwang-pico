import { useAuth, useUser } from '@clerk/clerk-expo';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Content, UserContentWithDetails } from '@tkhwang-pico/supabase';
import { Alert } from 'react-native';

import { SAVE_CONTENT_DELAY_MS } from '@/consts/app-consts';
import { queryKey } from '@/hooks/keys/query-key';
import { saveContent } from '@/services/api/contents';
import { DEFAULT_PRIORITY, type PriorityValue } from '@/utils/priority';

interface SaveContentInput {
  url: string;
  scheduledFor?: string | null;
  priority?: PriorityValue;
}

interface UseSaveContentOptions {
  onMutate?: () => unknown;
  onSuccess?: () => void;
  onError?: (error: Error, variables: SaveContentInput, context: unknown) => void;
}

export function useSaveContent(options?: UseSaveContentOptions) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { user } = useUser();

  interface MutationContext {
    previousQueries?: [queryKey: unknown[], data: UserContentWithDetails[]][];
    optimisticId?: string;
    userContext?: unknown;
    variables: SaveContentInput;
  }

  type SaveContentResult = Awaited<ReturnType<typeof saveContent>>;

  return useMutation<SaveContentResult, Error, SaveContentInput, MutationContext>({
    mutationFn: async (input: SaveContentInput) => {
      const token = await getToken();
      if (!token) throw new Error('Authentication token not available');
      return saveContent(
        {
          url: input.url,
          scheduledFor: input.scheduledFor ?? null,
          priority: input.priority ?? DEFAULT_PRIORITY,
        },
        token,
      );
    },
    onMutate: async (input: SaveContentInput) => {
      const url = input.url;
      // Call user's onMutate first if provided
      const userContext = options?.onMutate?.();

      if (!user?.id)
        return {
          previousQueries: undefined,
          userContext,
          variables: input,
        };

      const key = queryKey.userContents.byUserId(user.id);
      await queryClient.cancelQueries({ queryKey: key });

      // Get all matching query data (including all filter variants)
      const allQueries = queryClient.getQueriesData<UserContentWithDetails[]>({
        queryKey: key,
      });

      // Filter out queries with undefined data and convert to mutable arrays
      const previousQueries: [unknown[], UserContentWithDetails[]][] = allQueries
        .filter((entry): entry is [unknown[], UserContentWithDetails[]] => entry[1] !== undefined)
        .map(([queryKey, data]) => [[...queryKey], data]);

      const optimisticId = `optimistic-${Math.random().toString(36).slice(2)}`;
      const optimisticContentId = `optimistic-${Math.random().toString(36).slice(2)}`;

      let domain: string | null = null;
      try {
        domain = new URL(url).hostname;
      } catch {
        // Invalid URL, keep domain as null
      }

      const savedAt = new Date().toISOString();

      const optimisticContent: Content = {
        id: optimisticContentId,
        url,
        canonical_url: url,
        domain,
        status: 'pending',
        title: 'Saving…',
        summary: null,
        author: null,
        fetched_at: null,
        lang: null,
        metadata: { optimistic: true, original_url: url },
        published_at: null,
        tags: null,
        token_count: null,
        word_count: null,
      };

      const optimisticItem: UserContentWithDetails = {
        id: optimisticId,
        user_id: user.id,
        content_id: optimisticContentId,
        saved_at: savedAt,
        archived: false,
        labels: [],
        note: null,
        todo_status: 'pending',
        completed_at: null,
        priority: input.priority ?? DEFAULT_PRIORITY,
        scheduled_for: input.scheduledFor ?? null,
        contents: optimisticContent,
      };

      // Apply optimistic update to each query cache separately
      previousQueries.forEach(([specificQueryKey, data]) => {
        const existsIndex = data.findIndex((it) => {
          const c = ('content' in it ? it.content : it.contents) as Content | undefined;
          return c?.canonical_url === url || c?.url === url;
        });

        let nextItems: UserContentWithDetails[];
        if (existsIndex !== -1) {
          // Move existing to top and refresh saved_at
          nextItems = [...data];
          const existing = { ...nextItems[existsIndex], saved_at: savedAt };
          nextItems.splice(existsIndex, 1);
          nextItems.unshift(existing);
        } else {
          nextItems = [optimisticItem, ...data];
        }

        // Update this specific query cache
        queryClient.setQueryData(specificQueryKey, nextItems);
      });

      return { previousQueries, optimisticId, userContext, variables: input };
    },
    onError: (error: Error, input, context) => {
      console.error('Failed to save content:', error);

      // Rollback each query cache to its previous state
      if (context?.previousQueries) {
        context.previousQueries.forEach(([specificQueryKey, previousData]) => {
          queryClient.setQueryData(specificQueryKey, previousData);
        });
      }

      Alert.alert(
        'Failed to save content',
        error.message || 'Please check your connection and try again.',
        [{ text: 'OK' }],
      );

      // Call user's onError with userContext
      options?.onError?.(error, input, context?.userContext);
    },
    onSuccess: (data, _input, context) => {
      if (user?.id) {
        const key = queryKey.userContents.byUserId(user.id);

        // Get current state of all queries
        const currentQueries = queryClient.getQueriesData<UserContentWithDetails[]>({
          queryKey: key,
        });

        // Update each query cache separately
        currentQueries.forEach(([specificQueryKey, currentData]) => {
          if (!currentData) return;

          const updatedItems = currentData.map((it) => {
            if (it.id === context?.optimisticId || it.content_id.startsWith('optimistic-')) {
              const contents = ('content' in it ? it.content : it.contents) as Content | undefined;
              const updatedContents: Content | undefined = contents
                ? { ...contents, id: data.contentId, status: data.status }
                : undefined;
              return {
                ...it,
                content_id: data.contentId,
                contents: updatedContents ?? it.contents,
                scheduled_for:
                  context?.variables?.scheduledFor !== undefined
                    ? (context.variables.scheduledFor ?? null)
                    : it.scheduled_for,
                priority:
                  context?.variables?.priority !== undefined
                    ? (context.variables.priority ?? DEFAULT_PRIORITY)
                    : (it.priority ?? DEFAULT_PRIORITY),
              } as UserContentWithDetails;
            }
            return it;
          });

          queryClient.setQueryData(specificQueryKey, updatedItems);
        });

        // Slight delay before invalidation to allow UI to reflect optimistic item
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: key });
        }, SAVE_CONTENT_DELAY_MS);
      }

      options?.onSuccess?.();
    },
  });
}
