import { Grid2x2, List, Square } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Icon } from '@/components/ui/icon';

export type ViewMode = 'bigCard' | 'smallCard' | 'list';

interface ViewModeToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ mode, onModeChange }: ViewModeToggleProps) {
  const getSharedStyles = (isActive: boolean) => ({
    button: `flex-1 items-center justify-center rounded-md px-3 py-1.5 ${
      isActive ? 'bg-white dark:bg-gray-700' : ''
    }`,
    color: isActive ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400',
  });

  return (
    <View className="flex-row gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      {[
        { key: 'bigCard' as const, icon: Square },
        { key: 'smallCard' as const, icon: Grid2x2 },
        { key: 'list' as const, icon: List },
      ].map(({ key, icon: IconComponent }) => {
        const isActive = mode === key;
        const styles = getSharedStyles(isActive);
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onModeChange(key)}
            className={styles.button}
            activeOpacity={0.7}
          >
            <Icon as={IconComponent} className={`h-5 w-5 ${styles.color}`} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
