import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useSSO, type StartSSOFlowParams } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import * as React from 'react';
import { Image, Platform, View, type ImageSourcePropType } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

type SocialConnectionStrategy = Extract<
  StartSSOFlowParams['strategy'],
  'oauth_google' | 'oauth_github' | 'oauth_apple'
>;

const SOCIAL_CONNECTION_STRATEGIES: {
  type: SocialConnectionStrategy;
  label: string;
  source: ImageSourcePropType;
  useTint?: boolean;
  backgroundColor: string;
  textColor: string;
}[] = [
  {
    type: 'oauth_google',
    label: 'Continue with Google',
    source: { uri: 'https://img.clerk.com/static/google.png?width=160' },
    useTint: false,
    backgroundColor: 'bg-white border border-black',
    textColor: 'text-black',
  },
  {
    type: 'oauth_github',
    label: 'Continue with GitHub',
    source: { uri: 'https://img.clerk.com/static/github.png?width=160' },
    useTint: true,
    backgroundColor: 'bg-white border border-black',
    textColor: 'text-black',
  },
  {
    type: 'oauth_apple',
    label: 'Continue with Apple',
    source: { uri: 'https://img.clerk.com/static/apple.png?width=160' },
    useTint: true,
    backgroundColor: 'bg-white border border-black',
    textColor: 'text-black',
  },
];

export function SocialConnections() {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();

  function onSocialLoginPress(strategy: SocialConnectionStrategy) {
    return async () => {
      try {
        // Start the authentication process by calling `startSSOFlow()`
        const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
          strategy,
          // For web, defaults to current path
          // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
          // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
          redirectUrl: AuthSession.makeRedirectUri({
            scheme: 'tkhwang-pico-mobile-queue',
            path: 'oauth-native-callback',
          }),
        });

        // If sign in was successful, set the active session
        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
          // Navigation will be handled by the auth state change in _layout.tsx
          return;
        }

        // Handle cases where additional steps are required
        if (signIn || signUp) {
          // Check if the user has completed the flow but needs to be activated
          const sessionToActivate = signIn?.createdSessionId || signUp?.createdSessionId;
          if (sessionToActivate && setActive) {
            await setActive({ session: sessionToActivate });
          }
        }
      } catch (err: any) {
        // See https://go.clerk.com/mRUDrIe for more info on error handling
        console.error('Authentication error:', err);
        // If the error is due to user cancellation, handle it gracefully
        if (err?.errors?.[0]?.code === 'session_exists') {
          // Session already exists, just navigate
          router.replace('/');
        }
      }
    };
  }

  return (
    <View className="gap-3">
      {SOCIAL_CONNECTION_STRATEGIES.map((strategy) => {
        return (
          <Button
            key={strategy.type}
            className={cn(
              'h-12 w-full flex-row items-center justify-start gap-3 rounded-lg pl-1',
              strategy.backgroundColor
            )}
            onPress={onSocialLoginPress(strategy.type)}>
            <View
              className={cn(
                'h-10 w-10 items-center justify-center rounded-full',
                strategy.type === 'oauth_apple' ? 'bg-transparent' : 'bg-white'
              )}>
              <Image
                className="size-5"
                tintColor={Platform.select({
                  // Apple glyph black on white; others stay black on white puck.
                  native: strategy.useTint ? 'black' : undefined,
                })}
                source={strategy.source}
              />
            </View>
            <Text className={cn('flex-1 text-center text-base font-medium', strategy.textColor)}>
              {strategy.label}
            </Text>
          </Button>
        );
      })}
    </View>
  );
}

const useWarmUpBrowser = Platform.select({
  web: () => {},
  default: () => {
    React.useEffect(() => {
      // Preloads the browser for Android devices to reduce authentication load time
      // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
      void WebBrowser.warmUpAsync();
      return () => {
        // Cleanup: closes browser when component unmounts
        void WebBrowser.coolDownAsync();
      };
    }, []);
  },
});
