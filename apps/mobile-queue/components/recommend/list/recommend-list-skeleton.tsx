import React from 'react';
import { View, ScrollView } from 'react-native';

function SkeletonCard() {
  return (
    <View className="mb-4 overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <View className="p-4">
        {/* Score indicator skeleton */}
        <View className="mb-2 flex-row items-center">
          <View className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          <View className="ml-2 h-4 w-12 rounded bg-gray-200 dark:bg-gray-700" />
        </View>

        {/* Header with domain */}
        <View className="mb-2 h-4 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />

        <View className="flex-row">
          {/* Content Info */}
          <View className="flex-1 pr-3">
            {/* Title skeleton */}
            <View className="mb-2 h-5 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <View className="mb-3 h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />

            {/* Author and date skeleton */}
            <View className="mb-1 h-3 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            <View className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          </View>

          {/* Thumbnail skeleton */}
          <View className="h-20 w-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </View>
      </View>
    </View>
  );
}

export function RecommendListSkeleton() {
  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}>
      {[1, 2, 3, 4, 5].map((index) => (
        <SkeletonCard key={index} />
      ))}
    </ScrollView>
  );
}
