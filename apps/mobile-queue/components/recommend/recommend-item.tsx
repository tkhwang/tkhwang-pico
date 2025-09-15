import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from '../ui/text';
import { Icon } from '../ui/icon';
import { TrendingUpIcon, CalendarIcon, UserIcon } from 'lucide-react-native';
import type { Recommendation } from '@tkhwang-pico/common';

interface RecommendItemProps {
  recommendation: Recommendation;
  onPress: (recommendation: Recommendation) => void;
}

export function RecommendItem({ recommendation, onPress }: RecommendItemProps) {
  const content = recommendation.contents;
  if (!content) return null;

  // Parse published date if available
  const publishedDate = content.published_at
    ? new Date(content.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  // Format score as percentage (0-100)
  const scorePercentage = Math.round(recommendation.score * 100);

  const handlePress = () => {
    onPress(recommendation);
  };

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <View className="p-4">
        {/* Score Indicator */}
        <View className="mb-2 flex-row items-center">
          <Icon
            as={TrendingUpIcon}
            size={14}
            className={`mr-1 ${getScoreColor(scorePercentage)}`}
          />
          <Text className={`text-xs font-medium ${getScoreColor(scorePercentage)}`}>
            {scorePercentage}% Match
          </Text>

          {/* Tags if available */}
          {content.tags && content.tags.length > 0 && (
            <>
              <Text className="mx-2 text-gray-300 dark:text-gray-600">•</Text>
              <View className="flex-1 flex-row flex-wrap">
                {content.tags.slice(0, 3).map((tag, index) => (
                  <View
                    key={index}
                    className="mb-1 mr-1 rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
                    <Text className="text-xs text-gray-600 dark:text-gray-400">#{tag}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Header Row - Domain */}
        <View className="mb-2 flex-row items-center">
          {/* Domain */}
          {content.domain && (
            <View className="self-start rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
              <Text className="text-xs text-gray-600 dark:text-gray-400">{content.domain}</Text>
            </View>
          )}
        </View>

        {/* Main Content Row */}
        <View className="flex-row">
          {/* Content Info */}
          <View className="flex-1 pr-3">
            {/* Title */}
            <Text
              className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100"
              numberOfLines={2}>
              {content.title || 'Untitled'}
            </Text>

            {/* Summary if available */}
            {content.summary && (
              <Text className="mb-2 text-sm text-gray-600 dark:text-gray-400" numberOfLines={2}>
                {content.summary}
              </Text>
            )}

            {/* Metadata Row */}
            <View className="flex-row flex-wrap items-center">
              {/* Author */}
              {content.author && (
                <View className="mr-3 flex-row items-center">
                  <Icon as={UserIcon} size={12} className="mr-1 text-gray-500" />
                  <Text className="text-xs text-gray-500 dark:text-gray-500">{content.author}</Text>
                </View>
              )}

              {/* Published Date */}
              {publishedDate && (
                <View className="flex-row items-center">
                  <Icon as={CalendarIcon} size={12} className="mr-1 text-gray-500" />
                  <Text className="text-xs text-gray-500 dark:text-gray-500">{publishedDate}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Thumbnail */}
          <View>
            {content.metadata &&
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
                <Text className="text-2xl">📚</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
