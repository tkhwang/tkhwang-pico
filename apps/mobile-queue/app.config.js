import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  expo: {
    android: {
      adaptiveIcon: {
        backgroundColor: '#ffffff',
        foregroundImage: './assets/images/adaptive-icon.png',
      },
      edgeToEdgeEnabled: true,
      package: 'app.tkbetter.pico.queue.dev',
    },
    assetBundlePatterns: ['**/*'],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: '6ee63224-2d7a-4d9d-b057-17117cc087da',
      },
      router: {},
      clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
    icon: './assets/images/icon.png',
    ios: {
      bundleIdentifier: 'app.tkbetter.pico.queue.dev',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      supportsTablet: true,
    },
    name: '@tkhwang-pico/mobile-queue',
    newArchEnabled: true,
    orientation: 'portrait',
    plugins: [
      'expo-router',
      'expo-secure-store',
      'expo-web-browser',
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: 'tkhwang-pico-queue',
          organization: 'tkhwang',
        },
      ],
    ],
    runtimeVersion: {
      policy: 'appVersion',
    },
    scheme: 'tkhwang-pico-mobile-queue',
    slug: 'tkhwang-pico-mobile-queue',
    splash: {
      backgroundColor: '#ffffff',
      image: './assets/images/splash.png',
      resizeMode: 'contain',
    },
    updates: {
      url: 'https://u.expo.dev/6ee63224-2d7a-4d9d-b057-17117cc087da',
    },
    userInterfaceStyle: 'automatic',
    version: '1.0.0',
    web: {
      bundler: 'metro',
      favicon: './assets/images/favicon.png',
      output: 'static',
    },
  },
});
