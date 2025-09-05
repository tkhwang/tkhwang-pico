import { View, TouchableOpacity } from 'react-native';
import { Text } from '../ui/text';
import type { TodoFilterType } from '@tkhwang-pico/common';

interface ContentHeaderProps {
  filter: TodoFilterType;
  onFilterChange: (filter: TodoFilterType) => void;
}

export function ContentHeader({ filter, onFilterChange }: ContentHeaderProps) {
  const filters: { value: TodoFilterType; label: string }[] = [
    { value: 'all', label: 'ALL' },
    { value: 'pending', label: 'PENDING' },
    { value: 'completed', label: 'COMPLETED' },
  ];

  return (
    <View className="px-4 pb-2 pt-4">
      <View className="flex-row space-x-4">
        {filters.map(({ value, label }) => (
          <TouchableOpacity
            key={value}
            onPress={() => onFilterChange(value)}
            className={`flex-1 rounded-full px-4 py-2 ${
              filter === value
                ? 'bg-gray-200 dark:bg-gray-700'
                : 'border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50'
            }`}>
            <Text
              className={`text-center text-sm font-medium ${
                filter === value
                  ? 'text-gray-800 dark:text-gray-200'
                  : 'text-gray-500 dark:text-gray-500'
              }`}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
