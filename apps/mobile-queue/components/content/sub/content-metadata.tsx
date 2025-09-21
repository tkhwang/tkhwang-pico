import React from 'react';
import { View } from 'react-native';

import { ContentMatchSpectrum } from '@/components/content/sub/content-match-spectrum';
import { SiteFavicon } from '@/components/ui/site-favicon';
import { Text } from '@/components/ui/text';

interface ContentMetadataProps {
  domain?: string;
  faviconUrl?: string | null;
  date?: string;
  readingTime?: string;
  score?: number;
  scoreColor?: string;
  className?: string;
  rightElement?: React.ReactNode;
  showMatchSpectrum?: boolean;
}

/**
 * Reusable content metadata display component
 */
export function ContentMetadata({
  domain,
  faviconUrl,
  date,
  readingTime,
  score,
  scoreColor: _scoreColor,
  className = '',
  rightElement,
  showMatchSpectrum = false,
}: ContentMetadataProps) {
  const metadataItems = [
    domain && (
      <View key="domain" className="flex-row items-center">
        <SiteFavicon url={faviconUrl} size={12} className="mr-1" />
        <Text className="text-xs text-gray-400 dark:text-gray-500">{domain}</Text>
      </View>
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
  ].filter(Boolean) as React.ReactNode[];

  return (
    <View className={`mb-1 ${className}`}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          {showMatchSpectrum && <ContentMatchSpectrum score={score} />}

          {metadataItems.length > 0 && (
            <View className="flex-row flex-wrap items-center">
              {metadataItems.map((item, index) => (
                <React.Fragment key={index}>
                  {item}
                  {index < metadataItems.length - 1 && (
                    <Text className="mx-1 text-xs text-gray-400">•</Text>
                  )}
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        {rightElement && <View className="ml-2 flex-shrink-0">{rightElement}</View>}
      </View>
    </View>
  );
}
