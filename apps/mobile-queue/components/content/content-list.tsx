import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text } from '../ui/text';
import { ContentItem } from './content-item';
import { useUserContents } from '@/hooks/queries/use-user-contents';
import { ContentListSkeleton } from '@/components/content/content-list-skeleton';

export function ContentList() {
  const { data: userContents = [], isLoading, error, refetch } = useUserContents();

  if (isLoading) return <ContentListSkeleton />;

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="mb-4 text-4xl">⚠️</Text>
        <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Failed to load contents
        </Text>
        <Text className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {error.message || 'An error occurred while loading your contents'}
        </Text>
        <TouchableOpacity onPress={() => refetch()} className="rounded-lg bg-blue-500 px-4 py-2">
          <Text className="font-medium text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (userContents.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="mb-4 text-4xl">📚</Text>
        <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          No saved contents yet
        </Text>
        <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
          Tap the + button to add your first content
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: (typeof userContents)[0] }) => {
    return <ContentItem item={item} />;
  };

  return (
    <View className="flex-1">
      <FlashList
        data={userContents}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={120}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        removeClippedSubviews={true}
        drawDistance={200}
      />
    </View>
  );
}
