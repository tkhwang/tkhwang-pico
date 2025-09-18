import { MainLayout } from '@/components/main-layout';
import { TimelineList } from '@/components/timeline/list/timeline-list';

export default function TimelineScreen() {
  return (
    <MainLayout>
      <TimelineList />
    </MainLayout>
  );
}