import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';

interface ContentTagsProps {
  tags: string[] | unknown[];
  variant?: 'default' | 'purple';
  maxTags?: number;
  expandable?: boolean;
  initialMaxTags?: number;
  className?: string;
}

/**
 * Reusable content tags display component
 */
export function ContentTags({
  tags,
  variant = 'default',
  maxTags = 3,
  expandable = false,
  initialMaxTags = 6,
  className = '',
}: ContentTagsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!tags || tags.length === 0) return null;

  const bgColor =
    variant === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800';
  const textColor =
    variant === 'purple'
      ? 'text-purple-600 dark:text-purple-400'
      : 'text-gray-500 dark:text-gray-400';

  // Determine which tags to display
  let displayTags = tags;
  let showToggle = false;

  if (expandable && tags.length > initialMaxTags) {
    showToggle = true;
    displayTags = isExpanded ? tags : tags.slice(0, initialMaxTags);
  } else if (maxTags && !expandable) {
    displayTags = tags.slice(0, maxTags);
  }

  const remainingCount = tags.length - initialMaxTags;

  return (
    <View className={className}>
      <View className="flex-row flex-wrap">
        {displayTags.map((tag, index) => (
          <View
            key={`tag-${index}`}
            className={`mr-1.5 mt-1 rounded-full px-1.5 py-0.5 ${bgColor}`}>
            <Text className={`text-[10px] ${textColor}`}>{String(tag)}</Text>
          </View>
        ))}
        {showToggle && (
          <TouchableOpacity
            onPress={() => setIsExpanded(!isExpanded)}
            className="mr-1.5 mt-1 rounded-full border border-gray-300 bg-transparent px-2 py-0.5 dark:border-gray-600"
            activeOpacity={0.7}>
            <Text className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
              {isExpanded ? 'Show less' : `+${remainingCount} more`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
