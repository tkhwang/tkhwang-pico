import React from 'react';
import { View } from 'react-native';
import { TimelineList } from './list/timeline-list';

export function Timeline() {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <TimelineList />
    </View>
  );
}
