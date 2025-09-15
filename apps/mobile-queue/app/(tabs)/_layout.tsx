import { Tabs } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { HomeIcon, SparklesIcon, CalendarDaysIcon, SettingsIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import * as SplashScreen from 'expo-splash-screen';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Ensure splash screen is hidden once the tabs layout mounts.
  React.useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderTopColor: isDark ? '#374151' : '#e5e7eb',
          height: 80,
          paddingBottom: 20,
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
          tabBarIcon: ({ color, size }) => <Icon as={HomeIcon} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recommend"
        options={{
          title: 'Recommend',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Icon as={SparklesIcon} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: 'Timeline',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Icon as={CalendarDaysIcon} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Icon as={SettingsIcon} size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
