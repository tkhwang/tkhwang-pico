import { FileText } from 'lucide-react-native';
import React from 'react';
import { Image, View } from 'react-native';

import { Icon } from '@/components/ui/icon';

interface ContentThumbnailProps {
  imageUrl?: string | null;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const sizeClasses = {
  small: 'h-12 w-12',
  medium: 'h-16 w-16',
  large: 'h-20 w-20',
};

const iconSizes = {
  small: 'h-6 w-6',
  medium: 'h-8 w-8',
  large: 'h-10 w-10',
};

/**
 * Reusable content thumbnail component with fallback
 */
export function ContentThumbnail({
  imageUrl,
  size = 'medium',
  className = '',
}: ContentThumbnailProps) {
  const sizeClass = sizeClasses[size];
  const iconSize = iconSizes[size];

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        className={`${sizeClass} rounded-md ${className}`}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      className={`${sizeClass} items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 ${className}`}
    >
      <Icon as={FileText} className={`${iconSize} text-gray-400 dark:text-gray-600`} />
    </View>
  );
}
