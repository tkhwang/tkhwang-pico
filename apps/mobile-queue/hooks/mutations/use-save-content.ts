import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { saveContent } from '@/lib/api/contents';
import { queryKey } from '@/hooks/keys/query-key';
import { Alert } from 'react-native';
import type { UserContentWithDetails, Content } from '@tkhwang-pico/common';
import { SAVE_CONTENT_DELAY_MS } from '@/consts/app-consts';

interface UseSaveContentOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useSaveContent(options?: UseSaveContentOptions) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { user } = useUser();

  type MutationContext = {
    previousItems?: UserContentWithDetails[];
    optimisticId?: string;
  };

  type SaveContentResult = Awaited<ReturnType<typeof saveContent>>;

  return useMutation<SaveContentResult, Error, string, MutationContext>({
    mutationFn: async (url: string) => {
      const token = await getToken();
      if (!token) throw new Error('Authentication token not available');
      return saveContent(url, token);
    },
    onMutate: async (url: string) => {
      if (!user?.id) return { previousItems: undefined };

      const key = queryKey.userContents.byUserId(user.id);
      await queryClient.cancelQueries({ queryKey: key });

      // Get the first matching query data (without filter)
      const queryCache = queryClient.getQueriesData<UserContentWithDetails[]>({ queryKey: key });
      const previousItems = queryCache?.[0]?.[1] ?? [];

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

      const existsIndex = previousItems.findIndex((it) => {
        const c = (it as any).content || it.contents;
        return c?.canonical_url === url || c?.url === url;
      });

      let nextItems: UserContentWithDetails[];
      if (existsIndex !== -1) {
        // Move existing to top and refresh saved_at
        nextItems = [...previousItems];
        const existing = { ...nextItems[existsIndex], saved_at: savedAt };
        nextItems.splice(existsIndex, 1);
        nextItems.unshift(existing);
      } else {
        nextItems = [optimisticItem, ...previousItems];
      }

      // Update all matching queries (including filtered variants)
      queryClient.setQueriesData<UserContentWithDetails[]>(
        { queryKey: key },
        (oldData) => nextItems
      );

      return { previousItems, optimisticId };
    },
    onError: (error: Error, _url, context) => {
      console.error('Failed to save content:', error);

      if (user?.id && context?.previousItems) {
        const key = queryKey.userContents.byUserId(user.id);
        // Rollback all matching queries (including filtered variants)
        queryClient.setQueriesData<UserContentWithDetails[]>(
          { queryKey: key },
          (oldData) => context.previousItems
        );
      }

      Alert.alert(
        'Failed to save content',
        error.message || 'Please check your connection and try again.',
        [{ text: 'OK' }]
      );

      options?.onError?.(error);
    },
    onSuccess: (data, _url, context) => {
      if (user?.id) {
        const key = queryKey.userContents.byUserId(user.id);
        // Update all matching queries (including filtered variants)
        queryClient.setQueriesData<UserContentWithDetails[]>(
          { queryKey: key },
          (curr) => {
            const items = curr ?? [];
            return items.map((it) => {
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
          }
        );

        // Slight delay before invalidation to allow UI to reflect optimistic item
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: key });
        }, SAVE_CONTENT_DELAY_MS);
      }

      options?.onSuccess?.();
    },
  });
}
