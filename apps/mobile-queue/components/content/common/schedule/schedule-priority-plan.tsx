import { Calendar } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { PRIORITY_STYLES } from '@/consts/app-styles';
import { formatScheduleLabel, getDefaultSchedule } from '@/utils/date';
import { type PriorityValue } from '@/utils/priority';

interface SchedulePriorityPlanProps {
  scheduledDate: Date | null;
  priority: PriorityValue;
  title?: string;
  referenceDate?: Date;
}

export function SchedulePriorityPlan({
  scheduledDate,
  priority,
  title = 'Reading Plan',
  referenceDate,
}: SchedulePriorityPlanProps) {
  const todayReference = React.useMemo(
    () => referenceDate ?? getDefaultSchedule(),
    [referenceDate],
  );

  const scheduleDisplay = React.useMemo(
    () => formatScheduleLabel(scheduledDate, todayReference),
    [scheduledDate, todayReference],
  );

  const priorityStyle = PRIORITY_STYLES[priority];

  const showLeftAccent = priority === 'high';

  return (
    <View className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900/80">
      {showLeftAccent ? (
        <View className={`absolute bottom-0 left-0 top-0 w-1 ${priorityStyle.dot}`} />
      ) : null}
      <View className={showLeftAccent ? 'pl-2' : undefined}>
        <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {title}
        </Text>
        <View className="mt-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Icon as={Calendar} size={18} className="text-gray-500 dark:text-gray-300" />
            <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {scheduleDisplay}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
