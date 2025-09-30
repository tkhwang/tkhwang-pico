import type { UserContentWithDetails } from '@tkhwang-pico/supabase';
import { Calendar } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { SwipeableCompletedItem } from '@/components/common/queue/swipe/swipeable-completed-item';
import { ContentCardList } from '@/components/content/common/cards/content-card-list';
import { ContentCardSmall } from '@/components/content/common/cards/content-card-small';
import { ContentListRenderer } from '@/components/content/content-list-renderer';
import { ContentDetail } from '@/components/content/detail/content-detail';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useQueueState } from '@/contexts/queue-context';
import { useSetContentPreference } from '@/hooks/mutations/use-content-preference';
import { useDeleteContent } from '@/hooks/mutations/use-delete-content';
import { useReopenContent } from '@/hooks/mutations/use-reopen-content';
import { useSaveContent } from '@/hooks/mutations/use-save-content';
import { useToggleContentPreference } from '@/hooks/mutations/use-toggle-content-preference';
import { useToggleUserContentStatus } from '@/hooks/mutations/use-toggle-user-content-status';
import { useUpdateContent } from '@/hooks/mutations/use-update-content';
import { useUserContents } from '@/hooks/queries/use-user-contents';
import { isContentLiked } from '@/utils/content-helpers';
import type { PriorityValue } from '@/utils/priority';

import { CompletedListSkeleton } from './completed-list-skeleton';

export function CompletedList() {
  const { data: contents = [], isLoading, error, refetch } = useUserContents('completed');
  const { viewMode } = useQueueState();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UserContentWithDetails | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const deleteContentMutation = useDeleteContent();
  const reopenContentMutation = useReopenContent();
  const toggleContentMutation = useToggleUserContentStatus();
  const togglePreferenceMutation = useToggleContentPreference();
  const saveContentMutation = useSaveContent();
  const setPreferenceMutation = useSetContentPreference();
  const updateContentMutation = useUpdateContent();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleItemPress = useCallback((item: UserContentWithDetails) => {
    setSelectedItem(item);
    setModalVisible(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setSelectedItem(null);
  }, []);

  // Keep selectedItem in sync with latest cache while modal is open
  useEffect(() => {
    if (!modalVisible || !selectedItem) return;
    const updated = contents.find((c) => c.content_id === selectedItem.content_id);
    if (updated && updated !== selectedItem) {
      setSelectedItem(updated);
    }
  }, [contents, modalVisible, selectedItem]);

  const handleReopen = useCallback(
    async ({
      userContentId,
      scheduledFor,
      priority,
    }: {
      userContentId: string;
      scheduledFor: string;
      priority: PriorityValue;
    }) => {
      await reopenContentMutation.mutateAsync(userContentId);
      await updateContentMutation.mutateAsync({
        userContentId,
        scheduledFor,
        priority,
      });
    },
    [reopenContentMutation, updateContentMutation],
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

  const handleToggleComplete = useCallback(
    (id: string) => {
      toggleContentMutation.mutate(id);
      handleModalClose();
    },
    [toggleContentMutation, handleModalClose],
  );

  if (isLoading && !refreshing) return <CompletedListSkeleton />;

  const renderItem = ({ item, index }: { item: UserContentWithDetails; index: number }) => {
    const isLiked = isContentLiked(item);

    if (viewMode === 'list') {
      return (
        <View className="mb-1">
          <ContentCardList
            item={item}
            onPress={handleItemPress}
            isLiked={isLiked}
            showCompletedTime={true}
          />
        </View>
      );
    } else if (viewMode === 'smallCard') {
      return (
        <View className="flex-1 p-1">
          <ContentCardSmall
            item={item}
            onPress={handleItemPress}
            isLiked={isLiked}
            showCompletedTime={true}
          />
        </View>
      );
    } else {
      return (
        <View className={index > 0 ? 'mt-2' : ''}>
          <SwipeableCompletedItem
            item={item}
            onPress={handleItemPress}
            onReopen={handleReopen}
            onDelete={handleDelete}
            onLike={handleLike}
          />
        </View>
      );
    }
  };

  const emptyComponent = error ? (
    <View className="items-center px-4">
      <Text className="mb-4 text-4xl">⚠️</Text>
      <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Failed to load archive
      </Text>
      <Text className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
        {error?.message || 'An error occurred while loading your archive'}
      </Text>
    </View>
  ) : (
    <View className="items-center px-4">
      <Icon as={Calendar} size={48} className="mb-4 text-gray-400 dark:text-gray-600" />
      <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        No completed contents yet
      </Text>
      <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
        Complete some contents to see them in your archive
      </Text>
    </View>
  );

  const contentContainerStyle =
    contents.length === 0
      ? {
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }
      : { paddingHorizontal: 16, paddingVertical: 8 };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="flex-1">
        <ContentListRenderer
          data={contents}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          viewMode={viewMode}
          estimatedItemSize={viewMode === 'list' ? 80 : viewMode === 'smallCard' ? 180 : 100}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={contentContainerStyle}
          emptyComponent={emptyComponent}
        />
      </View>
      {selectedItem && (
        <ContentDetail
          visible={modalVisible}
          item={selectedItem}
          onClose={handleModalClose}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDelete}
          onLike={handleLike}
          onAddToQueue={handleAddToQueue}
          onNotInterested={handleNotInterested}
          onReopen={handleReopen}
        />
      )}
    </View>
  );
}
