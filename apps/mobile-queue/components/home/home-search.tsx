import { View } from 'react-native';

import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

export function HomeSearch() {
  return (
    <View className="mb-4 px-4 pt-2">
      <View className="relative">
        <Input
          placeholder="Search content..."
          className="h-12 rounded-lg border-gray-200 bg-white pl-10 pr-4 dark:border-gray-700 dark:bg-gray-800"
        />
        <View className="absolute left-3 top-3">
          <Text className="text-lg text-gray-400 dark:text-gray-500">🔍</Text>
        </View>
      </View>
    </View>
  );
}
