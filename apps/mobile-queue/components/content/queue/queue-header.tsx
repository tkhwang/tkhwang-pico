import { View } from 'react-native';

import { ViewModeSelector } from '@/components/content/queue/view-mode-selector';
import { useQueueState } from '@/contexts/queue-context';

import { QueueStatusSelector } from './queue-status-selector';

export function QueueHeader() {
  const { status, viewMode, setStatus, setViewMode } = useQueueState();

  return (
    <View className="bg-white px-4 py-3 dark:bg-gray-900">
      <View className="flex-row items-center gap-1">
        <View className="w-3/5 min-w-0">
          <QueueStatusSelector status={status} onStatusChange={setStatus} />
        </View>
        <View className="w-2/5 items-end">
          <ViewModeSelector mode={viewMode} onModeChange={setViewMode} />
        </View>
      </View>
    </View>
  );
}
