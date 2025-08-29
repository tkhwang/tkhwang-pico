import { Home } from '@/components/home';
import { MainLayout } from '@/components/main-layout';
import { Stack } from 'expo-router';

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MainLayout>
        <Home />
      </MainLayout>
    </>
  );
}
