import { ScrollView, View, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
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
