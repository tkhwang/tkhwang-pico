import React from 'react';
import { View } from 'react-native';

import { ContentMatchSpectrum } from '@/components/content/common/sub/content-match-spectrum';
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
  badgeElement?: React.ReactNode;
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
  badgeElement,
}: ContentMetadataProps) {
  return (
    <View className={`mb-1 ${className}`}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          {showMatchSpectrum && <ContentMatchSpectrum score={score} />}

          <View className="flex-row items-center justify-between">
            {/* Left side: Domain with favicon */}
            {domain && (
              <View className="flex-row items-center">
                <SiteFavicon url={faviconUrl} size={12} className="mr-1" />
                <Text className="text-xs text-gray-400 dark:text-gray-500">{domain}</Text>
              </View>
            )}

            {/* Right side: Reading time (or date if reading time not available) */}
            <View className="flex-row items-center">
              {readingTime && (
                <Text className="text-xs text-gray-400 dark:text-gray-500">{readingTime}</Text>
              )}
              {!readingTime && date && (
                <Text className="text-xs text-gray-400 dark:text-gray-500">{date}</Text>
              )}
            </View>
          </View>
        </View>

        {(badgeElement || rightElement) && (
          <View className="ml-2 flex-shrink-0 items-end gap-1">
            {badgeElement}
            {rightElement}
          </View>
        )}
      </View>
    </View>
  );
}
