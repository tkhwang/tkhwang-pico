import { CheckCircle2, Circle } from 'lucide-react-native';
import { View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import type { QueueStatus } from '@/contexts/queue-context';

interface QueueStatusFilterProps {
  status: QueueStatus;
  onStatusChange: (status: QueueStatus) => void;
}

export function QueueStatusFilter({ status, onStatusChange }: QueueStatusFilterProps) {
  return (
    <Tabs value={status} onValueChange={onStatusChange as (value: string) => void}>
      <TabsList className="w-full gap-2 bg-muted/80 dark:bg-muted/30">
        <TabsTrigger value="pending" className="flex-1">
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
        </TabsTrigger>
        <TabsTrigger value="completed" className="flex-1">
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
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
