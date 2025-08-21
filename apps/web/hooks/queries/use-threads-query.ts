"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getUserThreads,
  type ThreadWithLastMessage,
} from "@/lib/supabase/chat";

export function useThreadsQuery(userId: string | undefined) {
  return useQuery<ThreadWithLastMessage[], Error>({
    queryKey: ["threads", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];
      return await getUserThreads(userId);
    },
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
