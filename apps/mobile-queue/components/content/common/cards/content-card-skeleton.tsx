import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

export function ContentCardSkeleton() {
  const fadeAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [fadeAnim]);

  return (
    <View className="mb-2 rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Meta Information - Top */}
        <View className="mb-2 flex-row items-center">
          <View className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          <View className="mx-1 h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          <View className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          <View className="mx-1 h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          <View className="h-3 w-12 rounded bg-gray-200 dark:bg-gray-700" />
        </View>

        {/* Main Content */}
        <View className="flex-row items-start">
          {/* Circle + Title + Description */}
          <View className="mr-2 mt-0.5 h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700" />

          <View className="flex-1 pr-2">
            {/* Title - 2 lines */}
            <View className="mb-1 h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
            <View className="mb-1.5 h-4 w-8/12 rounded bg-gray-200 dark:bg-gray-700" />

            {/* Description - 2 lines */}
            <View className="mb-1 h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <View className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
          </View>

          {/* Thumbnail */}
          <View className="h-14 w-14 rounded-md bg-gray-200 dark:bg-gray-700" />
        </View>
      </Animated.View>
    </View>
  );
}
