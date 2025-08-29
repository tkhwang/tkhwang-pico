import { View, SafeAreaView } from 'react-native';
import { Header } from '@/components/header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 bg-white dark:bg-gray-900">
        <Header />
        <View className="flex-1">{children}</View>
      </View>
    </SafeAreaView>
  );
}
