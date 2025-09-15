import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Sparkles, FileText } from 'lucide-react-native';
import type { Recommendation } from '@tkhwang-pico/common';

interface RecommendItemProps {
  recommendation: Recommendation;
  onPress: (recommendation: Recommendation) => void;
}

export function RecommendItem({ recommendation, onPress }: RecommendItemProps) {
  const content = recommendation.contents;
  if (!content) return null;

  // Format date similar to ContentItem
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
      className="rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      {/* Meta Information - Similar to ContentItem */}
      <View className="mb-1.5 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <Text className={`text-xs font-medium ${getScoreColor(scorePercentage)}`}>
            {scorePercentage}% Match
          </Text>
          <Text className="mx-1 text-xs text-gray-400">•</Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            {content.domain || 'CONTENT'}
          </Text>
          {content.published_at && (
            <>
              <Text className="mx-1 text-xs text-gray-400">•</Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500">
                {formatDate(content.published_at)}
              </Text>
            </>
          )}
          {content.word_count ? (
            <>
              <Text className="mx-1 text-xs text-gray-400">•</Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500">
                {`${Math.ceil(content.word_count / 200)} min`}
              </Text>
            </>
          ) : null}
        </View>
      </View>

      {/* Content with icon and thumbnail */}
      <View className="flex-row items-start">
        {/* Recommendation Icon instead of checkbox */}
        <View className="mr-2 mt-0.5">
          <View className="h-5 w-5 items-center justify-center rounded-full border border-dotted border-purple-500 bg-transparent">
            <Icon as={Sparkles} className="h-3 w-3 text-purple-500" />
          </View>
        </View>

        <View className="flex-1 pr-2">
          {/* Title */}
          <Text
            className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-100"
            numberOfLines={2}>
            {content.title || 'Untitled'}
          </Text>

          {/* Summary */}
          {content.summary ? (
            <Text className="mb-1 text-xs text-gray-600 dark:text-gray-400" numberOfLines={2}>
              {content.summary}
            </Text>
          ) : null}

          {/* Author if available */}
          {content.author ? (
            <Text
              className="mb-1 text-xs italic text-gray-500 dark:text-gray-500"
              numberOfLines={1}>
              by {content.author}
            </Text>
          ) : null}

          {/* Tags */}
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
