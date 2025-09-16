import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

interface ContentTagsProps {
  tags: string[] | unknown[];
  variant?: 'default' | 'purple';
  maxTags?: number;
  className?: string;
}

/**
 * Reusable content tags display component
 */
export function ContentTags({
  tags,
  variant = 'default',
  maxTags = 3,
  className = '',
}: ContentTagsProps) {
  if (!tags || tags.length === 0) return null;

  const bgColor =
    variant === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800';
  const textColor =
    variant === 'purple'
      ? 'text-purple-600 dark:text-purple-400'
      : 'text-gray-500 dark:text-gray-400';

  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;

  return (
    <View className={`mt-1 flex-row flex-wrap ${className}`}>
      {displayTags.map((tag, index) => (
        <View key={`tag-${index}`} className={`mr-1.5 mt-1 rounded-full px-1.5 py-0.5 ${bgColor}`}>
          <Text className={`text-[10px] ${textColor}`}>{String(tag)}</Text>
        </View>
      ))}
    </View>
  );
}
