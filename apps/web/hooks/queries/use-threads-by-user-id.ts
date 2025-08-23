import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import {
  getUserThreads,
  type ThreadWithLastMessage,
} from "@/lib/supabase/chat";
import { queryKey } from "@/hooks/keys/query-key";

export function useThreadsByUserId() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKey.threads.byUserId(user?.id),
    queryFn: async (): Promise<ThreadWithLastMessage[]> => {
      if (!user?.id) return [];
      return await getUserThreads(user.id);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
