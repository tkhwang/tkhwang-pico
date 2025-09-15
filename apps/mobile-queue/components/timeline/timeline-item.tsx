import React from 'react';
import { View, TouchableOpacity, Linking, Image, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ClockIcon, ExternalLinkIcon, FileText } from 'lucide-react-native';
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

  const handleLongPress = async () => {
    const url = content?.canonical_url || content?.url;
    if (!url) {
      Alert.alert('No URL', 'No URL available for this content');
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      Alert.alert('Unsafe URL', 'Only http(s) URLs are allowed.');
      return;
    }

    try {
      const isSupported = await Linking.canOpenURL(url);
      if (isSupported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unable to open', `Cannot open URL: ${url}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open URL');
      if (__DEV__) console.error('Error opening URL:', error);
    }
  };

  return (
    <TouchableOpacity
      onLongPress={handleLongPress}
      delayLongPress={500}
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
          {/* Top Header Row - Domain and Hold indicator */}
          <View className="mb-2 flex-row items-center justify-between">
            {/* Domain - Left */}
            {content?.domain && (
              <View className="self-start rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
                <Text className="text-xs text-gray-600 dark:text-gray-400">{content.domain}</Text>
              </View>
            )}

            {/* Hold to open link indicator - Right */}
            <View className="flex-row items-center opacity-60">
              <Icon
                as={ExternalLinkIcon}
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
                  numberOfLines={2}>
                  {content.summary}
                </Text>
              )}

              {/* Spacer to push time to bottom */}
              <View className="flex-1" />

              {/* Completed Time - aligned with thumbnail bottom */}
              <View className="mt-2 flex-row items-center">
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
                  <Icon as={FileText} className="h-10 w-10 text-gray-400 dark:text-gray-600" />
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
      <View>
        {items.map((item, index) => (
          <View key={item.id} className={index > 0 ? 'mt-3' : ''}>
            <TimelineCard item={item} isFirstOfDay={index === 0} />
          </View>
        ))}
      </View>

      {/* Date separator */}
      <View className="mt-4 h-px bg-gray-200 dark:bg-gray-700" />
    </View>
  );
}
