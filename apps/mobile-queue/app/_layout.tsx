import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Constants from 'expo-constants';
import { View, Text, SafeAreaView } from 'react-native';
import { SignInForm } from '@/components/sign-in-form';
import TabLayout from './(tabs)/_layout';

// React 19 types require components to explicitly include `children`.
// Some versions of @clerk/clerk-expo don't declare `children` in props,
// so we cast to a type that includes it to satisfy TS without runtime changes.
const ClerkProviderExtended = ClerkProvider as React.ComponentType<
  React.PropsWithChildren<React.ComponentProps<typeof ClerkProvider>>
>;

// Cast ClerkLoaded to ensure type compatibility with React 19
const ClerkLoadedExtended = ClerkLoaded as React.ComponentType<React.PropsWithChildren>;

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  const clerkPublishableKey =
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    (Constants.expoConfig?.extra as any)?.clerkPublishableKey;

  // Prevent native crash by guarding missing key in production
  React.useEffect(() => {
    if (!clerkPublishableKey) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [clerkPublishableKey]);

  if (!clerkPublishableKey) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 16, textAlign: 'center' }}>
          Missing Clerk publishable key. Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.
        </Text>
      </View>
    );
  }

  return (
    <ClerkProviderExtended tokenCache={tokenCache} publishableKey={clerkPublishableKey}>
      <ClerkLoadedExtended>
        <QueryProvider>
          <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Routes />
            <PortalHost />
          </ThemeProvider>
        </QueryProvider>
      </ClerkLoadedExtended>
    </ClerkProviderExtended>
  );
}

SplashScreen.preventAutoHideAsync();

function Routes() {
  const { isSignedIn, isLoaded } = useAuth();

  React.useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  if (!isLoaded) return null;

  // Simple conditional rendering based on auth state
  if (isSignedIn) return <TabLayout />;

  // Show sign in form when not authenticated with SafeArea
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 items-center justify-center p-4">
        <SignInForm />
      </View>
    </SafeAreaView>
  );
}
