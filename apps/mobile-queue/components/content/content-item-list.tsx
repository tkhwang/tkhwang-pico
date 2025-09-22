import type { UserContentWithDetails } from '@tkhwang-pico/supabase';
import { CircleCheckBig, Clock, ExternalLink, Heart } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { SiteFavicon } from '@/components/ui/site-favicon';
import { Text } from '@/components/ui/text';
import { useContentActions } from '@/hooks/use-content-actions';
import { formatArchiveDate, formatDate } from '@/utils/content-formatters';

interface ContentItemListProps {
  item: UserContentWithDetails;
  onPress?: (item: UserContentWithDetails) => void;
  isLiked?: boolean;
  showCompletedTime?: boolean;
}

export function ContentItemList({
  item,
  onPress,
  isLiked = false,
  showCompletedTime = false,
}: ContentItemListProps) {
  const { openURL } = useContentActions();
  const content = item.contents;

  if (!item || !content) {
    return null;
  }

  const handlePress = () => {
    if (onPress) onPress(item);
  };

  const handleLongPress = () => {
    const url = content.canonical_url || content.url;
    openURL(url);
  };

  const isCompleted = item.todo_status === 'completed';

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={500}
      activeOpacity={0.7}
      className="flex-row items-center rounded-lg bg-white px-3 py-2.5 dark:bg-gray-800"
    >
      {/* Status Icon */}
      <View className="mr-2.5">
        {isCompleted ? (
          <Icon as={CircleCheckBig} className="h-4 w-4 text-green-500" />
        ) : (
          <View className="h-4 w-4 items-center justify-center rounded-full border-2 border-blue-500 bg-transparent" />
        )}
      </View>

      {/* Content */}
      <View className="flex-1 pr-2">
        {/* Title */}
        <Text className="text-sm font-medium text-gray-900 dark:text-gray-100" numberOfLines={1}>
          {content.title || 'Untitled'}
        </Text>

        {/* Metadata row */}
        <View className="mt-0.5 flex-row items-center">
          <SiteFavicon
            url={(content.metadata as any)?.favicon_url || null}
            size={10}
            className="mr-1"
          />
          <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
            {content.domain || 'CONTENT'}
          </Text>
          <Text className="mx-1 text-xs text-gray-400">•</Text>
          <Icon as={Clock} size={10} className="mr-0.5 text-gray-400 dark:text-gray-500" />
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {showCompletedTime && item.completed_at
              ? formatArchiveDate(item.completed_at).time
              : item.saved_at
                ? formatDate(item.saved_at)
                : ''}
          </Text>
        </View>
      </View>

      {/* Right side indicators */}
      <View className="flex-row items-center gap-1.5">
        {isLiked && <Icon as={Heart} className="h-3.5 w-3.5 fill-rose-200 text-rose-500" />}
        <View className="opacity-40">
          <Icon as={ExternalLink} className="h-3 w-3 text-gray-400 dark:text-gray-500" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
