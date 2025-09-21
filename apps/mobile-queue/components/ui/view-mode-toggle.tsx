import { Grid2x2, List, Square } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

export type ViewMode = 'bigCard' | 'smallCard' | 'list';

interface ViewModeToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ mode, onModeChange }: ViewModeToggleProps) {
  return (
    <View className="flex-row rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      <TouchableOpacity
        onPress={() => onModeChange('bigCard')}
        className={`flex-1 items-center justify-center rounded-md px-2 py-1.5 ${
          mode === 'bigCard' ? 'bg-white dark:bg-gray-700' : ''
        }`}
        activeOpacity={0.7}
      >
        <Icon
          as={Square}
          className={`h-4 w-4 ${
            mode === 'bigCard' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
          }`}
        />
        <Text
          className={`mt-0.5 text-[10px] ${
            mode === 'bigCard' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Card
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onModeChange('smallCard')}
        className={`flex-1 items-center justify-center rounded-md px-2 py-1.5 ${
          mode === 'smallCard' ? 'bg-white dark:bg-gray-700' : ''
        }`}
        activeOpacity={0.7}
      >
        <Icon
          as={Grid2x2}
          className={`h-4 w-4 ${
            mode === 'smallCard' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
          }`}
        />
        <Text
          className={`mt-0.5 text-[10px] ${
            mode === 'smallCard' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Grid
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onModeChange('list')}
        className={`flex-1 items-center justify-center rounded-md px-2 py-1.5 ${
          mode === 'list' ? 'bg-white dark:bg-gray-700' : ''
        }`}
        activeOpacity={0.7}
      >
        <Icon
          as={List}
          className={`h-4 w-4 ${
            mode === 'list' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
          }`}
        />
        <Text
          className={`mt-0.5 text-[10px] ${
            mode === 'list' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          List
        </Text>
      </TouchableOpacity>
    </View>
  );
}
