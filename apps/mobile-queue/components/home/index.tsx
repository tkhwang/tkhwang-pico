import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../ui/text';
import { Input } from '../ui/input';
import { FAB } from '../fab';
import { FabModal } from './fab-modal';

export interface ContentType {
  id: string;
  title: string;
  source: string;
  category: string;
  readTime?: string;
  videoLength?: string;
  completed: boolean;
  thumbnail: string;
  type: 'article' | 'video' | 'paper' | 'lecture';
}

const mockData: ContentType[] = [
  {
    id: '1',
    title: "The Future of AI: What's Next in 2024",
    source: 'TechCrunch',
    category: 'Technology',
    readTime: '8 min read',
    completed: false,
    thumbnail: '🧠',
    type: 'article',
  },
  {
    id: '2',
    title: 'Building Better React Native Apps',
    source: 'YouTube - React Native Channel',
    category: 'Development',
    videoLength: '22 min video',
    completed: true,
    thumbnail: '📱',
    type: 'video',
  },
  {
    id: '3',
    title: 'Machine Learning Research Paper: Attention Mechanisms',
    source: 'arXiv',
    category: 'Research',
    readTime: '45 min read',
    completed: false,
    thumbnail: '📄',
    type: 'paper',
  },
  {
    id: '4',
    title: 'Introduction to Deep Learning - Stanford CS229',
    source: 'Stanford Online',
    category: 'Education',
    videoLength: '90 min lecture',
    completed: false,
    thumbnail: '🎓',
    type: 'lecture',
  },
];

const ContentItem = ({
  item,
  isRecommended = false,
}: {
  item: ContentType;
  isRecommended?: boolean;
}) => (
  <TouchableOpacity
    className={`mb-4 rounded-lg border p-4 ${isRecommended ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30' : 'border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800'}`}>
    <View className="mb-2 flex-row items-center">
      <Text className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">
        {item.type}
      </Text>
      {isRecommended && (
        <View className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 dark:bg-blue-900/50">
          <Text className="text-xs font-medium text-blue-600 dark:text-blue-400">Recommended</Text>
        </View>
      )}
    </View>
    <View className="flex-row items-start">
      <View
        className={`mr-3 mt-1 h-5 w-5 rounded-full border-2 ${item.completed ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
        {item.completed && <Text className="text-center text-xs text-green-500">✓</Text>}
      </View>
      <View className="flex-1">
        <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {item.title}
        </Text>
        <Text className="mb-1 text-sm text-gray-600 dark:text-gray-400">{item.source}</Text>
        <View className="flex-row items-center">
          <Text className="text-xs text-gray-500 dark:text-gray-500">{item.category}</Text>
          {(item.readTime || item.videoLength) && (
            <>
              <Text className="mx-2 text-xs text-gray-400">•</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-500">
                {item.readTime || item.videoLength}
              </Text>
            </>
          )}
        </View>
      </View>
      <Text className="text-2xl">{item.thumbnail}</Text>
    </View>
  </TouchableOpacity>
);

export function Home() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleContentSubmit = (url: string, responseData: any) => {
    console.log('Content added:', { url, responseData });
    // TODO: Add content to the queue
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Search Bar */}
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

      {/* Content List */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {mockData.map((item) => (
          <ContentItem key={item.id} item={item} />
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB onPress={() => setIsModalVisible(true)} />

      {/* Add Content Modal */}
      <FabModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleContentSubmit}
      />
    </View>
  );
}
