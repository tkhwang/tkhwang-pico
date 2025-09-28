import { useUser } from '@clerk/clerk-expo';
import { FlashList } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import type { Recommendation } from '@tkhwang-pico/supabase';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import { SwipeableRecommendItem } from '@/components/content/discovery/swipe/swipeable-recommend-item';
import { Text } from '@/components/ui/text';
import { SWIPE_ACTION_CARD_REMOVAL_DELAY_MS } from '@/consts/app-consts';
import { queryKey } from '@/hooks/keys/query-key';
import { useSetContentPreference } from '@/hooks/mutations/use-content-preference';
import { useSaveContent } from '@/hooks/mutations/use-save-content';
import { useRecommendations } from '@/hooks/queries/use-recommendations';
import type { PriorityValue } from '@/utils/priority';

import { ContentDetail } from '../../detail/content-detail';
import { RecommendListSkeleton } from './recommend-list-skeleton';

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

  const saveContentMutation = useSaveContent();

  const setPreferenceMutation = useSetContentPreference();

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
    [recommendations],
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
    ({
      url,
      contentId,
      scheduledFor,
      priority,
    }: {
      url: string;
      contentId: string;
      scheduledFor: string;
      priority: PriorityValue;
    }) => {
      saveContentMutation.mutate(
        { url, scheduledFor, priority },
        {
          onSuccess: () => {
            // Evict after visual feedback completes
            setTimeout(() => {
              if (user?.id) {
                const key = queryKey.recommendations.byUserId(user.id);
                queryClient.setQueryData<Recommendation[]>(key, (oldData) => {
                  if (!oldData) return oldData;
                  return oldData.filter((rec) => rec.content_id !== contentId);
                });
              }
            }, SWIPE_ACTION_CARD_REMOVAL_DELAY_MS);
          },
        },
      );
    },
    [saveContentMutation, user?.id, queryClient],
  );

  const handleNotInterested = useCallback(
    (contentId: string) => {
      setPreferenceMutation.mutate({
        contentId,
        preferenceType: 'not_interested',
      });
    },
    [setPreferenceMutation],
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
    [handleItemPress, handleAddToQueue, handleNotInterested],
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
        }
      >
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
      <ContentDetail
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
