import React, { useState, useCallback, useMemo } from 'react';
import { View, RefreshControl, ScrollView, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-expo';
import { Text } from '@/components/ui/text';
import { SwipeableRecommendItem } from './swipeable-recommend-item';
import { RecommendListSkeleton } from './recommend-list-skeleton';
import { ContentDetailModal } from '../content/detail/content-detail-modal';
import { useRecommendations } from '@/hooks/queries/use-recommendations';
import { useSaveContent } from '@/hooks/mutations/use-save-content';
import { useDismissRecommendation } from '@/hooks/mutations/use-dismiss-recommendation';
import { queryKey } from '@/hooks/keys/query-key';
import type { Recommendation } from '@tkhwang-pico/common';

export function RecommendList() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const {
    data: recommendations = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useRecommendations({ limit: 30 });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Recommendation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Store the content ID being added to queue
  const [addingContentId, setAddingContentId] = useState<string | null>(null);

  const saveContentMutation = useSaveContent({
    onSuccess: () => {
      // Remove the recommendation from the cache after successfully adding to queue
      if (user?.id && addingContentId) {
        const key = queryKey.recommendations.byUserId(user.id);
        queryClient.setQueryData(key, (oldData: Recommendation[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter((rec) => rec.content_id !== addingContentId);
        });
        setAddingContentId(null); // Clear the stored content ID
      }
    },
  });
  const dismissRecommendationMutation = useDismissRecommendation();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const validRecommendations = useMemo(
    () => recommendations.filter((r) => !!r.contents),
    [recommendations]
  );

  const handleItemPress = useCallback((recommendation: Recommendation) => {
    setSelectedItem(recommendation);
    setModalVisible(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setSelectedItem(null);
  }, []);

  const handleAddToQueue = useCallback(
    (url: string, contentId: string) => {
      setAddingContentId(contentId); // Store the content ID for the onSuccess callback
      saveContentMutation.mutate(url);
    },
    [saveContentMutation]
  );

  const handleNotInterested = useCallback(
    (contentId: string) => {
      dismissRecommendationMutation.mutate(contentId);

      // Also remove from local cache immediately for better UX
      if (user?.id) {
        const key = queryKey.recommendations.byUserId(user.id);
        queryClient.setQueryData(key, (oldData: Recommendation[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter((rec) => rec.content_id !== contentId);
        });
      }
    },
    [dismissRecommendationMutation, user?.id, queryClient]
  );

  const renderItem = useCallback(
    ({ item }: { item: Recommendation }) => {
      return (
        <SwipeableRecommendItem
          recommendation={item}
          onPress={handleItemPress}
          onAddToQueue={handleAddToQueue}
          onNotInterested={handleNotInterested}
        />
      );
    },
    [handleItemPress, handleAddToQueue, handleNotInterested]
  );

  if (isLoading && !refreshing) {
    return <RecommendListSkeleton />;
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="mb-4 text-4xl">⚠️</Text>
        <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Failed to load recommendations
        </Text>
        <Text className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {error.message || 'An error occurred while loading recommendations'}
        </Text>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return (
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
            progressBackgroundColor="#ffffff"
          />
        }>
        <Text className="mb-4 text-4xl">🔍</Text>
        <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          No recommendations yet
        </Text>
        <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
          We're still learning your preferences. Save more content to get personalized
          recommendations.
        </Text>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FlashList
        data={validRecommendations}
        renderItem={renderItem}
        keyExtractor={(item) => item.content_id}
        estimatedItemSize={150}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
            progressBackgroundColor="#ffffff"
          />
        }
      />

      {/* Content Detail Modal */}
      <ContentDetailModal
        visible={modalVisible}
        item={selectedItem}
        onClose={handleModalClose}
        mode="recommend"
        onAddToQueue={handleAddToQueue}
        onNotInterested={handleNotInterested}
      />
    </View>
  );
}
