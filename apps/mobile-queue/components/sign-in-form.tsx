import { SocialConnections } from '@/components/social-connections';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useSignIn } from '@clerk/clerk-expo';
import * as React from 'react';
import { type TextInput, View } from 'react-native';

export function SignInForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const passwordInputRef = React.useRef<TextInput>(null);
  const [error, setError] = React.useState<{ email?: string; password?: string }>({});

  async function onSubmit() {
    if (!isLoaded) {
      return;
    }

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        setError({ email: '', password: '' });
        await setActive({ session: signInAttempt.createdSessionId });
        return;
      }
      // TODO: Handle other statuses
      console.error(JSON.stringify(signInAttempt, null, 2));
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        const isEmailMessage =
          err.message.toLowerCase().includes('identifier') ||
          err.message.toLowerCase().includes('email');
        setError(isEmailMessage ? { email: err.message } : { password: err.message });
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  }

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardContent className="gap-8 pt-12">
          {/* Icon placeholder space */}
          <View className="h-16 items-center justify-center">
            {/* Future icon will be placed here */}
          </View>

          {/* Title and description */}
          <View className="gap-2">
            <View className="flex-row items-center justify-center gap-1">
              <View className="flex-row items-center gap-0">
                <Text className="text-xl font-semibold text-card-foreground">Sign in to pico</Text>
                <Text className="text-xl font-semibold text-blue-600">QUEUE</Text>
              </View>
            </View>
            <CardDescription className="text-center">
              Welcome back! Please sign in to continue
            </CardDescription>
          </View>

          {/* Main content area - for future form fields */}
          <View className="min-h-[100px]">
            {/* Future email/password fields will be added here */}
          </View>

          {/* Social login buttons at the bottom */}
          <View className="gap-4">
            <SocialConnections />
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
