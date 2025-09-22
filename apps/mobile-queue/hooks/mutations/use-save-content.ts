import { useAuth, useUser } from '@clerk/clerk-expo';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Content, UserContentWithDetails } from '@tkhwang-pico/supabase';
import { Alert } from 'react-native';

import { SAVE_CONTENT_DELAY_MS } from '@/consts/app-consts';
import { queryKey } from '@/hooks/keys/query-key';
import { saveContent } from '@/lib/api/contents';

interface UseSaveContentOptions {
  onMutate?: () => any;
  onSuccess?: () => void;
  onError?: (error: Error, variables: string, context: any) => void;
}

export function useSaveContent(options?: UseSaveContentOptions) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { user } = useUser();

  interface MutationContext {
    previousQueries?: [queryKey: unknown[], data: UserContentWithDetails[]][];
    optimisticId?: string;
    userContext?: any;
  }

  type SaveContentResult = Awaited<ReturnType<typeof saveContent>>;

  return useMutation<SaveContentResult, Error, string, MutationContext>({
    mutationFn: async (url: string) => {
      const token = await getToken();
      if (!token) throw new Error('Authentication token not available');
      return saveContent(url, token);
    },
    onMutate: async (url: string) => {
      // Call user's onMutate first if provided
      const userContext = options?.onMutate?.();

      if (!user?.id) return { previousQueries: undefined, userContext };

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
      } catch {}

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
        metadata: { optimistic: true, original_url: url } as any,
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
        contents: optimisticContent,
      };

      // Apply optimistic update to each query cache separately
      previousQueries.forEach(([specificQueryKey, data]) => {
        const existsIndex = data.findIndex((it) => {
          const c = (it as any).content || it.contents;
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

      return { previousQueries, optimisticId, userContext };
    },
    onError: (error: Error, url, context) => {
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
        [{ text: 'OK' }]
      );

      // Call user's onError with userContext
      options?.onError?.(error, url, context?.userContext);
    },
    onSuccess: (data, _url, context) => {
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
              const contents = (it as any).content || it.contents;
              const updatedContents: Content | undefined = contents
                ? { ...contents, id: data.contentId, status: data.status }
                : undefined;
              return {
                ...it,
                content_id: data.contentId,
                contents: updatedContents ?? it.contents,
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
