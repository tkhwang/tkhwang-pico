import { SafeAreaView } from 'react-native-safe-area-context';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <SafeAreaView className={`flex-1 bg-secondary/30 ${className || ''}`}>{children}</SafeAreaView>
  );
}
