import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, RefreshControl, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@/components/ui/text';
import { useUserContents } from '@/hooks/queries/use-user-contents';
import { useDeleteContent } from '@/hooks/mutations/use-delete-content';
import { useReopenContent } from '@/hooks/mutations/use-reopen-content';
import { useToggleContent } from '@/hooks/mutations/use-toggle-content';
import { useToggleContentPreference } from '@/hooks/mutations/use-toggle-content-preference';
import { useSaveContent } from '@/hooks/mutations/use-save-content';
import { useSetContentPreference } from '@/hooks/mutations/use-content-preference';
import { ContentDetail } from '@/components/content/detail/content-detail';
import { isContentLiked } from '@/utils/content-helpers';
import type { UserContentWithDetails } from '@tkhwang-pico/common';
import { ArchiveListSkeleton } from '@/components/archive/list/archive-list-skeleton';
import { SwipeableArchiveItem } from '@/components/archive/swipe/swipeable-archive-item';

interface GroupedContent {
  date: string;
  items: UserContentWithDetails[];
}

export function ArchiveList() {
  const { data: contents = [], isLoading, error, refetch } = useUserContents('completed');

  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UserContentWithDetails | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const deleteContentMutation = useDeleteContent();
  const reopenContentMutation = useReopenContent();
  const toggleContentMutation = useToggleContent();
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
    (id: string) => {
      reopenContentMutation.mutate(id);
    },
    [reopenContentMutation]
  );

  const handleDelete = useCallback(
    (contentId: string) => {
      deleteContentMutation.mutate(contentId);
    },
    [deleteContentMutation]
  );

  const handleLike = useCallback(
    (contentId: string) => {
      togglePreferenceMutation.mutate({
        contentId,
        preferenceType: 'liked',
      });
    },
    [togglePreferenceMutation]
  );

  const handleAddToQueue = useCallback(
    (url: string, _contentId: string) => {
      saveContentMutation.mutate(url);
    },
    [saveContentMutation]
  );

  const handleNotInterested = useCallback(
    (contentId: string) => {
      setPreferenceMutation.mutate({
        contentId,
        preferenceType: 'not_interested',
      });
    },
    [setPreferenceMutation]
  );

  const handleToggleComplete = useCallback(
    (id: string) => {
      toggleContentMutation.mutate(id);
      handleModalClose(); // Close modal after toggle
    },
    [toggleContentMutation, handleModalClose]
  );

  // Group contents by date
  const groupedContents = useMemo((): GroupedContent[] => {
    const groups: { [key: string]: UserContentWithDetails[] } = {};

    contents.forEach((content) => {
      if (content.completed_at) {
        const date = new Date(content.completed_at).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(content);
      }
    });

    return Object.entries(groups).map(([date, items]) => ({
      date,
      items,
    }));
  }, [contents]);

  if (isLoading && !refreshing) return <ArchiveListSkeleton />;

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="mb-4 text-4xl">⚠️</Text>
        <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Failed to load archive
        </Text>
        <Text className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {error.message || 'An error occurred while loading your archive'}
        </Text>
      </View>
    );
  }

  if (groupedContents.length === 0) {
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
        <Text className="mb-4 text-4xl">📅</Text>
        <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          No completed contents yet
        </Text>
        <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
          Complete some contents to see them in your archive
        </Text>
      </ScrollView>
    );
  }

  const renderItem = ({ item }: { item: GroupedContent }) => {
    return (
      <View className="mb-4">
        {/* Date separator */}
        {item.items.length > 0 && item.items[0].completed_at && (
          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {new Date(item.items[0].completed_at).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        )}
        {/* Items for this date */}
        {item.items.map((content, index) => (
          <View key={content.id} className={index > 0 ? 'mt-3' : ''}>
            <SwipeableArchiveItem
              item={content}
              isFirstOfDay={index === 0}
              onPress={handleItemPress}
              onReopen={handleReopen}
              onDelete={handleDelete}
              onLike={handleLike}
              isLiked={isContentLiked(content)}
            />
          </View>
        ))}
        <View className="mt-4 h-px bg-gray-200 dark:bg-gray-700" />
      </View>
    );
  };

  return (
    <View className="flex-1">
      <FlashList
        data={groupedContents}
        renderItem={renderItem}
        keyExtractor={(item) => item.date}
        estimatedItemSize={200}
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
        />
      )}
    </View>
  );
}
