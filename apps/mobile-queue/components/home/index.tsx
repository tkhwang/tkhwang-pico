import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../ui/text';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card } from '../ui/card';

interface Article {
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

const mockData: Article[] = [
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
                    <Text className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                      {item.category}
                    </Text>
                  </View>

                  {/* Title */}
                  <Text className="mb-1 text-base font-semibold leading-5 text-gray-900 dark:text-gray-100">
                    {item.title}
                  </Text>

                  {/* Source */}
                  <Text className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                    {item.source}
                  </Text>

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
        ))}
      </ScrollView>
    </View>
  );
}
