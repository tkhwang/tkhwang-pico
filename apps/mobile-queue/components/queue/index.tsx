import React, { useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { CompletedList } from '@/components/common/queue/list/completed-list';
import { ContentList } from '@/components/common/queue/list/content-list';
import { Text } from '@/components/ui/text';

import { FAB } from '../fab';
import { FabModal } from './fab-modal';

type QueueStatus = 'pending' | 'completed';

interface QueueStatusToggleProps {
  status: QueueStatus;
  onStatusChange: (status: QueueStatus) => void;
}

function QueueStatusToggle({ status, onStatusChange }: QueueStatusToggleProps) {
  return (
    <View className="flex-row items-center rounded-lg bg-muted/60 p-1 dark:bg-muted/30">
      <TouchableOpacity
        onPress={() => onStatusChange('pending')}
        activeOpacity={0.7}
        className={`rounded-md px-3 py-1.5 ${
          status === 'pending' ? 'bg-card shadow-sm shadow-black/5' : ''
        }`}
      >
        <Text
          className={`text-xs font-semibold ${
            status === 'pending' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          Pending
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onStatusChange('completed')}
        activeOpacity={0.7}
        className={`rounded-md px-3 py-1.5 ${
          status === 'completed' ? 'bg-card shadow-sm shadow-black/5' : ''
        }`}
      >
        <Text
          className={`text-xs font-semibold ${
            status === 'completed' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          Completed
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export function Queue() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [status, setStatus] = useState<QueueStatus>('pending');

  useEffect(() => {
    if (status === 'completed') {
      setIsModalVisible(false);
    }
  }, [status]);

  const handleContentSaved = () => {
    console.log('Content saved successfully');
    setIsModalVisible(false);
  };

  const statusToggle = useMemo(
    () => <QueueStatusToggle status={status} onStatusChange={setStatus} />,
    [status],
  );

  const isPendingView = status === 'pending';

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {isPendingView ? (
        <ContentList headerRight={statusToggle} />
      ) : (
        <CompletedList headerRight={statusToggle} />
      )}

      {isPendingView && (
        <>
          <FAB onPress={() => setIsModalVisible(true)} />
          <FabModal
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            onSuccess={handleContentSaved}
          />
        </>
      )}
    </View>
  );
}
