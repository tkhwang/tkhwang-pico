/**
 * Centralized query key management for React Query
 */
export const queryKey = {
  userContents: {
    byUserId: (userId: string) => {
      return ['user_contents', userId] as const;
    },
  },
} as const;
