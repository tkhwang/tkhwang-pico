import { CheckCircle2, Circle } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { CompletedList } from '@/components/common/queue/list/completed-list';
import { ContentList } from '@/components/common/queue/list/content-list';
import { Icon } from '@/components/ui/icon';
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
    <View className="flex-row items-center gap-1.5 rounded-lg bg-muted/80 p-1 dark:bg-muted/30">
      <TouchableOpacity
        onPress={() => onStatusChange('pending')}
        activeOpacity={0.7}
        className={`rounded-md px-3 py-1.5 ${
          status === 'pending'
            ? 'bg-white shadow-sm shadow-black/5 dark:bg-gray-800'
            : 'bg-transparent'
        }`}
      >
        <View className="flex-row items-center justify-center gap-2">
          <Icon
            as={Circle}
            size={18}
            className={status === 'pending' ? 'text-blue-500' : 'text-muted-foreground'}
          />
          <Text
            className={`text-sm font-semibold ${
              status === 'pending' ? 'text-blue-500' : 'text-muted-foreground'
            }`}
          >
            Pending
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onStatusChange('completed')}
        activeOpacity={0.7}
        className={`rounded-md px-3 py-1.5 ${
          status === 'completed'
            ? 'bg-white shadow-sm shadow-black/5 dark:bg-gray-800'
            : 'bg-transparent'
        }`}
      >
        <View className="flex-row items-center justify-center gap-2">
          <Icon
            as={CheckCircle2}
            size={18}
            className={status === 'completed' ? 'text-green-500' : 'text-muted-foreground'}
          />
          <Text
            className={`text-sm font-semibold ${
              status === 'completed' ? 'text-green-500' : 'text-muted-foreground'
            }`}
          >
            Completed
          </Text>
        </View>
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

      <>
        <FAB onPress={() => setIsModalVisible(true)} />
        <FabModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSuccess={handleContentSaved}
        />
      </>
    </View>
  );
}
