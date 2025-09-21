import * as React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';

import { SignInForm } from '@/components/sign-in-form';

export default function SignInScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="flex-1 items-center justify-center p-4"
        keyboardDismissMode="interactive"
      >
        <View className="w-full max-w-sm">
          <SignInForm />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
