import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text } from '../ui/text';
import { SwipeableContentItem } from './swipeable-content-item';
import { useUserContents } from '@/hooks/queries/use-user-contents';
import { ContentListSkeleton } from '@/components/content/content-list-skeleton';
import { useToggleTodo } from '@/hooks/mutations/use-toggle-todo';
import { useDeleteContent } from '@/hooks/mutations/use-delete-content';
import type { TodoFilterType } from '@tkhwang-pico/common';

interface ContentListProps {
  todoFilter: TodoFilterType;
}

export function ContentList({ todoFilter }: ContentListProps) {
  const { data: userContents = [], isLoading, error, refetch } = useUserContents(todoFilter);
  const [refreshing, setRefreshing] = useState(false);
  const toggleTodoMutation = useToggleTodo();
  const deleteContentMutation = useDeleteContent();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleToggleComplete = useCallback(
    (id: string) => {
      toggleTodoMutation.mutate(id);
    },
    [toggleTodoMutation]
  );

  const handleDelete = useCallback(
    (contentId: string) => {
      deleteContentMutation.mutate(contentId);
    },
    [deleteContentMutation]
  );

  if (isLoading && !refreshing) return <ContentListSkeleton />;

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
        <Text className="mb-4 text-4xl">📚</Text>
        <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          No saved contents yet
        </Text>
        <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
          Tap the + button to add your first content
        </Text>
      </ScrollView>
    );
  }

  const renderItem = ({ item }: { item: (typeof userContents)[0] }) => {
    return (
      <SwipeableContentItem
        item={item}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDelete}
      />
    );
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
