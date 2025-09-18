import { Tabs } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { Circle, Star, CircleCheckBig, Settings } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
          height: Platform.OS === 'android' ? 60 + insets.bottom : 80,
          paddingBottom: Platform.OS === 'android' ? insets.bottom : 20,
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
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Icon as={Circle} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="recommend"
        options={{
          title: 'Recommend',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Icon as={Star} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: 'Timeline',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Icon as={CircleCheckBig} color={color} size={size} />,
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
