import React, { useState, useCallback, useMemo } from 'react';
import { View, RefreshControl, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@/components/ui/text';
import { TimelineItem } from './timeline-item';
import { useUserContents } from '@/hooks/queries/use-user-contents';
import { ContentListSkeleton } from '@/components/content/content-list-skeleton';
import type { UserContentWithDetails } from '@tkhwang-pico/common';
import { TimelineListSkeleton } from '@/components/timeline/timeline-list-skeleton';
import { ContentDetailModal } from '@/components/content/detail/content-detail-modal';

interface GroupedContent {
  date: string;
  items: UserContentWithDetails[];
}

export function TimelineList() {
  const { data: contents = [], isLoading, error, refetch } = useUserContents('completed');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UserContentWithDetails | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  if (isLoading && !refreshing) return <TimelineListSkeleton />;

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="mb-4 text-4xl">⚠️</Text>
        <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Failed to load timeline
        </Text>
        <Text className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {error.message || 'An error occurred while loading your timeline'}
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
          Complete some contents to see them in your timeline
        </Text>
      </ScrollView>
    );
  }

  const renderItem = ({ item }: { item: GroupedContent }) => {
    return <TimelineItem date={item.date} items={item.items} onPress={handleItemPress} />;
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
        <ContentDetailModal visible={modalVisible} item={selectedItem} onClose={handleModalClose} />
      )}
    </View>
  );
}
