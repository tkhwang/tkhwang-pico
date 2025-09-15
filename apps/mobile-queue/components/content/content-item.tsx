import React from 'react';
import { View, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { Text } from '../ui/text';
import { Icon } from '../ui/icon';
import { ExternalLinkIcon, Check, FileText } from 'lucide-react-native';
import type { UserContentWithDetails } from '@tkhwang-pico/common';

interface ContentItemProps {
  item: UserContentWithDetails;
  onToggleComplete?: (id: string) => void;
  onPress?: (item: UserContentWithDetails) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

export function ContentItem({ item, onToggleComplete, onPress }: ContentItemProps) {
  // Ensure content exists
  const content = item.contents;
  if (!item || !content) {
    return null;
  }

  const handleLongPress = async () => {
    const url = content.canonical_url || content.url;

    if (!url) {
      Alert.alert('No URL', 'No URL available for this content');
      return;
    }

    // Only allow http(s) URLs
    if (!/^https?:\/\//i.test(url)) {
      Alert.alert('Unsafe URL', 'Only http(s) URLs are allowed.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unable to open', `Cannot open URL: ${url}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open URL');
      if (__DEV__) console.error('Error opening URL:', error);
    }
  };

  const handlePress = () => {
    // Open detail modal
    if (onPress) onPress(item);
  };

  const handleCheckboxPress = () => {
    if (onToggleComplete) {
      onToggleComplete(item.id);
    }
  };

  return (
    <TouchableOpacity
      className="rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={500}>
      {/* Meta Information */}
      <View className="mb-1.5 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            {content.domain || 'CONTENT'}
          </Text>
          <Text className="mx-1 text-xs text-gray-400">•</Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            {item.saved_at ? formatDate(item.saved_at) : 'Unknown date'}
          </Text>
          {content.word_count ? (
            <React.Fragment>
              <Text className="mx-1 text-xs text-gray-400">•</Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500">
                {`${Math.ceil(content.word_count / 200)} min`}
              </Text>
            </React.Fragment>
          ) : null}
        </View>
        {/* Long press hint */}
        <View className="flex-row items-center opacity-60">
          <Icon
            as={ExternalLinkIcon}
            className="mr-0.5 h-2.5 w-2.5 text-gray-400 dark:text-gray-500"
          />
          <Text className="text-[10px] text-gray-400 dark:text-gray-500">Hold</Text>
        </View>
      </View>

      {/* Content with thumbnail */}
      <View className="flex-row items-start">
        <TouchableOpacity onPress={handleCheckboxPress} className="mr-2 mt-0.5">
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
        </TouchableOpacity>
        <View className="flex-1 pr-2">
          {/* Title */}
          <Text
            className={`mb-1 text-base font-semibold ${
              item.todo_status === 'completed'
                ? 'text-gray-500 dark:text-gray-500'
                : 'text-gray-900 dark:text-gray-100'
            }`}
            numberOfLines={2}>
            {content.title || 'Untitled'}
          </Text>
          {content.summary ? (
            <Text className="mb-1 text-xs text-gray-600 dark:text-gray-400" numberOfLines={2}>
              {content.summary}
            </Text>
          ) : null}
          {item.note ? (
            <Text
              className="mb-1 text-xs italic text-gray-500 dark:text-gray-500"
              numberOfLines={1}>
              {item.note}
            </Text>
          ) : null}
          {/* Tags from content */}
          {content.tags && content.tags.length > 0 ? (
            <View className="mt-1 flex-row flex-wrap">
              {content.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={`tag-${index}`}
                  className="mr-1.5 mt-1 rounded-full bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">
                  <Text className="text-[10px] text-gray-500 dark:text-gray-400">
                    {String(tag)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          {/* User Labels */}
          {item.labels && item.labels.length > 0 ? (
            <View className="mt-1 flex-row flex-wrap">
              {item.labels.map((label, index) => (
                <View
                  key={`label-${index}`}
                  className="mr-1.5 mt-1 rounded-full bg-purple-100 px-1.5 py-0.5 dark:bg-purple-900/30">
                  <Text className="text-[10px] text-purple-600 dark:text-purple-400">
                    {String(label)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Thumbnail */}
        {content.metadata &&
        typeof content.metadata === 'object' &&
        'image_url' in content.metadata &&
        content.metadata.image_url ? (
          <Image
            source={{ uri: content.metadata.image_url as string }}
            className="h-16 w-16 rounded-md"
            resizeMode="cover"
          />
        ) : (
          <View className="h-16 w-16 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
            <Icon as={FileText} className="h-8 w-8 text-gray-400 dark:text-gray-600" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
