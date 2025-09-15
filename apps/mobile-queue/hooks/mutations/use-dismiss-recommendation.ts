import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { dismissRecommendation } from '@/lib/api/recommendations';
import { Alert } from 'react-native';

export function useDismissRecommendation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (contentId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      await dismissRecommendation(token, contentId);
    },
    onSuccess: (_, contentId) => {
      // Invalidate and refetch recommendations
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });

      // Optionally remove the specific recommendation from cache
      queryClient.setQueryData(['recommendations'], (old: any) => {
        if (!old) return old;
        return old.filter((rec: any) => rec.content_id !== contentId);
      });
    },
    onError: (error) => {
      console.error('Failed to dismiss recommendation:', error);
      Alert.alert('Error', 'Failed to dismiss recommendation. Please try again.');
    },
  });
}
