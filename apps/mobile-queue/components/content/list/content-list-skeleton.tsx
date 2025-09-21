import { useEffect, useRef } from 'react';
import { Animated, ScrollView, View } from 'react-native';

import { ContentItemSkeleton } from '@/components/content/content-item-skeleton';

export function ContentListSkeleton() {
  return (
    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
      <View className="py-2">
        {[...Array(5)].map((_, index) => (
          <ContentItemSkeleton key={index} />
        ))}
      </View>
    </ScrollView>
  );
}
