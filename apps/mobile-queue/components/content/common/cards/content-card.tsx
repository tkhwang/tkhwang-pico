import type { UserContentWithDetails } from '@tkhwang-pico/supabase';
import { CalendarDays, CheckCircle, CircleCheckBig, Heart } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { BaseContentCard } from '@/components/content/common/cards/base-content-card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ContentDate } from '@/domains/value-object/content-date';
import { useContentActions } from '@/hooks/use-content-actions';
import { formatReadingTime, getThumbnailUrl } from '@/utils/content-formatters';

const getFaviconUrl = (metadata: unknown): string | null => {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }

  const { favicon_url } = metadata as { favicon_url?: unknown };

  return typeof favicon_url === 'string' ? favicon_url : null;
};

interface ContentCardProps {
  item: UserContentWithDetails;
  onPress?: (item: UserContentWithDetails) => void;
  isLiked?: boolean;
  showCompletedTime?: boolean;
}

export function ContentCard({
  item,
  onPress,
  isLiked = false,
  showCompletedTime = false,
}: ContentCardProps) {
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
  const faviconUrl = getFaviconUrl(content.metadata);
  const scheduledDate = item.scheduled_for ? new ContentDate(item.scheduled_for) : null;
  const completedDate = item.completed_at ? new ContentDate(item.completed_at) : null;

  const scheduleLabel = showCompletedTime
    ? (completedDate?.toSimpleString() ?? '—')
    : (scheduledDate?.toSimpleString() ?? '—');

  const metadataRightElement = (
    <View className="flex-row items-center gap-1">
      <Icon
        as={showCompletedTime ? CheckCircle : CalendarDays}
        className={showCompletedTime ? 'h-3.5 w-3.5 text-green-500' : 'h-3.5 w-3.5 text-blue-500'}
      />
      <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
        {scheduleLabel}
      </Text>
    </View>
  );

  // Create checkbox slot
  const checkboxSlot = (
    <View className="mr-2 mt-0.5">
      <View className="relative">
        {item.todo_status === 'completed' ? (
          <Icon as={CircleCheckBig} className="h-5 w-5 text-green-500" />
        ) : (
          <View className="h-5 w-5 items-center justify-center rounded-full border-2 border-blue-500 bg-transparent" />
        )}
        {isLiked ? (
          <View className="absolute -bottom-1 -right-1 h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-200">
            <Icon as={Heart} className="h-2 w-2 text-rose-600" fill="currentColor" />
          </View>
        ) : null}
      </View>
    </View>
  );

  return (
    <BaseContentCard
      title={content.title ?? content.url}
      summary={content.summary || undefined}
      note={item.note || undefined}
      tags={content.tags || undefined}
      labels={item.labels || undefined}
      thumbnailUrl={thumbnailUrl || undefined}
      isCompleted={item.todo_status === 'completed' && !showCompletedTime}
      onPress={handlePress}
      onLongPress={handleLongPress}
      leftSlot={checkboxSlot}
      metadataProps={{
        domain: content.domain || 'CONTENT',
        faviconUrl,
        readingTime: content.word_count ? formatReadingTime(content.word_count) : undefined,
        rightElement: metadataRightElement,
      }}
    />
  );
}
