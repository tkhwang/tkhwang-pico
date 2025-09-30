import type { ReactNode } from 'react';
import { Platform, SafeAreaView, StatusBar, View } from 'react-native';

import { Header } from '@/components/header';

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function MainLayout({ children, showHeader = true }: MainLayoutProps) {
  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-gray-900"
      style={{
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}
    >
      <View className="flex-1 bg-white dark:bg-gray-900">
        {showHeader && <Header />}
        <View className="flex-1">{children}</View>
      </View>
    </SafeAreaView>
  );
}
