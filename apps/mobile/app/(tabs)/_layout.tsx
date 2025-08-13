import { Tabs } from 'expo-router';
import { MessageCircle, Settings, Trophy } from 'lucide-react-native';

import { useColorScheme } from '~/lib/useColorScheme';

export default function TabLayout() {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDarkColorScheme ? '#ffffff' : '#000000',
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <MessageCircle size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="skills"
        options={{
          title: 'Skills',
          tabBarIcon: ({ color }) => <Trophy size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
