/**
 * Centralized query key management for React Query
 */
export const queryKey = {
  userContents: {
    byUserId: (userId: string) => {
      return ['user_contents', userId] as const;
    },
  },
  recommendations: {
    byUserId: (userId: string) => {
      return ['recommendations', userId] as const;
    },
  },
  similarContents: {
    byUserAndContent: (userId: string, contentId: string) => {
      return ['similar_contents', userId, contentId] as const;
    },
  },
} as const;
