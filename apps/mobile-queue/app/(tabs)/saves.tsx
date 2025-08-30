import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';
import { MainLayout } from '@/components/main-layout';
import { Text } from '@/components/ui/text';
import { ContentType } from '@/components/home';

// Recommended content based on user's reading history
const recommendedContent: ContentType[] = [
  {
    id: 'r1',
    title: 'Advanced React Patterns You Should Know',
    source: 'Dev.to',
    category: 'Development',
    readTime: '12 min read',
    completed: false,
    thumbnail: '⚛️',
    type: 'article',
  },
  {
    id: 'r2',
    title: 'Neural Networks Explained Simply',
    source: 'Coursera - Andrew Ng',
    category: 'AI/ML',
    videoLength: '45 min lecture',
    completed: false,
    thumbnail: '🧮',
    type: 'lecture',
  },
  {
    id: 'r3',
    title: 'Transformer Architecture Deep Dive',
    source: 'Google Research',
    category: 'Research',
    readTime: '60 min read',
    completed: false,
    thumbnail: '🤖',
    type: 'paper',
  },
  {
    id: 'r4',
    title: 'Building Scalable Mobile Apps',
    source: 'YouTube - Tech Talks',
    category: 'Mobile Development',
    videoLength: '30 min video',
    completed: false,
    thumbnail: '📱',
    type: 'video',
  },
  {
    id: 'r5',
    title: 'Machine Learning in Production',
    source: 'MIT OpenCourseWare',
    category: 'AI/ML',
    videoLength: '75 min lecture',
    completed: false,
    thumbnail: '🎓',
    type: 'lecture',
  },
];

const RecommendedItem = ({ item }: { item: ContentType }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const gradientColors = isDark
    ? (['rgba(30, 58, 138, 0.3)', 'rgba(49, 46, 129, 0.3)'] as const) // blue-950/30 to indigo-950/30
    : (['#eff6ff', '#eef2ff'] as const); // blue-50 to indigo-50

  return (
    <TouchableOpacity className="mb-4 rounded-lg border border-blue-200 dark:border-blue-800">
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ borderRadius: 8, padding: 16 }}>
        <View className="mb-2 flex-row items-center">
          <Text className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">
            {item.type}
          </Text>
          <View className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 dark:bg-blue-900/50">
            <Text className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Recommended
            </Text>
          </View>
        </View>
        <View className="flex-row items-start">
          <View className="mr-3 mt-1 h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
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
            <View className="mt-2 flex-row items-center">
              <View className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
              <Text className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Based on your AI & Development interests
              </Text>
            </View>
          </View>
          <Text className="text-2xl">{item.thumbnail}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function RecommendScreen() {
  return (
    <MainLayout>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <View className="px-4 py-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Recommended for You
          </Text>
          <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Personalized content based on your reading history
          </Text>
        </View>

        {/* Info Banner */}
        <View className="mx-4 mb-4 rounded-lg border border-blue-200 bg-blue-100 p-3 dark:border-blue-800 dark:bg-blue-900/20">
          <View className="flex-row items-center">
            <Text className="mr-2 text-blue-600 dark:text-blue-400">✨</Text>
            <Text className="flex-1 text-sm text-blue-700 dark:text-blue-300">
              These recommendations are generated from your interest in AI, development, and
              research content
            </Text>
          </View>
        </View>

        {/* Recommended Content List */}
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {recommendedContent.map((item) => (
            <RecommendedItem key={item.id} item={item} />
          ))}
        </ScrollView>
      </View>
    </MainLayout>
  );
}
