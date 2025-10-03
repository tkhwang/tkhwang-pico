import { CheckCircle2, Circle } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import type { QueueStatus } from '@/contexts/queue-context';

interface QueueStatusSelectorProps {
  status: QueueStatus;
  onStatusChange: (status: QueueStatus) => void;
}

export function QueueStatusSelector({ status, onStatusChange }: QueueStatusSelectorProps) {
  const tabs = [
    { value: 'pending' as QueueStatus, label: 'Pending', icon: Circle },
    { value: 'completed' as QueueStatus, label: 'Done', icon: CheckCircle2 },
  ];

  return (
    <Tabs value={status} onValueChange={onStatusChange as (value: string) => void}>
      <TabsList className="gap-2 rounded-lg bg-gray-100 px-2 py-1 dark:bg-gray-800">
        {tabs.map(({ value, label, icon: IconComponent }) => {
          const isActive = status === value;
          const activeColor = 'text-blue-500';
          const inactiveColor = 'text-gray-500 dark:text-gray-400';
          const colorClass = isActive ? activeColor : inactiveColor;

          return (
            <TabsTrigger
              key={value}
              value={value}
              className="flex-1 flex-row items-center justify-center gap-1.5 rounded-md px-3 py-1.5"
            >
              <Icon as={IconComponent} size={18} className={colorClass} />
              <Text className={`text-sm font-semibold ${colorClass}`}>{label}</Text>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
