import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../ui/text';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Content } from '@/components/content';

export interface ContentType {
  id: string;
  title: string;
  source: string;
  category: string;
  readTime?: string;
  videoLength?: string;
  completed: boolean;
  thumbnail: string;
  type: 'article' | 'video' | 'paper' | 'blog';
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
];

export function Home() {
  const completedCount = mockData.filter((item) => item.completed).length;
  const totalCount = mockData.length;

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Search Bar */}
      <View className="mb-4 px-4">
        <View className="relative">
          <Input
            placeholder="Search content..."
            className="h-12 rounded-lg border-gray-200 bg-gray-50 pl-10 pr-12 dark:border-gray-700 dark:bg-gray-800"
          />
          <View className="absolute left-3 top-3">
            <Text className="text-lg text-gray-400 dark:text-gray-500">🔍</Text>
          </View>
          <TouchableOpacity className="absolute right-3 top-3">
            <Text className="text-lg text-gray-400 dark:text-gray-500">⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content List */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {mockData.map((item) => (
          <Content key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}
