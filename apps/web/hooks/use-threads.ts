import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/providers/auth-provider";
import { deleteThread, type ThreadWithLastMessage } from "../lib/supabase/chat";
import { useThreadsQuery } from "@/hooks/queries/use-threads-query";

interface UseThreadsReturn {
  threads: ThreadWithLastMessage[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteThreadById: (threadId: string) => Promise<void>;
}

export function useThreads(): UseThreadsReturn {
  const { user } = useAuth();
  const {
    data,
    isPending,
    error: queryError,
    refetch: refetchQuery,
  } = useThreadsQuery(user?.id);

  const [threads, setThreads] = useState<ThreadWithLastMessage[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const isLoading = Boolean(user) && isPending;

  useEffect(() => {
    if (data) setThreads(data);
    if (!user) setThreads([]);
  }, [data, user]);

  const deleteThreadById = useCallback(async (threadId: string) => {
    try {
      await deleteThread(threadId);
      // Remove thread from local state
      setThreads((prev) => prev.filter((thread) => thread.id !== threadId));
    } catch (err) {
      console.error("Failed to delete thread:", err);
      setLocalError(
        err instanceof Error ? err.message : "Failed to delete thread"
      );
      throw err; // Re-throw so the component can handle it
    }
  }, []);

  const refetch = useCallback(async () => {
    setLocalError(null);
    await refetchQuery();
  }, [refetchQuery]);

  const error = localError ?? (queryError ? queryError.message : null);

  // refetch comes from react-query; no manual fetch-on-mount needed

  return {
    threads,
    isLoading,
    error,
    refetch,
    deleteThreadById,
  };
}
