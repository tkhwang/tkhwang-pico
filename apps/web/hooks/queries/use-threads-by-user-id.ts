import type { ThreadWithLastMessage } from "@tkhwang-pico/supabase";

import { queryKey } from "@/hooks/keys/query-key";
import { useSupabaseQuery } from "@/hooks/queries/supabase/use-supabase-query";
import { getUserThreads } from "@/lib/supabase/threads";
import { useAuth } from "@/providers/auth-provider";

export function useThreadsByUserId() {
  const { user } = useAuth();

  return useSupabaseQuery(
    queryKey.threads.byUserId(user?.id),
    async (session): Promise<ThreadWithLastMessage[]> => {
      if (!user?.id) return [];

      return await getUserThreads(session, user.id);
    },
    {
      enabled: !!user?.id,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  );
}
