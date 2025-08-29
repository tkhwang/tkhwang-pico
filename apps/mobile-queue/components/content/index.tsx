import { ContentType } from '@/components/home';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { TouchableOpacity, View } from 'react-native';

function getTypeIcon(type: string) {
  switch (type) {
    case 'article':
      return '📰';
    case 'video':
      return '📺';
    case 'paper':
      return '📄';
    case 'blog':
      return '✍️';
    default:
      return '📄';
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case 'article':
      return 'Article';
    case 'video':
      return 'Youtube';
    case 'paper':
      return 'Paper';
    case 'blog':
      return 'Blog';
    default:
      return 'Article';
  }
}

interface ContentProps {
  item: ContentType;
}

export function Content({ item }: ContentProps) {
  return (
    <TouchableOpacity key={item.id} className="mb-4">
      <Card className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <View className="flex-row">
          {/* Status Circle */}
          <View className="mr-3 mt-1">
            <View
              className={`h-6 w-6 rounded-full border-2 ${
                item.completed
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700'
              } flex items-center justify-center`}>
              {item.completed && <Text className="text-xs font-bold text-white">✓</Text>}
            </View>
          </View>

          {/* Thumbnail */}
          <View className="mr-3">
            <View className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
              <Text className="text-2xl">{item.thumbnail}</Text>
            </View>
          </View>

          {/* Content */}
          <View className="flex-1">
            {/* Type and Category */}
            <View className="mb-1 flex-row items-center">
              <Text className="mr-1 text-xs text-gray-500 dark:text-gray-400">
                {getTypeIcon(item.type)} {getTypeLabel(item.type)}
              </Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500">•</Text>
              <Text className="ml-1 text-xs text-gray-500 dark:text-gray-400">{item.category}</Text>
            </View>

            {/* Title */}
            <Text className="mb-1 text-base font-semibold leading-5 text-gray-900 dark:text-gray-100">
              {item.title}
            </Text>

            {/* Source */}
            <Text className="mb-2 text-sm text-gray-600 dark:text-gray-300">{item.source}</Text>

            {/* Read Time/Video Length */}
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500 dark:text-gray-400">⏰</Text>
              <Text className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                {item.readTime || item.videoLength}
              </Text>
            </View>
          </View>

          {/* External Link Icon */}
          <TouchableOpacity className="ml-2 mt-1">
            <Text className="text-lg text-gray-400 dark:text-gray-500">↗</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
