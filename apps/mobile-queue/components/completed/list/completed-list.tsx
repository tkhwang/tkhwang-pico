import { FlashList } from '@shopify/flash-list';
import type { UserContentWithDetails } from '@tkhwang-pico/supabase';
import { Calendar } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import { CompletedListSkeleton } from '@/components/completed/list/completed-list-skeleton';
import { SwipeableCompletedItem } from '@/components/completed/swipe/swipeable-completed-item';
import { ContentItemList } from '@/components/content/content-item-list';
import { ContentItemSmallCard } from '@/components/content/content-item-small-card';
import { ContentDetail } from '@/components/content/detail/content-detail';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { type ViewMode, ViewModeToggle } from '@/components/ui/view-mode-toggle';
import { useSetContentPreference } from '@/hooks/mutations/use-content-preference';
import { useDeleteContent } from '@/hooks/mutations/use-delete-content';
import { useReopenContent } from '@/hooks/mutations/use-reopen-content';
import { useSaveContent } from '@/hooks/mutations/use-save-content';
import { useToggleContentPreference } from '@/hooks/mutations/use-toggle-content-preference';
import { useToggleUserContentStatus } from '@/hooks/mutations/use-toggle-user-content-status';
import { useUserContents } from '@/hooks/queries/use-user-contents';
import { isContentLiked } from '@/utils/content-helpers';

interface GroupedContent {
  date: string;
  items: UserContentWithDetails[];
}

export function CompletedList() {
  const { data: contents = [], isLoading, error, refetch } = useUserContents('completed');

  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UserContentWithDetails | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('bigCard');

  const deleteContentMutation = useDeleteContent();
  const reopenContentMutation = useReopenContent();
  const toggleContentMutation = useToggleUserContentStatus();
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
    [reopenContentMutation],
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
    (url: string, _contentId: string) => {
      saveContentMutation.mutate({ url });
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
      handleModalClose(); // Close modal after toggle
    },
    [toggleContentMutation, handleModalClose],
  );

  // Group contents by date
  const groupedContents = useMemo((): GroupedContent[] => {
    const groups: Record<string, UserContentWithDetails[]> = {};

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

  if (isLoading && !refreshing) return <CompletedListSkeleton />;

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
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
        className="flex-1 bg-gray-50 dark:bg-gray-900"
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
        <Icon as={Calendar} size={48} className="mb-4 text-gray-400 dark:text-gray-600" />
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
      <View className="mb-6">
        {/* Date section header */}
        <View className="mb-3 flex-row items-center gap-2">
          <Icon as={Calendar} size={18} className="text-gray-500 dark:text-gray-300" />
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {item.date}
          </Text>
        </View>

        {/* Items for this date */}
        {viewMode === 'list' ? (
          <View>
            {item.items.map((content) => {
              const isLiked = isContentLiked(content);
              return (
                <View key={content.id} className="mb-1">
                  <ContentItemList
                    item={content}
                    onPress={handleItemPress}
                    isLiked={isLiked}
                    showCompletedTime={true}
                  />
                </View>
              );
            })}
          </View>
        ) : viewMode === 'smallCard' ? (
          <View className="-mx-1 flex-row flex-wrap">
            {item.items.map((content) => {
              const isLiked = isContentLiked(content);
              return (
                <View key={content.id} className="w-1/2 p-1">
                  <ContentItemSmallCard
                    item={content}
                    onPress={handleItemPress}
                    isLiked={isLiked}
                    showCompletedTime={true}
                  />
                </View>
              );
            })}
          </View>
        ) : (
          // Default bigCard view with swipeable
          item.items.map((content, index) => (
            <View key={content.id} className={index > 0 ? 'mt-2' : ''}>
              <SwipeableCompletedItem
                item={content}
                onPress={handleItemPress}
                onReopen={handleReopen}
                onDelete={handleDelete}
                onLike={handleLike}
              />
            </View>
          ))
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* View mode toggle */}
      <View className="mb-2 px-4 pt-3">
        <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
      </View>

      <FlashList
        data={groupedContents}
        renderItem={renderItem}
        keyExtractor={(item) => item.date}
        key={viewMode} // Force re-render when switching modes
        estimatedItemSize={viewMode === 'list' ? 150 : viewMode === 'smallCard' ? 300 : 200}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
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
