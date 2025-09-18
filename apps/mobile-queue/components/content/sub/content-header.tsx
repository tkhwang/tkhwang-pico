import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Circle, CircleCheckBig } from 'lucide-react-native';
import type { TodoFilterType } from '@tkhwang-pico/common';

interface ContentHeaderProps {
  filter: TodoFilterType;
  onFilterChange: (filter: TodoFilterType) => void;
}

export function ContentHeader({ filter, onFilterChange }: ContentHeaderProps) {
  const filters: {
    value: TodoFilterType;
    accessibilityLabel: string;
    renderIcon: (colorClassName: string) => React.ReactNode;
  }[] = [
    {
      value: 'pending',
      accessibilityLabel: 'Pending items',
      renderIcon: (colorClassName) => <Icon as={Circle} className={`h-4 w-4 ${colorClassName}`} />,
    },
    {
      value: 'completed',
      accessibilityLabel: 'Completed items',
      renderIcon: (colorClassName) => (
        <Icon as={CircleCheckBig} className={`h-4 w-4 ${colorClassName}`} />
      ),
    },
    {
      value: 'all',
      accessibilityLabel: 'All items',
      renderIcon: (colorClassName) => (
        <View className="flex-row items-center justify-center gap-1">
          <Icon as={Circle} className={`h-4 w-4 ${colorClassName}`} />
          <Icon as={CircleCheckBig} className={`h-4 w-4 ${colorClassName}`} />
        </View>
      ),
    },
  ];

  return (
    <View className="px-4 pb-2 pt-4">
      <View className="flex-row gap-2">
        {filters.map(({ value, accessibilityLabel, renderIcon }) => {
          const colorClassName =
            filter === value
              ? 'text-gray-800 dark:text-gray-200'
              : 'text-gray-500 dark:text-gray-500';

          return (
            <TouchableOpacity
              key={value}
              onPress={() => onFilterChange(value)}
              accessibilityLabel={accessibilityLabel}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === value }}
              className={`flex-1 items-center justify-center rounded-xl px-2 py-2 ${
                filter === value
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : 'border border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/50'
              }`}>
              {renderIcon(colorClassName)}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
