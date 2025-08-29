import React from 'react';
import { View, ScrollView } from 'react-native';
import { MainLayout } from '@/components/main-layout';
import { Text } from '@/components/ui/text';
import { Content } from '@/components/content';
import { ContentType } from '@/components/home';

// Mock saved content data
const savedContent: ContentType[] = [
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
    id: '4',
    title: 'Advanced React Patterns',
    source: 'Medium',
    category: 'Development',
    readTime: '12 min read',
    completed: false,
    thumbnail: '⚛️',
    type: 'blog',
  },
];

export default function SavesScreen() {
  return (
    <MainLayout>
      <View className="flex-1 bg-white dark:bg-gray-900">
        {/* Header */}
        <View className="px-4 py-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">Saved Content</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {savedContent.length} saved items
          </Text>
        </View>

        {/* Saved Content List */}
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {savedContent.map((item) => (
            <Content key={item.id} item={item} />
          ))}
        </ScrollView>
      </View>
    </MainLayout>
  );
}
