import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { ExternalLinkIcon, Check, Heart } from 'lucide-react-native';
import { BaseContentCard } from '@/components/content/base-content-card';
import { formatDate, formatReadingTime, getThumbnailUrl } from '@/hooks/use-content-formatters';
import { useContentActions } from '@/hooks/use-content-actions';
import type { UserContentWithDetails } from '@tkhwang-pico/common';
import { Text } from '@/components/ui/text';

interface ContentItemProps {
  item: UserContentWithDetails;
  onToggleComplete?: (id: string) => void;
  onPress?: (item: UserContentWithDetails) => void;
  isLiked?: boolean;
}

export function ContentItem({
  item,
  onToggleComplete,
  onPress,
  isLiked = false,
}: ContentItemProps) {
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

  const handleCheckboxPress = () => {
    if (onToggleComplete) {
      onToggleComplete(item.id);
    }
  };

  const thumbnailUrl = getThumbnailUrl(content);

  // Create checkbox slot
  const checkboxSlot = (
    <TouchableOpacity onPress={handleCheckboxPress} className="mr-2 mt-0.5">
      <View className="relative">
        <View
          className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
            item.todo_status === 'completed'
              ? 'border-green-500 bg-green-500'
              : 'border-blue-500 bg-transparent'
          }`}>
          {item.todo_status === 'completed' ? (
            <Icon as={Check} className="h-3 w-3 text-white" />
          ) : null}
        </View>
        {isLiked ? (
          <View className="absolute -bottom-1 -right-1 h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-200">
            <Icon as={Heart} className="h-2 w-2 text-rose-600" />
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  // Create long press hint element
  const longPressHint = (
    <View className="flex-row items-center opacity-60">
      <Icon as={ExternalLinkIcon} className="mr-0.5 h-2.5 w-2.5 text-gray-400 dark:text-gray-500" />
      <Text className="text-[10px] text-gray-400 dark:text-gray-500">Hold</Text>
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
      isCompleted={item.todo_status === 'completed'}
      onPress={handlePress}
      onLongPress={handleLongPress}
      leftSlot={checkboxSlot}
      metadataProps={{
        domain: content.domain || 'CONTENT',
        date: item.saved_at ? formatDate(item.saved_at) : 'Unknown date',
        readingTime: content.word_count ? formatReadingTime(content.word_count) : undefined,
        rightElement: longPressHint,
      }}
    />
  );
}
