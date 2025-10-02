import { CheckCircle2, Circle } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import type { QueueStatus } from '@/contexts/queue-context';

interface QueueStatusFilterProps {
  status: QueueStatus;
  onStatusChange: (status: QueueStatus) => void;
}

export function QueueStatusFilter({ status, onStatusChange }: QueueStatusFilterProps) {
  const tabs = [
    {
      value: 'pending' as QueueStatus,
      label: 'Ing',
      icon: Circle,
      activeColor: 'text-blue-500',
    },
    {
      value: 'completed' as QueueStatus,
      label: 'Done',
      icon: CheckCircle2,
      activeColor: 'text-green-500',
    },
  ];

  return (
    <Tabs value={status} onValueChange={onStatusChange as (value: string) => void}>
      <TabsList className="gap-1.5 rounded-lg bg-muted/80 p-1 dark:bg-muted/30">
        {tabs.map(({ value, label, icon: IconComponent, activeColor }) => {
          const isActive = status === value;
          const iconColor = isActive ? activeColor : 'text-muted-foreground';

          return (
            <TabsTrigger
              key={value}
              value={value}
              className={`flex-none flex-row items-center justify-center gap-1.5 rounded-md px-3 py-1.5 ${
                isActive ? 'bg-white shadow-sm shadow-black/5 dark:bg-gray-800' : 'bg-transparent'
              }`}
            >
              <Icon as={IconComponent} size={18} className={iconColor} />
              <Text
                className={`text-sm font-semibold ${
                  isActive ? activeColor : 'text-muted-foreground'
                }`}
              >
                {label}
              </Text>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
