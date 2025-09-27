import { Calendar } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { PRIORITY_STYLES } from '@/consts/app-styles';
import { formatScheduleLabel, getDefaultSchedule } from '@/utils/date';
import { PRIORITY_LABELS, type PriorityValue } from '@/utils/priority';

interface SchedulePriorityPreviewProps {
  scheduledDate: Date | null;
  priority: PriorityValue;
  title?: string;
  referenceDate?: Date;
}

export function SchedulePriorityPreview({
  scheduledDate,
  priority,
  title = 'Current Settings',
  referenceDate,
}: SchedulePriorityPreviewProps) {
  const todayReference = React.useMemo(
    () => referenceDate ?? getDefaultSchedule(),
    [referenceDate],
  );

  const scheduleDisplay = React.useMemo(
    () => formatScheduleLabel(scheduledDate, todayReference),
    [scheduledDate, todayReference],
  );

  const priorityLabel = PRIORITY_LABELS[priority] ?? priority;
  const priorityStyle = PRIORITY_STYLES[priority];

  return (
    <View className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900/80">
      <View className="flex-row items-stretch gap-3">
        <View className="flex-[3]">
          <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {title}
          </Text>
          <View className="mt-3 flex-row items-center justify-between">
            <View className={`flex-row items-center rounded-full px-3 py-1 ${priorityStyle.badge}`}>
              <View className={`mr-2 h-2.5 w-2.5 rounded-full ${priorityStyle.dot}`} />
              <Text
                className={`text-xs font-semibold uppercase tracking-wide ${priorityStyle.text}`}
              >
                {priorityLabel}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Icon as={Calendar} size={18} className="text-gray-500 dark:text-gray-300" />
              <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {scheduleDisplay}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
