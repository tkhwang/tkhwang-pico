import { CompletedList } from '@/components/completed/list/completed-list';
import { MainLayout } from '@/components/main-layout';

export default function ArchiveScreen() {
  return (
    <MainLayout>
      <CompletedList />
    </MainLayout>
  );
}
