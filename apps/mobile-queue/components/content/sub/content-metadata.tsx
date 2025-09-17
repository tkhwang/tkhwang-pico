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
        {[
          score !== undefined && scoreColor && (
            <Text key="score" className={`text-xs font-medium ${scoreColor}`}>
              {score}% Match
            </Text>
          ),
          domain && (
            <Text key="domain" className="text-xs text-gray-400 dark:text-gray-500">
              {domain}
            </Text>
          ),
          date && (
            <Text key="date" className="text-xs text-gray-400 dark:text-gray-500">
              {date}
            </Text>
          ),
          readingTime && (
            <Text key="readingTime" className="text-xs text-gray-400 dark:text-gray-500">
              {readingTime}
            </Text>
          ),
        ]
          .filter(Boolean)
          .map((item, index, arr) => (
            <React.Fragment key={index}>
              {item}
              {index < arr.length - 1 && <Text className="mx-1 text-xs text-gray-400">•</Text>}
            </React.Fragment>
          ))}
      </View>
      {rightElement && rightElement}
    </View>
  );
}
