import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React from 'react';
import { Platform, ScrollView, TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import {
  getDefaultSchedule,
  getEndOfCurrentWeek,
  getNextWeekPreset,
  getTomorrowPreset,
  isSameDayPreset,
  normalizeToStartOfDay,
} from '@/utils/date';
import {
  DEFAULT_PRIORITY,
  PRIORITY_LABELS,
  PRIORITY_VALUES,
  type PriorityValue,
} from '@/utils/priority';

import { SchedulePriorityPlan } from './schedule-priority-plan';

interface SchedulePriorityPickerProps {
  scheduledDate: Date | null;
  onScheduledDateChange: (date: Date | null) => void;
  priority: PriorityValue;
  onPriorityChange: (priority: PriorityValue) => void;
  visible?: boolean;
  previewTitle?: string;
  minDate?: Date;
  className?: string;
}

const PRIORITY_ORDER = [...PRIORITY_VALUES];

interface SchedulePreset {
  key: string;
  label: string;
  display: string;
  selected: boolean;
  onPress: () => void;
}

type SchedulePresetButtonProps = SchedulePreset;

function SchedulePresetButton({ label, display, selected, onPress }: SchedulePresetButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        'flex-1 items-start justify-center rounded-md border border-gray-300 px-3 py-3 dark:border-gray-600',
        selected && 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10',
      )}
    >
      <View className="flex-row items-baseline gap-1">
        <Text
          className={cn(
            'text-sm font-semibold text-gray-700 dark:text-gray-300',
            selected && 'text-blue-600 dark:text-blue-200',
          )}
        >
          {label}:
        </Text>
        <Text
          className={cn(
            'text-sm text-gray-500 dark:text-gray-400',
            selected && 'text-blue-500 dark:text-blue-300',
          )}
        >
          {display}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function SchedulePriorityPicker({
  scheduledDate,
  onScheduledDateChange,
  priority,
  onPriorityChange,
  visible = true,
  previewTitle = 'Reading Date',
  minDate,
  className,
}: SchedulePriorityPickerProps) {
  const [isIosPickerVisible, setIosPickerVisible] = React.useState(false);

  const today = React.useMemo(() => {
    if (minDate) {
      return normalizeToStartOfDay(minDate);
    }
    return getDefaultSchedule();
  }, [minDate]);

  const tomorrow = React.useMemo(() => getTomorrowPreset(today), [today]);
  const thisWeek = React.useMemo(() => getEndOfCurrentWeek(today), [today]);
  const nextWeek = React.useMemo(() => getNextWeekPreset(today), [today]);

  const [todayDisplay, tomorrowDisplay, thisWeekDisplay, nextWeekDisplay] = React.useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return [today, tomorrow, thisWeek, nextWeek].map((date) =>
      date.toLocaleDateString('en-US', options),
    );
  }, [today, tomorrow, thisWeek, nextWeek]);

  const isTodaySelected = scheduledDate ? isSameDayPreset(scheduledDate, today) : false;
  const isTomorrowSelected = scheduledDate ? isSameDayPreset(scheduledDate, tomorrow) : false;
  const isThisWeekSelected = scheduledDate ? isSameDayPreset(scheduledDate, thisWeek) : false;
  const isNextWeekSelected = scheduledDate ? isSameDayPreset(scheduledDate, nextWeek) : false;

  const handleSelectDate = React.useCallback(
    (date?: Date | null) => {
      const nextDate = date ? normalizeToStartOfDay(date) : today;
      onScheduledDateChange(nextDate);
    },
    [onScheduledDateChange, today],
  );

  const handleSelectToday = React.useCallback(
    () => handleSelectDate(today),
    [handleSelectDate, today],
  );
  const handleSelectTomorrow = React.useCallback(
    () => handleSelectDate(tomorrow),
    [handleSelectDate, tomorrow],
  );
  const handleSelectThisWeek = React.useCallback(
    () => handleSelectDate(thisWeek),
    [handleSelectDate, thisWeek],
  );
  const handleSelectNextWeek = React.useCallback(
    () => handleSelectDate(nextWeek),
    [handleSelectDate, nextWeek],
  );

  const schedulePresets = React.useMemo<SchedulePreset[]>(
    () => [
      {
        key: 'today',
        label: 'Today',
        display: todayDisplay,
        selected: isTodaySelected,
        onPress: handleSelectToday,
      },
      {
        key: 'tomorrow',
        label: 'Tomorrow',
        display: tomorrowDisplay,
        selected: isTomorrowSelected,
        onPress: handleSelectTomorrow,
      },
      {
        key: 'this-week',
        label: 'This Weekend',
        display: thisWeekDisplay,
        selected: isThisWeekSelected,
        onPress: handleSelectThisWeek,
      },
      {
        key: 'next-week',
        label: 'Next Week',
        display: nextWeekDisplay,
        selected: isNextWeekSelected,
        onPress: handleSelectNextWeek,
      },
    ],
    [
      handleSelectNextWeek,
      handleSelectThisWeek,
      handleSelectToday,
      handleSelectTomorrow,
      isNextWeekSelected,
      isThisWeekSelected,
      isTodaySelected,
      isTomorrowSelected,
      nextWeekDisplay,
      thisWeekDisplay,
      todayDisplay,
      tomorrowDisplay,
    ],
  );

  const schedulePresetRows = React.useMemo(() => {
    const rows: SchedulePreset[][] = [];
    for (let index = 0; index < schedulePresets.length; index += 2) {
      rows.push(schedulePresets.slice(index, index + 2));
    }
    return rows;
  }, [schedulePresets]);

  const handleAndroidDateChange = React.useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (event.type === 'dismissed') return;
      if (date) {
        handleSelectDate(date);
      }
    },
    [handleSelectDate],
  );

  const showDatePicker = React.useCallback(() => {
    const minimumDate = minDate ?? today;

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode: 'date',
        value: scheduledDate ?? today,
        minimumDate,
        onChange: handleAndroidDateChange,
      });
    } else {
      setIosPickerVisible(true);
    }
  }, [handleAndroidDateChange, minDate, scheduledDate, today]);

  const handleIosDateChange = React.useCallback(
    (_event: DateTimePickerEvent, date?: Date) => {
      if (date) {
        handleSelectDate(date);
      }
    },
    [handleSelectDate],
  );

  const handlePriorityPress = React.useCallback(
    (value: PriorityValue) => {
      onPriorityChange(value);
    },
    [onPriorityChange],
  );

  React.useEffect(() => {
    if (!visible) {
      setIosPickerVisible(false);
    }
  }, [visible]);

  React.useEffect(() => {
    if (scheduledDate === null) {
      onScheduledDateChange(today);
    }
  }, [onScheduledDateChange, scheduledDate, today]);

  const content = (
    <View className={cn('gap-4', className)}>
      <SchedulePriorityPlan
        scheduledDate={scheduledDate}
        priority={priority}
        title={previewTitle}
        referenceDate={today}
      />

      <View>
        <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Reading Date
        </Text>
        <View className="gap-2">
          {schedulePresetRows.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row gap-2">
              {row.map(({ key, ...presetProps }) => (
                <SchedulePresetButton key={key} {...presetProps} />
              ))}
            </View>
          ))}
        </View>
        <View className="mt-2 flex-row gap-2">
          <TouchableOpacity
            onPress={showDatePicker}
            className={cn(
              'flex-1 items-center justify-center rounded-md border border-gray-300 px-3 py-3 dark:border-gray-600',
              !isTodaySelected &&
                !isTomorrowSelected &&
                !isThisWeekSelected &&
                !isNextWeekSelected &&
                'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10',
            )}
          >
            <Text
              className={cn(
                'text-sm font-medium text-gray-700 dark:text-gray-300',
                !isTodaySelected &&
                  !isTomorrowSelected &&
                  !isThisWeekSelected &&
                  !isNextWeekSelected &&
                  'text-blue-600 dark:text-blue-200',
              )}
            >
              Pick a date
            </Text>
          </TouchableOpacity>
        </View>

        {Platform.OS === 'ios' && isIosPickerVisible && (
          <View className="mt-3 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
            <DateTimePicker
              value={scheduledDate ?? today}
              mode="date"
              display="inline"
              locale="en-US"
              minimumDate={minDate ?? today}
              onChange={handleIosDateChange}
            />
            <View className="mt-2 flex-row justify-end">
              <TouchableOpacity
                onPress={() => setIosPickerVisible(false)}
                className="rounded-full bg-blue-500 px-4 py-2 dark:bg-blue-400"
              >
                <Text className="text-sm font-semibold text-white">Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View>
        <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Reading Priority
        </Text>
        <View className="flex-row gap-2">
          {PRIORITY_ORDER.map((value) => {
            const selected = priority === value;
            return (
              <TouchableOpacity
                key={value}
                onPress={() => handlePriorityPress(value)}
                className={cn(
                  'flex-1 items-center justify-center rounded-md border border-gray-300 px-3 py-3 dark:border-gray-600',
                  selected && 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10',
                )}
              >
                <Text
                  className={cn(
                    'text-sm font-semibold capitalize text-gray-700 dark:text-gray-300',
                    selected && 'text-blue-600 dark:text-blue-200',
                  )}
                >
                  {PRIORITY_LABELS[value] ?? PRIORITY_LABELS[DEFAULT_PRIORITY]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  if (Platform.OS === 'ios') {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}
