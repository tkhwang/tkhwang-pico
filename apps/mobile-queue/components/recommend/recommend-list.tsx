import React, { useState, useCallback } from 'react';
import { View, RefreshControl, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text } from '../ui/text';
import { RecommendItem } from './recommend-item';
import { RecommendListSkeleton } from './recommend-list-skeleton';
import { useRecommendations } from '@/hooks/queries/use-recommendations';
import type { Recommendation } from '@tkhwang-pico/common';

export function RecommendList() {
  const {
    data: recommendations = [],
    isLoading,
    error,
    refetch,
  } = useRecommendations({ limit: 30 });
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

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

  const renderItem = ({ item }: { item: Recommendation }) => {
    return <RecommendItem recommendation={item} />;
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FlashList
        data={recommendations}
        renderItem={renderItem}
        keyExtractor={(item) => item.content_id}
        estimatedItemSize={150}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
            progressBackgroundColor="#ffffff"
          />
        }
      />
    </View>
  );
}
