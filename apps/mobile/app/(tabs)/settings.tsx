import * as React from 'react';

import { View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '~/components/ui/text';

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-secondary/30">
      <View className="flex-1 justify-center items-center gap-5 p-6">
        <Text>Settings</Text>
      </View>
    </SafeAreaView>
  );
}
