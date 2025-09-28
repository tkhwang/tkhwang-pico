import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Brain, Compass, Layers, LayoutDashboard, Settings } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';

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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              as={LayoutDashboard}
              color={color}
              size={size}
              fill={focused ? color : 'none'}
              fillOpacity={focused ? 0.2 : 1}
              strokeWidth={focused ? 1.1 : 1.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="queue"
        options={{
          title: 'Queue',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              as={Layers}
              color={color}
              size={size}
              fill={focused ? color : 'none'}
              fillOpacity={focused ? 0.2 : 1}
              strokeWidth={focused ? 1.1 : 1.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="recommend"
        options={{
          title: 'Discover',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              as={Compass}
              color={color}
              size={size}
              fill={focused ? color : 'none'}
              fillOpacity={focused ? 0.2 : 1}
              strokeWidth={focused ? 1.1 : 1.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: 'Store',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              as={Brain}
              color={color}
              size={size}
              fill={focused ? color : 'none'}
              fillOpacity={focused ? 0.2 : 1}
              strokeWidth={focused ? 1.1 : 1.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              as={Settings}
              color={color}
              size={size}
              fill={focused ? color : 'none'}
              fillOpacity={focused ? 0.2 : 1}
              strokeWidth={focused ? 1.1 : 1.5}
            />
          ),
        }}
      />
    </Tabs>
  );
}
