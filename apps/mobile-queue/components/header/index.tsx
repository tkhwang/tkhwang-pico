import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { UserMenu } from '@/components/user-menu';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button onPress={toggleColorScheme} size="icon" variant="ghost" className="rounded-full">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-6" />
    </Button>
  );
}

export function Header() {
  return (
    <View className="mb-4 flex-row items-center justify-between border-b border-gray-100 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
      <ThemeToggle />
      <View className="absolute left-0 right-0 items-center">
        <View className="flex-row items-center gap-0">
          <Text className="text-gray-900 dark:text-gray-100">pico</Text>
          <Text className="font-bold text-blue-600 dark:text-blue-400">QUEUE</Text>
        </View>
      </View>
      <UserMenu />
    </View>
  );
}
