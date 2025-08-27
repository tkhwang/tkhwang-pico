import { View } from 'react-native';

import { Stack } from 'expo-router';

import { Text } from '~/components/nativewindui/Text';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <View className="flex-1 items-center justify-center">
        <Text variant="title1" className="text-center">
          Home
        </Text>
      </View>
    </>
  );
}
