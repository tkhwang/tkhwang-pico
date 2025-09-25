'use client';

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { useAuth } from '@/providers/auth-provider';
import type { AuthClerkSession } from '@/types/auth';

/**
 * Common hook for Supabase mutations with automatic session management
 */
export function useSupabaseMutation<TData, TError = Error, TVariables = void, TContext = unknown>(
  mutationFn: (session: NonNullable<AuthClerkSession>, variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables, TContext>,
) {
  const { session } = useAuth();

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn: (variables) => {
      if (!session) {
        throw new Error('User not authenticated');
      }
      return mutationFn(session, variables);
    },
    ...options,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      options?.onSettled?.(data, error, variables, context);
    },
  });
}
