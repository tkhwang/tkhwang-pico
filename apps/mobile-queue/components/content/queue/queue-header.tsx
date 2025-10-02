import { View } from 'react-native';

import { ViewModeToggle } from '@/components/ui/view-mode-toggle';
import { useQueueState } from '@/contexts/queue-context';

import { QueueStatusFilter } from './queue-status-filter';

export function QueueHeader() {
  const { status, viewMode, setStatus, setViewMode } = useQueueState();

  return (
    <View className="bg-white px-4 py-3 dark:bg-gray-900">
      <View className="flex-row items-center gap-1">
        <View className="min-w-0" style={{ flex: 6 }}>
          <QueueStatusFilter status={status} onStatusChange={setStatus} />
        </View>
        <View className="items-end" style={{ flex: 4 }}>
          <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
        </View>
      </View>
    </View>
  );
}
