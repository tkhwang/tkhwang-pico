import React from 'react';
import { View, TouchableOpacity, Linking, Image } from 'react-native';
import { Text } from '../ui/text';
import { Icon } from '../ui/icon';
import { ExternalLinkIcon, ClockIcon } from 'lucide-react-native';
import type { UserContentWithDetails } from '@tkhwang-pico/common';

interface TimelineCardProps {
  item: UserContentWithDetails;
}

function TimelineCard({ item }: TimelineCardProps) {
  const content = item.contents;
  const completedTime = item.completed_at
    ? new Date(item.completed_at).toLocaleTimeString('en-US', {
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
      <View className="flex-row p-3">
        {/* Thumbnail */}
        {content?.metadata &&
        typeof content.metadata === 'object' &&
        'image_url' in content.metadata &&
        content.metadata.image_url ? (
          <Image
            source={{ uri: content.metadata.image_url as string }}
            className="mr-3 h-20 w-20 rounded-lg bg-gray-200 dark:bg-gray-700"
            resizeMode="cover"
          />
        ) : (
          <View className="mr-3 h-20 w-20 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
            <Text className="text-2xl">📄</Text>
          </View>
        )}

        {/* Content Info */}
        <View className="flex-1">
          <Text
            className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-100"
            numberOfLines={2}>
            {content?.title || 'Untitled'}
          </Text>

          {content?.summary && (
            <Text className="mb-2 text-sm text-gray-600 dark:text-gray-400" numberOfLines={1}>
              {content.summary}
            </Text>
          )}

          {/* Time and Domain */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Icon as={ClockIcon} size={12} className="mr-1 text-gray-500 dark:text-gray-500" />
              <Text className="text-xs text-gray-500 dark:text-gray-500">{completedTime}</Text>
            </View>

            {content?.domain && (
              <View className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
                <Text className="text-xs text-gray-600 dark:text-gray-400">{content.domain}</Text>
              </View>
            )}
          </View>
        </View>

        {/* External Link Icon */}
        {content?.url && (
          <View className="ml-2 justify-center">
            <Icon as={ExternalLinkIcon} size={16} className="text-gray-400 dark:text-gray-500" />
          </View>
        )}
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

export function TimelineItem({ date, items }: TimelineItemProps) {
  return (
    <View className="mb-6">
      {/* Date Header */}
      <View className="mb-3 flex-row items-center">
        <View className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        <Text className="mx-3 text-sm font-semibold text-gray-600 dark:text-gray-400">{date}</Text>
        <View className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </View>

      {/* Items for this date */}
      <View className="space-y-3">
        {items.map((item) => (
          <TimelineCard key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
}
