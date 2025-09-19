import React from 'react';
import { View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Sparkles, ExternalLink } from 'lucide-react-native';
import { BaseContentCard } from '@/components/content/base-content-card';
import { ContentMatchSpectrum } from '@/components/content/sub/content-match-spectrum';
import { useContentActions } from '@/hooks/use-content-actions';
import {
  formatDate,
  formatReadingTime,
  formatScorePercentage,
  getScoreColorClass,
  getThumbnailUrl,
} from '@/utils/content-formatters';
import type { Recommendation } from '@tkhwang-pico/common';

interface RecommendItemProps {
  recommendation: Recommendation;
  onPress: (recommendation: Recommendation) => void;
}

export function RecommendItem({ recommendation, onPress }: RecommendItemProps) {
  const { openURL } = useContentActions();
  const content = recommendation.contents;

  if (!content) return null;

  const scorePercentage = formatScorePercentage(recommendation.score);

  const handlePress = () => {
    if (onPress) onPress(recommendation);
  };

  const handleLongPress = () => {
    const url = content.canonical_url || content.url;
    openURL(url);
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

  // Create hold indicator element
  const holdIndicator = (
    <View className="flex-row items-center opacity-60">
      <Icon as={ExternalLink} className="mr-0.5 h-2.5 w-2.5 text-gray-400 dark:text-gray-500" />
      <Text className="text-[10px] text-gray-400 dark:text-gray-500">Hold</Text>
    </View>
  );

  // Create top spectrum slot
  const topSpectrumSlot = (
    <View className="mb-2">
      <ContentMatchSpectrum score={scorePercentage} />
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
      onLongPress={handleLongPress}
      leftSlot={recommendIconSlot}
      topLeftSlot={topSpectrumSlot}
      metadataProps={{
        score: scorePercentage,
        scoreColor: getScoreColorClass(scorePercentage),
        domain: content.domain || 'CONTENT',
        faviconUrl: (content.metadata as any)?.favicon_url || null,
        date: content.published_at ? formatDate(content.published_at) : undefined,
        readingTime: content.word_count ? formatReadingTime(content.word_count) : undefined,
        rightElement: holdIndicator,
        showMatchSpectrum: false,
      }}
    />
  );
}
