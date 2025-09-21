import { router } from 'expo-router';
import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';

export function UserMenu() {
  const handlePress = () => {
    // Navigate to Settings tab
    router.push('/(tabs)/settings');
  };

  return (
    <TouchableOpacity onPress={handlePress} className="size-8 rounded-full">
      <UserAvatar className="size-8" />
    </TouchableOpacity>
  );
}
