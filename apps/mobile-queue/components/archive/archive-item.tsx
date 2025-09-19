import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Clock, ExternalLink, Heart } from 'lucide-react-native';
import { ContentThumbnail } from '@/components/content/sub/content-thumbnail';
import { formatArchiveDate } from '@/utils/content-formatters';
import { useContentActions } from '@/hooks/use-content-actions';
import type { UserContentWithDetails } from '@tkhwang-pico/common';

interface ArchiveCardProps {
  item: UserContentWithDetails;
  isFirstOfDay?: boolean;
  onPress?: (item: UserContentWithDetails) => void;
}

export function ArchiveCard({ item, isFirstOfDay = false, onPress }: ArchiveCardProps) {
  const { openURL } = useContentActions();
  const content = item.contents;
  const isLiked =
    item.preferences?.some((preference) => preference.preference_type === 'liked') ?? false;

  // Parse completed date
  const dateInfo = item.completed_at ? formatArchiveDate(item.completed_at) : null;

  const handleLongPress = () => {
    const url = content?.canonical_url || content?.url;
    openURL(url);
  };

  return (
    <TouchableOpacity
      onPress={() => onPress?.(item)}
      onLongPress={handleLongPress}
      delayLongPress={500}
      activeOpacity={0.7}
      className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <View className="flex-row py-3 pl-1.5 pr-3">
        {/* Date Column - Left */}
        <View className="mr-2 w-12 items-center">
          {isFirstOfDay ? (
            <View className="items-center">
              <Text className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                {dateInfo?.dayOfWeek}
              </Text>
              <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {dateInfo?.dayOfMonth}
              </Text>
            </View>
          ) : (
            <View className="h-9" />
          )}
        </View>

        {/* Content - Right */}
        <View className="flex-1">
          {/* Top Header Row - Domain, Like icon and Hold indicator */}
          <View className="mb-2 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              {/* Like Icon - Separate */}
              {isLiked && <Icon as={Heart} className="h-3.5 w-3.5 fill-rose-200 text-rose-500" />}

              {/* Domain - Left */}
              {content?.domain && (
                <View className="flex-row items-center self-start rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
                  <Text className="text-xs text-gray-600 dark:text-gray-400">{content.domain}</Text>
                </View>
              )}
            </View>

            {/* Hold to open link indicator - Right */}
            <View className="flex-row items-center opacity-60">
              <Icon
                as={ExternalLink}
                className="mr-0.5 h-2.5 w-2.5 text-gray-400 dark:text-gray-500"
              />
              <Text className="text-[10px] text-gray-400 dark:text-gray-500">Hold</Text>
            </View>
          </View>

          {/* Title and Thumbnail Row */}
          <View className="flex-row">
            {/* Content Info */}
            <View className="flex-1 justify-between">
              {/* Title */}
              <Text
                className="text-base font-semibold text-gray-900 dark:text-gray-100"
                numberOfLines={2}>
                {content?.title || 'Untitled'}
              </Text>

              {/* Summary */}
              {content?.summary && (
                <Text
                  className="mb-2 mt-1 text-xs text-gray-600 dark:text-gray-400"
                  numberOfLines={3}>
                  {content.summary}
                </Text>
              )}

              {/* Spacer to push time to bottom */}
              <View className="flex-1" />

              {/* Completed Time - aligned with thumbnail bottom */}
              <View className="mt-2 flex-row items-center">
                <Icon as={Clock} size={12} className="mr-1 text-gray-500 dark:text-gray-500" />
                <Text className="text-xs text-gray-500 dark:text-gray-500">{dateInfo?.time}</Text>
              </View>
            </View>

            {/* Thumbnail */}
            <View className="ml-3">
              <ContentThumbnail
                imageUrl={
                  content?.metadata &&
                  typeof content.metadata === 'object' &&
                  'image_url' in content.metadata
                    ? (content.metadata.image_url as string)
                    : undefined
                }
                size="large"
                className="rounded-lg"
              />
            </View>
          </View>
        </View>
      </View>

      {/* Note if exists */}
      {item.note && (
        <View className="border-t border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900/50">
          <Text className="text-xs text-gray-600 dark:text-gray-400">{item.note}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface ArchiveItemProps {
  date: string;
  items: UserContentWithDetails[];
  onPress?: (item: UserContentWithDetails) => void;
}

export function ArchiveItem({ items, onPress }: ArchiveItemProps) {
  return (
    <View className="mb-4">
      {/* Items for this date */}
      <View>
        {items.map((item, index) => (
          <View key={item.id} className={index > 0 ? 'mt-3' : ''}>
            <ArchiveCard item={item} isFirstOfDay={index === 0} onPress={onPress} />
          </View>
        ))}
      </View>

      {/* Date separator */}
      <View className="mt-4 h-px bg-gray-200 dark:bg-gray-700" />
    </View>
  );
}
