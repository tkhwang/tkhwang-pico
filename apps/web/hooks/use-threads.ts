import type { ThreadWithLastMessage } from "@tkhwang-pico/supabase";
import { useCallback, useEffect, useState } from "react";

import { deleteThread, getUserThreads } from "@/lib/supabase/threads";
import { useAuth } from "@/providers/auth-provider";

interface UseThreadsReturn {
  threads: ThreadWithLastMessage[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteThreadById: (threadId: string) => Promise<void>;
}

export function useThreads(): UseThreadsReturn {
  const { user, session } = useAuth();
  const [threads, setThreads] = useState<ThreadWithLastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    if (!user || !session) {
      setThreads([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userThreads = await getUserThreads(session, user.id);
      setThreads(userThreads);
    } catch (err) {
      console.error("Failed to fetch threads:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch threads");
    } finally {
      setIsLoading(false);
    }
  }, [user, session]);

  const deleteThreadById = useCallback(
    async (threadId: string) => {
      if (!session) {
        throw new Error("User not authenticated");
      }

      try {
        await deleteThread(session, threadId);
        // Remove thread from local state
        setThreads((prev) => prev.filter((thread) => thread.id !== threadId));
      } catch (err) {
        console.error("Failed to delete thread:", err);
        setError(
          err instanceof Error ? err.message : "Failed to delete thread",
        );
        throw err; // Re-throw so the component can handle it
      }
    },
    [session],
  );

  const refetch = useCallback(async () => {
    await fetchThreads();
  }, [fetchThreads]);

  // Fetch threads on mount and when user changes
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return {
    threads,
    isLoading,
    error,
    refetch,
    deleteThreadById,
  };
}
