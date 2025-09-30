import { CheckCircle2, Circle } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { QueueStatus } from '@/contexts/queue-context';

interface QueueStatusFilterProps {
  status: QueueStatus;
  onStatusChange: (status: QueueStatus) => void;
}

export function QueueStatusFilter({ status, onStatusChange }: QueueStatusFilterProps) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-lg bg-muted/80 p-1 dark:bg-muted/30">
      <TouchableOpacity
        onPress={() => onStatusChange('pending')}
        activeOpacity={0.7}
        className={`rounded-md px-3 py-1.5 ${
          status === 'pending'
            ? // ? 'bg-white shadow-sm shadow-black/5 dark:bg-gray-800'
              'bg-white dark:bg-gray-800'
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
            ? // ? 'bg-white shadow-sm shadow-black/5 dark:bg-gray-800'
              'bg-white dark:bg-gray-800'
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
