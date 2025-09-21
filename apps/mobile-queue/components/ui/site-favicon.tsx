import { Globe } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, View } from 'react-native';

import { Icon } from '@/components/ui/icon';

interface SiteFaviconProps {
  url?: string | null;
  size?: number;
  className?: string;
}

/**
 * Display site favicon with fallback to globe icon
 */
export function SiteFavicon({ url, size = 12, className = '' }: SiteFaviconProps) {
  const [hasError, setHasError] = useState(false);

  // If no URL or already errored, show fallback icon
  if (!url || hasError) {
    return (
      <View
        className={`items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <Icon
          as={Globe}
          className="text-gray-400 dark:text-gray-500"
          style={{ width: size, height: size }}
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: url }}
      style={{ width: size, height: size }}
      className={`rounded-sm ${className}`}
      onError={() => setHasError(true)}
      resizeMode="contain"
    />
  );
}
