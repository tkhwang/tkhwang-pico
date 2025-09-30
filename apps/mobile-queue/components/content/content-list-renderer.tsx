import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import type { ReactNode } from 'react';
import type { RefreshControlProps } from 'react-native';
import { RefreshControl, View } from 'react-native';

import type { ViewMode } from '@/contexts/queue-context';

interface ContentListRendererProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T) => string;
  viewMode: ViewMode;
  estimatedItemSize: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  emptyComponent?: ReactNode;
  contentContainerStyle?: Record<string, any>;
}

export function ContentListRenderer<T>({
  data,
  renderItem,
  keyExtractor,
  viewMode,
  estimatedItemSize,
  refreshing = false,
  onRefresh,
  emptyComponent,
  contentContainerStyle,
}: ContentListRendererProps<T>) {
  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="#3B82F6"
      colors={['#3B82F6']}
      progressBackgroundColor="#ffffff"
    />
  ) : undefined;

  if (data.length === 0 && emptyComponent) {
    return <View className="flex-1">{emptyComponent}</View>;
  }

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      key={viewMode}
      estimatedItemSize={estimatedItemSize}
      numColumns={viewMode === 'smallCard' ? 2 : 1}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={
        contentContainerStyle ?? {
          paddingHorizontal: viewMode === 'smallCard' ? 8 : 12,
          paddingTop: 8,
          paddingBottom: 12,
        }
      }
      removeClippedSubviews={true}
      drawDistance={200}
      refreshControl={refreshControl}
    />
  );
}
