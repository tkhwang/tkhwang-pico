import type { UserContentWithDetails } from '@tkhwang-pico/supabase';
import { Circle, CircleCheckBig, Heart } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { SiteFavicon } from '@/components/ui/site-favicon';
import { Text } from '@/components/ui/text';
import { useContentActions } from '@/hooks/use-content-actions';
import { getThumbnailUrl } from '@/utils/content-formatters';

import { ContentThumbnail } from './sub/content-thumbnail';

interface ContentItemSmallCardProps {
  item: UserContentWithDetails;
  onPress?: (item: UserContentWithDetails) => void;
  isLiked?: boolean;
  showCompletedTime?: boolean;
}

export function ContentItemSmallCard({
  item,
  onPress,
  isLiked = false,
}: ContentItemSmallCardProps) {
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

  const thumbnailUrl = getThumbnailUrl(content);
  const isCompleted = item.todo_status === 'completed';

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={500}
      activeOpacity={0.7}
      className="flex-1 rounded-lg border border-gray-100 bg-white p-2.5 dark:border-gray-700 dark:bg-gray-800"
    >
      {/* Thumbnail */}
      {thumbnailUrl ? (
        <ContentThumbnail
          imageUrl={thumbnailUrl}
          size="medium"
          className="mb-2 h-24 w-full rounded-md"
        />
      ) : (
        <View className="mb-2 h-24 w-full rounded-md bg-gray-100 dark:bg-gray-700" />
      )}

      {/* Status Icons Row */}
      <View className="mb-1.5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          {isCompleted ? (
            <Icon as={CircleCheckBig} className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Icon as={Circle} className="h-3.5 w-3.5 text-blue-500" />
          )}
          {isLiked && <Icon as={Heart} className="h-3 w-3 text-rose-500" fill="currentColor" />}
        </View>
      </View>

      {/* Title */}
      <Text
        className="mb-1.5 text-sm font-medium text-gray-900 dark:text-gray-100"
        numberOfLines={2}
      >
        {content.title || 'Untitled'}
      </Text>

      {/* Domain with favicon */}
      <View className="flex-row items-center">
        <SiteFavicon
          url={(content.metadata as any)?.favicon_url || null}
          size={10}
          className="mr-1"
        />
        <Text className="flex-1 text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
          {content.domain || 'CONTENT'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
