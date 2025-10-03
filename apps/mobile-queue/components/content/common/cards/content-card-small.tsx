import type { UserContentWithDetails } from '@tkhwang-pico/supabase';
import { CalendarDays, CheckCircle, CircleCheckBig, Heart } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { ContentThumbnail } from '@/components/content/common/sub/content-thumbnail';
import { Icon } from '@/components/ui/icon';
import { SiteFavicon } from '@/components/ui/site-favicon';
import { Text } from '@/components/ui/text';
import { PRIORITY_STYLES } from '@/consts/app-styles';
import { ContentDate } from '@/domains/value-object/content-date';
import { useContentActions } from '@/hooks/use-content-actions';
import { getThumbnailUrl } from '@/utils/content-formatters';
import { DEFAULT_PRIORITY, type PriorityValue } from '@/utils/priority';
import { getFaviconUrl } from '@/utils/url';

interface ContentCardSmallProps {
  item: UserContentWithDetails;
  onPress?: (item: UserContentWithDetails) => void;
  isLiked?: boolean;
  showCompletedTime?: boolean;
}

export function ContentCardSmall({
  item,
  onPress,
  isLiked = false,
  showCompletedTime = false,
}: ContentCardSmallProps) {
  const { openURL } = useContentActions();
  const content = item.contents;
  const faviconUrl = getFaviconUrl(content?.metadata);

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
  const priorityValue = (item.priority ?? DEFAULT_PRIORITY) as PriorityValue;
  const priorityStyle = PRIORITY_STYLES[priorityValue];
  const sideAccentClassName = priorityValue === 'high' ? priorityStyle.dot : undefined;

  const scheduledDate = item.scheduled_for ? new ContentDate(item.scheduled_for) : null;
  const completedDate = item.completed_at ? new ContentDate(item.completed_at) : null;

  const timeLabel = (showCompletedTime ? completedDate : scheduledDate)?.toSimpleString() ?? '—';
  const timeIcon = showCompletedTime ? CheckCircle : CalendarDays;
  const timeIconColor = showCompletedTime ? 'text-green-500' : 'text-gray-400 dark:text-gray-500';

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={500}
      activeOpacity={0.7}
      className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-sm shadow-black/5 dark:border-gray-700 dark:bg-gray-800"
    >
      {sideAccentClassName ? (
        <View className={`absolute bottom-0 left-0 top-0 w-1 ${sideAccentClassName}`} />
      ) : null}
      {/* Domain with favicon */}
      <View className="mb-2 flex-row items-center">
        <SiteFavicon url={faviconUrl} size={10} className="mr-1" />
        <Text className="flex-1 text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
          {content.domain || 'CONTENT'}
        </Text>
      </View>

      {/* Thumbnail */}
      {thumbnailUrl ? (
        <ContentThumbnail
          imageUrl={thumbnailUrl}
          size="medium"
          className="mb-2 h-32 w-full rounded-md"
        />
      ) : (
        <View className="mb-2 h-32 w-full rounded-md bg-gray-100 dark:bg-gray-700" />
      )}

      {/* Title */}
      <Text
        className="mb-1.5 min-h-[40px] text-sm font-medium leading-tight text-gray-900 dark:text-gray-100"
        numberOfLines={2}
      >
        {content.title || 'Untitled'}
      </Text>

      <View className="mt-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          <View className="relative">
            {isCompleted ? (
              <Icon as={CircleCheckBig} className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <View className="h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-blue-500 bg-transparent" />
            )}
            {isLiked ? (
              <View className="absolute -bottom-1 -right-1 h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-200">
                <Icon as={Heart} className="h-2 w-2 text-rose-600" fill="currentColor" />
              </View>
            ) : null}
          </View>
        </View>
        <View className="flex-row items-center gap-1">
          <Icon as={timeIcon} className={`h-3.5 w-3.5 ${timeIconColor}`} />
          <Text className="text-xs font-medium text-gray-600 dark:text-gray-300" numberOfLines={1}>
            {timeLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
