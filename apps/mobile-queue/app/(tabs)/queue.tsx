import { Header } from '@/components/header';
import { MainLayout } from '@/components/main-layout';
import { Queue } from '@/components/queue';

export default function QueueScreen() {
  return (
    <MainLayout showHeader={false}>
      <Header />
      <Queue />
    </MainLayout>
  );
}
