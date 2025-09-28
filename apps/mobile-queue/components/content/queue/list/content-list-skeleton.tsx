import { useEffect, useRef } from 'react';
import { Animated, ScrollView, View } from 'react-native';

import { ContentCardSkeleton } from '@/components/content/common/cards/content-card-skeleton';

export function ContentListSkeleton() {
  return (
    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
      <View className="py-2">
        {[...Array(5)].map((_, index) => (
          <ContentCardSkeleton key={index} />
        ))}
      </View>
    </ScrollView>
  );
}
