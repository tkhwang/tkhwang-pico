import type { UserContentWithDetails } from '@tkhwang-pico/supabase';
import {
  CalendarDays,
  CheckCircle,
  CircleCheckBig,
  ExternalLink,
  Heart,
} from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { SiteFavicon } from '@/components/ui/site-favicon';
import { Text } from '@/components/ui/text';
import { PRIORITY_STYLES } from '@/consts/app-styles';
import { ContentDate } from '@/domains/value-object/content-date';
import { useContentActions } from '@/hooks/use-content-actions';
import { DEFAULT_PRIORITY, PRIORITY_LABELS, type PriorityValue } from '@/utils/priority';
import { getFaviconUrl } from '@/utils/url';

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

  const isCompleted = item.todo_status === 'completed';
  const priorityValue = (item.priority ?? DEFAULT_PRIORITY) as PriorityValue;
  const priorityStyle = PRIORITY_STYLES[priorityValue];
  const scheduledDate = item.scheduled_for ? new ContentDate(item.scheduled_for) : null;
  const completedDate = item.completed_at ? new ContentDate(item.completed_at) : null;

  const scheduleLabel = showCompletedTime
    ? (completedDate?.toSimpleString() ?? '')
    : (scheduledDate?.toSimpleString() ?? '');

  const scheduleIconClass = showCompletedTime
    ? completedDate
      ? 'text-emerald-500 dark:text-emerald-300'
      : 'text-gray-400 dark:text-gray-500'
    : scheduledDate
      ? 'text-blue-500 dark:text-blue-300'
      : 'text-gray-300 dark:text-gray-600';

  const scheduleTextClass = showCompletedTime
    ? completedDate
      ? 'text-emerald-700 dark:text-emerald-300'
      : 'text-gray-400 dark:text-gray-500'
    : scheduledDate
      ? 'text-gray-800 dark:text-gray-100'
      : 'text-gray-400 dark:text-gray-500';

  const priorityBadge = (
    <View className={`flex-row items-center rounded-full px-1.5 py-0.5 ${priorityStyle.badge}`}>
      <View className={`mr-1 h-1.5 w-1.5 rounded-full ${priorityStyle.dot}`} />
      <Text className={`text-[10px] font-semibold uppercase ${priorityStyle.text}`}>
        {PRIORITY_LABELS[priorityValue]}
      </Text>
    </View>
  );

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
          <SiteFavicon url={faviconUrl} size={10} className="mr-1" />
          <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
            {content.domain || 'CONTENT'}
          </Text>
          <Text className="mx-1 text-xs text-gray-400">•</Text>
          {priorityBadge}
          <Text className="mx-1 text-xs text-gray-400">•</Text>
          <Icon
            as={showCompletedTime ? CheckCircle : CalendarDays}
            className={`h-3 w-3 ${scheduleIconClass}`}
          />
          <Text className={`text-xs font-medium ${scheduleTextClass}`} numberOfLines={1}>
            {scheduleLabel}
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
