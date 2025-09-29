import { View } from 'react-native';

import { Text } from '@/components/ui/text';

const STORE_PREPARING_MESSAGE = 'Store experience is coming soon.';
const HOME_CONTENT_MOVED_MESSAGE = 'Former Home content now lives on the Queue screen.';

export function Store() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {STORE_PREPARING_MESSAGE}
      </Text>
      <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {HOME_CONTENT_MOVED_MESSAGE}
      </Text>
    </View>
  );
}
