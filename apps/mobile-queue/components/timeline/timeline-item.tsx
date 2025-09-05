import React from 'react';
import { View, TouchableOpacity, Linking, Image } from 'react-native';
import { Text } from '../ui/text';
import { Icon } from '../ui/icon';
import { ClockIcon } from 'lucide-react-native';
import type { UserContentWithDetails } from '@tkhwang-pico/common';

interface TimelineCardProps {
  item: UserContentWithDetails;
  isFirstOfDay?: boolean;
}

function TimelineCard({ item, isFirstOfDay = false }: TimelineCardProps) {
  const content = item.contents;

  // Parse completed date
  const completedDate = item.completed_at ? new Date(item.completed_at) : null;
  const dayOfWeek = completedDate
    ? completedDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
    : '';
  const dayOfMonth = completedDate ? completedDate.getDate() : '';
  const completedTime = completedDate
    ? completedDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '';

  const handlePress = () => {
    if (content?.url) {
      Linking.openURL(content.url).catch((err) => console.error('Failed to open URL:', err));
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <View className="flex-row py-3 pl-1.5 pr-3">
        {/* Date Column - Left */}
        <View className="mr-2 w-10 items-center justify-center">
          {isFirstOfDay ? (
            <>
              <Text className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                {dayOfWeek}
              </Text>
              <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {dayOfMonth}
              </Text>
            </>
          ) : (
            <View className="h-9" />
          )}
        </View>

        {/* Content - Right */}
        <View className="flex-1">
          {/* Domain - Top */}
          {content?.domain && (
            <View className="mb-2 self-start rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
              <Text className="text-xs text-gray-600 dark:text-gray-400">{content.domain}</Text>
            </View>
          )}

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

              {/* Spacer to push time to bottom */}
              <View className="flex-1" />

              {/* Completed Time - aligned with thumbnail bottom */}
              <View className="flex-row items-center">
                <Icon as={ClockIcon} size={12} className="mr-1 text-gray-500 dark:text-gray-500" />
                <Text className="text-xs text-gray-500 dark:text-gray-500">{completedTime}</Text>
              </View>
            </View>

            {/* Thumbnail */}
            <View className="ml-3">
              {content?.metadata &&
              typeof content.metadata === 'object' &&
              'image_url' in content.metadata &&
              content.metadata.image_url ? (
                <Image
                  source={{ uri: content.metadata.image_url as string }}
                  className="h-20 w-20 rounded-lg bg-gray-200 dark:bg-gray-700"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-20 w-20 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                  <Text className="text-2xl">📄</Text>
                </View>
              )}
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

interface TimelineItemProps {
  date: string;
  items: UserContentWithDetails[];
}

export function TimelineItem({ items }: TimelineItemProps) {
  return (
    <View className="mb-4">
      {/* Items for this date */}
      <View className="space-y-3">
        {items.map((item, index) => (
          <TimelineCard key={item.id} item={item} isFirstOfDay={index === 0} />
        ))}
      </View>

      {/* Date separator */}
      <View className="mt-4 h-px bg-gray-200 dark:bg-gray-700" />
    </View>
  );
}
