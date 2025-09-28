import { FlashList } from '@shopify/flash-list';
import type { UserContentWithDetails } from '@tkhwang-pico/supabase';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';

import { SwipeableContentItem } from '@/components/common/queue/swipe/swipeable-content-item';
import { ContentCardList } from '@/components/content/common/cards/content-card-list';
import { ContentCardSmall } from '@/components/content/common/cards/content-card-small';
import { ContentDetail } from '@/components/content/detail/content-detail';
import { Text } from '@/components/ui/text';
import { type ViewMode, ViewModeToggle } from '@/components/ui/view-mode-toggle';
import { useSetContentPreference } from '@/hooks/mutations/use-content-preference';
import { useDeleteContent } from '@/hooks/mutations/use-delete-content';
import { useSaveContent } from '@/hooks/mutations/use-save-content';
import { useToggleContentPreference } from '@/hooks/mutations/use-toggle-content-preference';
import { useToggleUserContentStatus } from '@/hooks/mutations/use-toggle-user-content-status';
import { useUserContents } from '@/hooks/queries/use-user-contents';
import { isContentLiked } from '@/utils/content-helpers';
import type { PriorityValue } from '@/utils/priority';

import { ContentListSkeleton } from './content-list-skeleton';

interface ContentListProps {
  headerRight?: React.ReactNode;
}

export function ContentList({ headerRight }: ContentListProps) {
  const { data: userContents = [], isLoading, error, refetch } = useUserContents('pending');

  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UserContentWithDetails | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('bigCard');

  const toggleTodoMutation = useToggleUserContentStatus();
  const deleteContentMutation = useDeleteContent();
  const togglePreferenceMutation = useToggleContentPreference();
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

  const handleToggleComplete = useCallback(
    (id: string) => {
      toggleTodoMutation.mutate(id);
    },
    [toggleTodoMutation],
  );

  const handleDelete = useCallback(
    (contentId: string) => {
      deleteContentMutation.mutate(contentId);
    },
    [deleteContentMutation],
  );

  const handleLike = useCallback(
    (contentId: string) => {
      togglePreferenceMutation.mutate({
        contentId,
        preferenceType: 'liked',
      });
    },
    [togglePreferenceMutation],
  );

  const handleAddToQueue = useCallback(
    ({
      url,
      scheduledFor,
      priority,
    }: {
      url: string;
      scheduledFor: string;
      priority: PriorityValue;
    }) => {
      saveContentMutation.mutate({ url, scheduledFor, priority });
    },
    [saveContentMutation],
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

  const handleItemPress = useCallback((item: UserContentWithDetails) => {
    setSelectedItem(item);
    setModalVisible(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setSelectedItem(null);
  }, []);

  useEffect(() => {
    if (!modalVisible || !selectedItem) return;
    const updated = userContents.find((c) => c.content_id === selectedItem.content_id);
    if (updated && updated !== selectedItem) {
      setSelectedItem(updated);
    }
  }, [userContents, modalVisible, selectedItem]);

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
        }
      >
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
    const isLiked = isContentLiked(item);

    if (viewMode === 'list') {
      return (
        <View className="mb-1">
          <ContentCardList item={item} onPress={handleItemPress} isLiked={isLiked} />
        </View>
      );
    }

    if (viewMode === 'smallCard') {
      return (
        <View className="flex-1 p-1">
          <ContentCardSmall item={item} onPress={handleItemPress} isLiked={isLiked} />
        </View>
      );
    }

    return (
      <SwipeableContentItem
        item={item}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDelete}
        onLike={handleLike}
        onPress={handleItemPress}
      />
    );
  };

  return (
    <View className="flex-1">
      <View className="mb-2 px-4 pt-3">
        <View className="flex-row items-center justify-between gap-3">
          {headerRight ? <View className="shrink-0">{headerRight}</View> : null}
          <View className="shrink-0">
            <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
          </View>
        </View>
      </View>

      <FlashList
        data={userContents}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        key={viewMode}
        estimatedItemSize={viewMode === 'list' ? 60 : viewMode === 'smallCard' ? 150 : 120}
        numColumns={viewMode === 'smallCard' ? 2 : 1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: viewMode === 'smallCard' ? 8 : 12,
          paddingTop: 8,
          paddingBottom: 12,
        }}
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

      <ContentDetail
        visible={modalVisible}
        item={selectedItem}
        onClose={handleModalClose}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDelete}
        onLike={handleLike}
        onAddToQueue={handleAddToQueue}
        onNotInterested={handleNotInterested}
      />
    </View>
  );
}
