import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

export function Dashboard() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Dashboard 화면을 준비 중입니다.
      </Text>
      <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        기존 Home 콘텐츠는 Queue 화면으로 이동했습니다.
      </Text>
    </View>
  );
}
