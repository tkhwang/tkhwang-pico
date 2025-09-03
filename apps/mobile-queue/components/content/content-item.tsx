import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '../ui/text';
import type { UserContentWithDetails } from '@tkhwang-pico/common';

interface ContentItemProps {
  item: UserContentWithDetails;
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

export function ContentItem({ item }: ContentItemProps) {
  // Ensure content exists - check both possible field names
  const content = item.content || item.contents;
  if (!item || !content) {
    return null;
  }

  return (
    <TouchableOpacity className="mb-4 rounded-lg border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <View className="mb-2 flex-row items-center">
        <Text className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">
          {content.domain || 'CONTENT'}
        </Text>
        {item.is_public && (
          <View className="ml-2 rounded-full bg-green-100 px-2 py-0.5 dark:bg-green-900/50">
            <Text className="text-xs font-medium text-green-600 dark:text-green-400">Public</Text>
          </View>
        )}
      </View>
      <View className="flex-row items-start">
        <View
          className={`mr-3 mt-1 h-5 w-5 rounded-full border-2 ${item.archived ? 'border-gray-300 bg-gray-50 dark:bg-gray-900/20' : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'}`}>
          {item.archived && <Text className="text-center text-xs text-gray-500">✓</Text>}
        </View>
        <View className="flex-1">
          <Text
            className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100"
            numberOfLines={2}>
            {content.title || 'Untitled'}
          </Text>
          {content.summary && (
            <Text className="mb-2 text-sm text-gray-600 dark:text-gray-400" numberOfLines={3}>
              {content.summary}
            </Text>
          )}
          {item.note && (
            <Text className="mb-2 text-sm italic text-gray-500 dark:text-gray-500">
              {item.note}
            </Text>
          )}
          <View className="flex-row items-center">
            <Text className="text-xs text-gray-500 dark:text-gray-500">
              {formatDate(item.saved_at)}
            </Text>
            {content.word_count && (
              <View className="flex-row items-center">
                <Text className="mx-2 text-xs text-gray-400">•</Text>
                <Text className="text-xs text-gray-500 dark:text-gray-500">
                  {`${Math.ceil(content.word_count / 200)} min read`}
                </Text>
              </View>
            )}
          </View>
          {item.labels && item.labels.length > 0 && (
            <View className="mt-2 flex-row flex-wrap">
              {item.labels.map((label, index) => (
                <View
                  key={index}
                  className="mr-2 mt-1 rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-700">
                  <Text className="text-xs text-gray-600 dark:text-gray-400">{String(label)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <Text className="text-2xl">📄</Text>
      </View>
    </TouchableOpacity>
  );
}
