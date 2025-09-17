import React from 'react';
import { View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Sparkles } from 'lucide-react-native';
import { BaseContentCard } from '@/components/content/base-content-card';
import {
  formatDate,
  formatReadingTime,
  formatScorePercentage,
  getScoreColorClass,
  getThumbnailUrl,
} from '@/hooks/use-content-formatters';
import type { Recommendation } from '@tkhwang-pico/common';

interface RecommendItemProps {
  recommendation: Recommendation;
  onPress: (recommendation: Recommendation) => void;
}

export function RecommendItem({ recommendation, onPress }: RecommendItemProps) {
  const content = recommendation.contents;
  if (!content) return null;

  const scorePercentage = formatScorePercentage(recommendation.score);

  const handlePress = () => {
    onPress(recommendation);
  };

  const thumbnailUrl = getThumbnailUrl(content);

  // Create icon slot for recommendation indicator
  const recommendIconSlot = (
    <View className="mr-2 mt-0.5">
      <View className="h-5 w-5 items-center justify-center rounded-full border border-dotted border-purple-500 bg-transparent">
        <Icon as={Sparkles} className="h-3 w-3 text-purple-500" />
      </View>
    </View>
  );

  return (
    <BaseContentCard
      title={content.title || undefined}
      summary={content.summary || undefined}
      author={content.author || undefined}
      tags={content.tags || undefined}
      thumbnailUrl={thumbnailUrl || undefined}
      onPress={handlePress}
      leftSlot={recommendIconSlot}
      metadataProps={{
        score: scorePercentage,
        scoreColor: getScoreColorClass(scorePercentage),
        domain: content.domain || 'CONTENT',
        date: content.published_at ? formatDate(content.published_at) : undefined,
        readingTime: content.word_count ? formatReadingTime(content.word_count) : undefined,
      }}
    />
  );
}
