import React from 'react';
import { TouchableOpacity, type ViewStyle } from 'react-native';

import { Text } from './ui/text';

interface FABProps {
  onPress: () => void;
  icon?: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export function FAB({ onPress, icon = '+', className = '', style }: FABProps) {
  const defaultStyle: ViewStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg active:bg-blue-600 dark:bg-blue-600 dark:active:bg-blue-700 ${className}`}
      style={[defaultStyle, style]}
    >
      {typeof icon === 'string' ? <Text className="text-2xl text-white">{icon}</Text> : icon}
    </TouchableOpacity>
  );
}
