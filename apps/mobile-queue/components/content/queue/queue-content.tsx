import { View } from 'react-native';

import { CompletedList } from '@/components/common/queue/list/completed-list';
import { ContentList } from '@/components/common/queue/list/content-list';
import type { QueueStatus } from '@/contexts/queue-context';

interface QueueContentProps {
  status: QueueStatus;
}

export function QueueContent({ status }: QueueContentProps) {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {status === 'pending' ? <ContentList /> : <CompletedList />}
    </View>
  );
}
