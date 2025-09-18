import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { MainLayout } from '@/components/main-layout';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ChevronRight, User, Bell, Shield, HelpCircle, LogOut } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

const settingsOptions = [
  {
    id: 'profile',
    title: 'Profile',
    description: 'Manage your account information',
    icon: User,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure notification preferences',
    icon: Bell,
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    description: 'Privacy settings and security options',
    icon: Shield,
  },
  {
    id: 'help',
    title: 'Help & Support',
    description: 'Get help and contact support',
    icon: HelpCircle,
  },
];

export default function SettingsScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <MainLayout>
      <View className="flex-1 bg-white dark:bg-gray-900">
        {/* Header */}
        <View className="px-4 py-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            Manage your app preferences
          </Text>
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Theme Toggle */}
          <Card className="mb-4 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Dark Mode
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle between light and dark theme
                </Text>
              </View>
              <Button onPress={toggleColorScheme} size="sm" variant="outline" className="ml-4">
                <Text className="text-sm">{colorScheme === 'dark' ? 'Light' : 'Dark'}</Text>
              </Button>
            </View>
          </Card>

          {/* Settings Options */}
          {settingsOptions.map((option) => (
            <TouchableOpacity key={option.id} className="mb-2">
              <Card className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <View className="flex-row items-center p-4">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <Icon as={option.icon} className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {option.title}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {option.description}
                    </Text>
                  </View>
                  <Icon as={ChevronRight} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </View>
              </Card>
            </TouchableOpacity>
          ))}

          {/* Sign Out */}
          <TouchableOpacity className="mb-8 mt-4">
            <Card className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <View className="flex-row items-center p-4">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <Icon as={LogOut} className="h-5 w-5 text-red-600 dark:text-red-400" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-red-600 dark:text-red-400">
                    Sign Out
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    Sign out of your account
                  </Text>
                </View>
                <Icon as={ChevronRight} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </View>
            </Card>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </MainLayout>
  );
}
