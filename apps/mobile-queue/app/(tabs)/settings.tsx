import { useAuth, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { ChevronRight, FileText, Shield, Star } from 'lucide-react-native';
import React from 'react';
import { Alert, Linking, Platform, ScrollView, TouchableHighlight, View } from 'react-native';

import { MainLayout } from '@/components/main-layout';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { UserAvatar } from '@/components/user-avatar';

interface SettingItem {
  id: string;
  title: string;
  icon: any;
  iconColor: 'blue' | 'green' | 'red' | 'gray' | 'yellow';
  action: 'link' | 'navigate' | 'function';
  url?: string;
  onPress?: () => void;
}

interface SettingSection {
  id: string;
  title: string;
  items: SettingItem[];
}

// Platform-specific app store URLs
const getReviewURL = () => {
  // TODO: Replace with actual App Store ID when available
  const APP_STORE_ID = 'YOUR_APP_STORE_ID';
  const PLAY_STORE_PACKAGE = 'app.tkbetter.pico.queue.dev';

  if (Platform.OS === 'ios') {
    return `https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`;
  } else if (Platform.OS === 'android') {
    return `https://play.google.com/store/apps/details?id=${PLAY_STORE_PACKAGE}`;
  } else {
    // Web or other platforms - could link to a feedback form
    return 'https://www.tkbetter.app/feedback';
  }
};

const settingsSections: SettingSection[] = [
  {
    id: 'support',
    title: 'Support',
    items: [
      {
        id: 'review',
        title: 'Rate & Review',
        icon: Star,
        iconColor: 'yellow',
        action: 'link',
        url: getReviewURL(),
      },
    ],
  },
  {
    id: 'legal',
    title: 'Legal',
    items: [
      {
        id: 'terms',
        title: 'Terms of Service',
        icon: FileText,
        iconColor: 'blue',
        action: 'link',
        url: 'https://www.tkbetter.app',
      },
      {
        id: 'privacy',
        title: 'Privacy Policy',
        icon: Shield,
        iconColor: 'green',
        action: 'link',
        url: 'https://www.tkbetter.app/',
      },
    ],
  },
];

const iconColorStyles = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    icon: 'text-green-600 dark:text-green-400',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    icon: 'text-red-600 dark:text-red-400',
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    icon: 'text-gray-600 dark:text-gray-300',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: 'text-yellow-600 dark:text-yellow-400',
  },
};

export default function SettingsScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => {
      Alert.alert('Error', 'Failed to open link');
      console.error('Failed to open link:', err);
    });
  };

  const handleItemPress = (item: SettingItem) => {
    if (item.action === 'link' && item.url) {
      openLink(item.url);
    } else if (item.action === 'function' && item.onPress) {
      item.onPress();
    }
    // TODO: Handle 'navigate' action when needed
  };

  return (
    <MainLayout>
      <View className="flex-1 bg-gray-50 dark:bg-black">
        {/* Header */}
        <View className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
          <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View className="mt-4 border-y border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <View className="flex-row items-center px-4 py-3">
              <UserAvatar className="size-16" />
              <View className="ml-3 flex-1">
                <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {user?.fullName || 'User'}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.emailAddresses[0]?.emailAddress}
                </Text>
              </View>
            </View>
          </View>

          {/* Settings Sections */}
          {settingsSections.map((section) => (
            <View key={section.id} className="mt-8">
              <Text className="mb-1 px-4 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                {section.title}
              </Text>
              <View className="border-y border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                {section.items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <TouchableHighlight
                      underlayColor="#f3f4f6"
                      onPress={() => handleItemPress(item)}
                    >
                      <View className="flex-row items-center px-4 py-3">
                        <View
                          className={`mr-3 h-8 w-8 items-center justify-center rounded-lg ${iconColorStyles[item.iconColor].bg}`}
                        >
                          <Icon
                            as={item.icon}
                            className={`h-5 w-5 ${iconColorStyles[item.iconColor].icon}`}
                          />
                        </View>
                        <Text className="flex-1 text-base text-gray-900 dark:text-gray-100">
                          {item.title}
                        </Text>
                        <Icon
                          as={ChevronRight}
                          className="h-5 w-5 text-gray-400 dark:text-gray-600"
                        />
                      </View>
                    </TouchableHighlight>
                    {index < section.items.length - 1 && (
                      <View className="ml-[52px] h-[0.5px] bg-gray-200 dark:bg-gray-800" />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          ))}

          {/* Sign Out Section */}
          <View className="mb-8 mt-8">
            <View className="border-y border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <TouchableHighlight underlayColor="#fef2f2" onPress={handleSignOut}>
                <View className="items-center px-4 py-3">
                  <Text className="text-base font-medium text-red-600 dark:text-red-400">
                    Sign Out
                  </Text>
                </View>
              </TouchableHighlight>
            </View>
          </View>
        </ScrollView>
      </View>
    </MainLayout>
  );
}
