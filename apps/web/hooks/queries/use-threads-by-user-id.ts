import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { useSupabaseClient } from "@/lib/supabase/client";
import {
  getUserThreadsWithAuth,
  type ThreadWithLastMessage,
} from "@/lib/supabase/chat";
import { queryKey } from "@/hooks/keys/query-key";

export function useThreadsByUserId() {
  const { user } = useAuth();
  const supabase = useSupabaseClient();

  return useQuery({
    queryKey: queryKey.threads.byUserId(user?.id),
    queryFn: async (): Promise<ThreadWithLastMessage[]> => {
      if (!user?.id) return [];

      const getUserThreadsFn = getUserThreadsWithAuth(supabase);
      return await getUserThreadsFn(user.id);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
