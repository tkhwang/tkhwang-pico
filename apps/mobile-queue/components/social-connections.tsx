import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useSSO, type StartSSOFlowParams } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useColorScheme } from 'nativewind';
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
    backgroundColor: 'bg-[#4285F4]',
    textColor: 'text-white',
  },
  {
    type: 'oauth_apple',
    label: 'Continue with Apple',
    source: { uri: 'https://img.clerk.com/static/apple.png?width=160' },
    useTint: true,
    backgroundColor: 'bg-black',
    textColor: 'text-white',
  },
  {
    type: 'oauth_github',
    label: 'Continue with GitHub',
    source: { uri: 'https://img.clerk.com/static/github.png?width=160' },
    useTint: true,
    backgroundColor: 'bg-black',
    textColor: 'text-white',
  },
];

export function SocialConnections() {
  useWarmUpBrowser();
  const { colorScheme } = useColorScheme();
  const { startSSOFlow } = useSSO();

  function onSocialLoginPress(strategy: SocialConnectionStrategy) {
    return async () => {
      try {
        // Start the authentication process by calling `startSSOFlow()`
        const { createdSessionId, setActive, signIn } = await startSSOFlow({
          strategy,
          // For web, defaults to current path
          // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
          // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
          redirectUrl: AuthSession.makeRedirectUri(),
        });

        // If sign in was successful, set the active session
        if (createdSessionId && setActive) {
          setActive({ session: createdSessionId });
          return;
        }

        // TODO: Handle other statuses
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      } catch (err) {
        // See https://go.clerk.com/mRUDrIe for more info on error handling
        console.error(JSON.stringify(err, null, 2));
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
              'h-12 w-full flex-row items-center justify-center gap-3 rounded-full',
              strategy.backgroundColor,
              'border-0'
            )}
            onPress={onSocialLoginPress(strategy.type)}>
            <Image
              className={cn('size-5', strategy.useTint && Platform.select({ web: 'dark:invert' }))}
              tintColor={Platform.select({
                native: strategy.useTint ? 'white' : undefined,
              })}
              source={strategy.source}
            />
            <Text className={cn('text-base font-medium', strategy.textColor)}>
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
