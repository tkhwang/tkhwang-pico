"use client";

import {
  useQuery,
  type UseQueryOptions,
  type QueryKey,
} from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import type { AuthClerkSession } from "@/types/auth";

/**
 * Common hook for Supabase queries with automatic session management
 */
export function useSupabaseQuery<TData, TError = Error>(
  queryKey: QueryKey,
  queryFn: (session: AuthClerkSession) => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">
) {
  const { session } = useAuth();

  return useQuery<TData, TError>({
    queryKey,
    queryFn: () => queryFn(session),
    enabled: options?.enabled !== false && !!session,
    ...options,
  });
}
