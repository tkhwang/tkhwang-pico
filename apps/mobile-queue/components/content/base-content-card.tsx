import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/ui/text';

import { ContentMetadata } from './sub/content-metadata';
import { ContentTags } from './sub/content-tags';
import { ContentThumbnail } from './sub/content-thumbnail';

interface BaseContentCardProps {
  // Required props
  title?: string;
  onPress?: () => void;
  onLongPress?: () => void;

  // Optional content sections
  summary?: string | null;
  note?: string | null;
  author?: string | null;
  tags?: string[] | unknown[];
  labels?: string[] | unknown[];
  thumbnailUrl?: string | null;
  thumbnailSize?: 'small' | 'medium' | 'large';

  // Metadata props
  metadataProps?: {
    domain?: string;
    faviconUrl?: string | null;
    date?: string;
    readingTime?: string;
    score?: number;
    scoreColor?: string;
    rightElement?: React.ReactNode;
    showMatchSpectrum?: boolean;
    badgeElement?: React.ReactNode;
  };

  // Style customization
  isCompleted?: boolean;
  containerClassName?: string;

  // Slot for custom left icon/checkbox
  leftSlot?: React.ReactNode;
  // Slot for custom top left content (e.g., match spectrum)
  topLeftSlot?: React.ReactNode;
  // Slot for custom bottom content
  bottomSlot?: React.ReactNode;
}

/**
 * Base reusable content card component with slots for customization
 */
export function BaseContentCard({
  title = 'Untitled',
  onPress,
  onLongPress,
  summary,
  note,
  author,
  labels,
  thumbnailUrl,
  thumbnailSize = 'medium',
  metadataProps,
  isCompleted = false,
  containerClassName = '',
  leftSlot,
  topLeftSlot,
  bottomSlot,
}: BaseContentCardProps) {
  const titleColorClass = isCompleted
    ? 'text-gray-500 dark:text-gray-500'
    : 'text-gray-900 dark:text-gray-100';

  const content = (
    <>
      {/* Metadata row at top */}
      {metadataProps && (
        <View className="mb-2">
          <ContentMetadata {...metadataProps} />
        </View>
      )}

      {/* Top left slot (e.g., match spectrum) */}
      {topLeftSlot}

      {/* Main content row */}
      <View className="flex-row items-start">
        {/* Left slot (checkbox, icon, etc.) */}
        {leftSlot}

        {/* Content */}
        <View className="flex-1 pr-2">
          {/* Title */}
          <Text className={`mb-1 text-base font-semibold ${titleColorClass}`} numberOfLines={2}>
            {title}
          </Text>

          {/* Summary */}
          {summary && (
            <Text className="mb-1 text-xs text-gray-600 dark:text-gray-400" numberOfLines={3}>
              {summary}
            </Text>
          )}

          {/* Note */}
          {note && (
            <Text
              className="mb-1 text-xs italic text-gray-500 dark:text-gray-500"
              numberOfLines={1}
            >
              {note}
            </Text>
          )}

          {/* Author */}
          {author && (
            <Text
              className="mb-1 text-xs italic text-gray-500 dark:text-gray-500"
              numberOfLines={1}
            >
              by {author}
            </Text>
          )}

          {/* Tags */}
          {/* {tags && <ContentTags tags={tags} />} */}

          {/* User labels */}
          {labels && <ContentTags tags={labels} variant="purple" />}
        </View>

        {/* Thumbnail */}
        <ContentThumbnail imageUrl={thumbnailUrl} size={thumbnailSize} />
      </View>

      {/* Bottom slot for additional content */}
      {bottomSlot}
    </>
  );

  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        className={`rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 ${containerClassName}`}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={500}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View
      className={`rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 ${containerClassName}`}
    >
      {content}
    </View>
  );
}
