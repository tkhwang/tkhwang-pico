import { FlashList, type FlashListProps, type ListRenderItem } from '@shopify/flash-list';
import type { ReactNode } from 'react';
import { RefreshControl } from 'react-native';

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
  contentContainerStyle?: FlashListProps<T>['contentContainerStyle'];
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

  const defaultContentStyle = {
    paddingHorizontal: viewMode === 'smallCard' ? 8 : 12,
    paddingTop: 8,
    paddingBottom: 12,
  } as FlashListProps<T>['contentContainerStyle'];

  const resolvedContentStyle = (() => {
    if (contentContainerStyle) return contentContainerStyle;
    if (data.length === 0) {
      return {
        ...defaultContentStyle,
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
      } as FlashListProps<T>['contentContainerStyle'];
    }
    return defaultContentStyle;
  })();

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      key={viewMode}
      estimatedItemSize={estimatedItemSize}
      numColumns={viewMode === 'smallCard' ? 2 : 1}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={resolvedContentStyle}
      removeClippedSubviews={true}
      drawDistance={200}
      refreshControl={refreshControl}
      ListEmptyComponent={emptyComponent}
    />
  );
}
