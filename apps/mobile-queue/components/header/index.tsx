import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
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
    <View className="mb-4 flex-row justify-between border-b border-gray-100 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
      <ThemeToggle />
      <UserMenu />
    </View>
  );
}
