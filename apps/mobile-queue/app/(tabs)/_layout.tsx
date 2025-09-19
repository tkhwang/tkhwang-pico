import { Tabs } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { Layers, Download, Brain, Settings } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ANDROID_TAB_BAR_HEIGHT = 60;
const IOS_TAB_BAR_HEIGHT = 80;
const IOS_TAB_BAR_PADDING_BOTTOM = 20;

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  // Ensure splash screen is hidden once the tabs layout mounts.
  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      SplashScreen.hideAsync().catch((error) => {
        console.warn('Error hiding splash screen in tabs layout:', error);
      });
    }
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderTopColor: isDark ? '#374151' : '#e5e7eb',
          height:
            Platform.OS === 'android' ? ANDROID_TAB_BAR_HEIGHT + insets.bottom : IOS_TAB_BAR_HEIGHT,
          paddingBottom: Platform.OS === 'android' ? insets.bottom : IOS_TAB_BAR_PADDING_BOTTOM,
          paddingTop: 8,
        },
        tabBarActiveTintColor: isDark ? '#ffffff' : '#1f2937',
        tabBarInactiveTintColor: isDark ? '#9ca3af' : '#6b7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Queue',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Icon as={Layers} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="recommend"
        options={{
          title: 'Discover',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Icon as={Download} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: 'Archive',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Icon as={Brain} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Icon as={Settings} color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
