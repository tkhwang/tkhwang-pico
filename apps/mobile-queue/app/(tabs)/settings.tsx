import { View } from 'react-native';

import { Stack } from 'expo-router';

import { Text } from '~/components/nativewindui/Text';

export default function Settings() {
  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <View className="flex-1 items-center justify-center">
        <Text variant="title1" className="text-center">
          Settings
        </Text>
      </View>
    </>
  );
}
