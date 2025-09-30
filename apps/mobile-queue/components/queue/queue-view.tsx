import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { FAB } from '@/components/fab';
import { useQueueState } from '@/contexts/queue-context';

import { FabModal } from './fab-modal';
import { QueueContent } from './queue-content';
import { QueueHeader } from './queue-header';

export function QueueView() {
  const { status } = useQueueState();
  const [fabModalVisible, setFabModalVisible] = useState(false);

  // Hide FAB modal when switching to completed view
  useEffect(() => {
    if (status === 'completed') {
      setFabModalVisible(false);
    }
  }, [status]);

  const handleContentSaved = () => {
    setFabModalVisible(false);
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <QueueHeader />
      <QueueContent status={status} />

      {status === 'pending' && (
        <>
          <FAB onPress={() => setFabModalVisible(true)} />
          <FabModal
            visible={fabModalVisible}
            onClose={() => setFabModalVisible(false)}
            onSuccess={handleContentSaved}
          />
        </>
      )}
    </View>
  );
}
