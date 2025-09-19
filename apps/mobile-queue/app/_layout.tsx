import 'react-native-gesture-handler';
import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Constants from 'expo-constants';
import { View, Text, Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

// Prevent the splash screen from auto-hiding before our app is ready
// Only call this on native platforms (iOS/Android)
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch((error) => {
    console.warn('Error preventing splash screen auto-hide:', error);
  });
}

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// React 19 types require components to explicitly include `children`.
// Some versions of @clerk/clerk-expo don't declare `children` in props,
// so we cast to a type that includes it to satisfy TS without runtime changes.
const ClerkProviderExtended = ClerkProvider as React.ComponentType<
  React.PropsWithChildren<React.ComponentProps<typeof ClerkProvider>>
>;

// Cast ClerkLoaded to ensure type compatibility with React 19
const ClerkLoadedExtended = ClerkLoaded as React.ComponentType<React.PropsWithChildren>;

export default Sentry.wrap(function RootLayout() {
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProviderExtended tokenCache={tokenCache} publishableKey={clerkPublishableKey}>
        <ClerkLoadedExtended>
          <QueryProvider>
            <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
              <BottomSheetModalProvider>
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                <Routes />
                <PortalHost />
              </BottomSheetModalProvider>
            </ThemeProvider>
          </QueryProvider>
        </ClerkLoadedExtended>
      </ClerkProviderExtended>
    </GestureHandlerRootView>
  );
});

function Routes() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();

  React.useEffect(() => {
    if (isLoaded && Platform.OS !== 'web') {
      SplashScreen.hideAsync().catch((error) => {
        console.warn('Error hiding splash screen:', error);
      });
    }
  }, [isLoaded]);

  React.useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (isSignedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn, segments]);

  if (!isLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}
