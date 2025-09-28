import { useEffect, useRef } from 'react';
import { Animated, ScrollView, View } from 'react-native';

function CompletedCardSkeleton({ isFirstOfDay = false }: { isFirstOfDay?: boolean }) {
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
    <View className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <Animated.View style={{ opacity: fadeAnim }}>
        <View className="flex-row py-3 pl-1.5 pr-3">
          {/* Date Column - Left */}
          <View className="mr-2 w-10 items-center justify-center">
            {isFirstOfDay ? (
              <>
                {/* Day of week */}
                <View className="mb-1 h-3 w-7 rounded bg-gray-200 dark:bg-gray-700" />
                {/* Day number */}
                <View className="h-6 w-8 rounded bg-gray-200 dark:bg-gray-700" />
              </>
            ) : (
              <View className="h-9" />
            )}
          </View>

          {/* Content - Right */}
          <View className="flex-1">
            {/* Domain badge */}
            <View className="mb-2 h-5 w-16 self-start rounded-full bg-gray-200 dark:bg-gray-700" />

            {/* Title and Thumbnail Row */}
            <View className="flex-row">
              {/* Content Info */}
              <View className="flex-1">
                {/* Title - 2 lines */}
                <View className="mb-1 h-4 w-11/12 rounded bg-gray-200 dark:bg-gray-700" />
                <View className="mb-2 h-4 w-8/12 rounded bg-gray-200 dark:bg-gray-700" />

                {/* Time */}
                <View className="flex-row items-center">
                  <View className="mr-1 h-3 w-3 rounded bg-gray-200 dark:bg-gray-700" />
                  <View className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                </View>
              </View>

              {/* Thumbnail */}
              <View className="ml-3 h-20 w-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

function CompletedDateGroup() {
  return (
    <View className="mb-4">
      {/* Items for this date */}
      <View>
        {/* First item with date */}
        <CompletedCardSkeleton isFirstOfDay={true} />
        {/* Second item without date */}
        <View className="mt-3">
          <CompletedCardSkeleton isFirstOfDay={false} />
        </View>
      </View>

      {/* Date separator */}
      <View className="mt-4 h-px bg-gray-200 dark:bg-gray-700" />
    </View>
  );
}

export function CompletedListSkeleton() {
  return (
    <ScrollView
      className="flex-1 bg-gray-50 px-4 dark:bg-gray-900"
      showsVerticalScrollIndicator={false}
    >
      <View className="py-4">
        {/* Show 3 date groups */}
        {[...Array(3)].map((_, index) => (
          <CompletedDateGroup key={index} />
        ))}
      </View>
    </ScrollView>
  );
}
