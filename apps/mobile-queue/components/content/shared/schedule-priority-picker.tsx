import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';

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

import { SchedulePriorityPreview } from './schedule-priority-preview';

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

export function SchedulePriorityPicker({
  scheduledDate,
  onScheduledDateChange,
  priority,
  onPriorityChange,
  visible = true,
  previewTitle = 'Current Settings',
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

  const isTodaySelected = scheduledDate ? isSameDayPreset(scheduledDate, today) : false;
  const isTomorrowSelected = scheduledDate ? isSameDayPreset(scheduledDate, tomorrow) : false;
  const isThisWeekSelected = scheduledDate ? isSameDayPreset(scheduledDate, thisWeek) : false;
  const isNextWeekSelected = scheduledDate ? isSameDayPreset(scheduledDate, nextWeek) : false;

  const handleSelectDate = React.useCallback(
    (date: Date | null) => {
      if (date) {
        onScheduledDateChange(normalizeToStartOfDay(date));
      } else {
        onScheduledDateChange(null);
      }
    },
    [onScheduledDateChange],
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
  const handleClearSchedule = React.useCallback(() => handleSelectDate(null), [handleSelectDate]);

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

  return (
    <View className={cn('gap-6', className)}>
      <SchedulePriorityPreview
        scheduledDate={scheduledDate}
        priority={priority}
        title={previewTitle}
        referenceDate={today}
      />

      <View>
        <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Reading Schedule
        </Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handleSelectToday}
            className={cn(
              'flex-1 items-center justify-center rounded-md border border-gray-300 px-2 py-3 dark:border-gray-600',
              isTodaySelected &&
                'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10',
            )}
          >
            <Text
              className={cn(
                'text-sm font-semibold text-gray-700 dark:text-gray-300',
                isTodaySelected && 'text-blue-600 dark:text-blue-200',
              )}
            >
              Today
            </Text>
            <Text
              className={cn(
                'text-xs text-gray-500 dark:text-gray-400',
                isTodaySelected && 'text-blue-500 dark:text-blue-300',
              )}
            >
              {today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSelectTomorrow}
            className={cn(
              'flex-1 items-center justify-center rounded-md border border-gray-300 px-2 py-3 dark:border-gray-600',
              isTomorrowSelected &&
                'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10',
            )}
          >
            <Text
              className={cn(
                'text-sm font-semibold text-gray-700 dark:text-gray-300',
                isTomorrowSelected && 'text-blue-600 dark:text-blue-200',
              )}
            >
              Tomorrow
            </Text>
            <Text
              className={cn(
                'text-xs text-gray-500 dark:text-gray-400',
                isTomorrowSelected && 'text-blue-500 dark:text-blue-300',
              )}
            >
              {tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSelectThisWeek}
            className={cn(
              'flex-1 items-center justify-center rounded-md border border-gray-300 px-2 py-3 dark:border-gray-600',
              isThisWeekSelected &&
                'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10',
            )}
          >
            <Text
              className={cn(
                'text-sm font-semibold text-gray-700 dark:text-gray-300',
                isThisWeekSelected && 'text-blue-600 dark:text-blue-200',
              )}
            >
              This Week
            </Text>
            <Text
              className={cn(
                'text-xs text-gray-500 dark:text-gray-400',
                isThisWeekSelected && 'text-blue-500 dark:text-blue-300',
              )}
            >
              {thisWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSelectNextWeek}
            className={cn(
              'flex-1 items-center justify-center rounded-md border border-gray-300 px-2 py-3 dark:border-gray-600',
              isNextWeekSelected &&
                'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10',
            )}
          >
            <Text
              className={cn(
                'text-sm font-semibold text-gray-700 dark:text-gray-300',
                isNextWeekSelected && 'text-blue-600 dark:text-blue-200',
              )}
            >
              Next Week
            </Text>
            <Text
              className={cn(
                'text-xs text-gray-500 dark:text-gray-400',
                isNextWeekSelected && 'text-blue-500 dark:text-blue-300',
              )}
            >
              {nextWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="mt-2 flex-row gap-2">
          <TouchableOpacity
            onPress={showDatePicker}
            className={cn(
              'flex-1 items-center justify-center rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600',
              !isTodaySelected &&
                !isTomorrowSelected &&
                !isThisWeekSelected &&
                !isNextWeekSelected &&
                scheduledDate !== null &&
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
                  scheduledDate !== null &&
                  'text-blue-600 dark:text-blue-200',
              )}
            >
              Pick a date
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClearSchedule}
            className={cn(
              'flex-1 items-center justify-center rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600',
              scheduledDate === null &&
                'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10',
            )}
          >
            <Text
              className={cn(
                'text-sm font-medium text-gray-700 dark:text-gray-300',
                scheduledDate === null && 'text-blue-600 dark:text-blue-200',
              )}
            >
              No schedule
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
        <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Priority</Text>
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
}
