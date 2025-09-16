import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

interface ContentMetadataProps {
  domain?: string;
  date?: string;
  readingTime?: string;
  score?: number;
  scoreColor?: string;
  className?: string;
  rightElement?: React.ReactNode;
}

/**
 * Reusable content metadata display component
 */
export function ContentMetadata({
  domain,
  date,
  readingTime,
  score,
  scoreColor,
  className = '',
  rightElement,
}: ContentMetadataProps) {
  return (
    <View className={`mb-1.5 flex-row items-center justify-between ${className}`}>
      <View className="flex-1 flex-row items-center">
        {score !== undefined && scoreColor && (
          <>
            <Text className={`text-xs font-medium ${scoreColor}`}>{score}% Match</Text>
            <Text className="mx-1 text-xs text-gray-400">•</Text>
          </>
        )}
        {domain && (
          <>
            <Text className="text-xs text-gray-400 dark:text-gray-500">{domain}</Text>
            {(date || readingTime) && <Text className="mx-1 text-xs text-gray-400">•</Text>}
          </>
        )}
        {date && (
          <>
            <Text className="text-xs text-gray-400 dark:text-gray-500">{date}</Text>
            {readingTime && <Text className="mx-1 text-xs text-gray-400">•</Text>}
          </>
        )}
        {readingTime && (
          <Text className="text-xs text-gray-400 dark:text-gray-500">{readingTime}</Text>
        )}
      </View>
      {rightElement && rightElement}
    </View>
  );
}
