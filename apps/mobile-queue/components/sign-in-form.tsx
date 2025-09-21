import { View } from 'react-native';

import { SocialConnections } from '@/components/social-connections';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

export function SignInForm() {
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
