import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import type { Enums, UserContentWithDetails } from '@tkhwang-pico/supabase';
import { Calendar, Edit2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { PRIORITY_STYLES } from '@/consts/app-styles';
import { useUpdateContent } from '@/hooks/mutations/use-update-content';
import { cn } from '@/lib/utils';
import {
  formatDateForApi,
  formatScheduleLabel,
  getDefaultSchedule,
  getEndOfCurrentWeek,
  getNextWeekPreset,
  getTomorrowPreset,
  isSameDayPreset,
  normalizeToStartOfDay,
} from '@/utils/date';

import { Button } from '../../ui/button';

interface ContentEditModalProps {
  visible: boolean;
  item: UserContentWithDetails | null;
  onClose: () => void;
  onSuccess?: () => void;
}

type PriorityValue = Enums<'content_priority'>;

const PRIORITY_LABELS: Record<PriorityValue, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
};

const PRIORITY_ORDER: PriorityValue[] = ['low', 'normal', 'high'];

export function ContentEditModal({ visible, item, onClose, onSuccess }: ContentEditModalProps) {
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<PriorityValue>('normal');
  const [isIosPickerVisible, setIosPickerVisible] = useState(false);

  const { mutate, isPending } = useUpdateContent({
    onSuccess: () => {
      Keyboard.dismiss();
      onSuccess?.();
      onClose();
    },
  });

  // Initialize with existing values when modal opens or item changes
  useEffect(() => {
    if (visible && item) {
      // Initialize scheduled date
      if (item.scheduled_for) {
        setScheduledDate(new Date(item.scheduled_for));
      } else {
        setScheduledDate(null);
      }
      // Initialize priority
      setPriority(item.priority || 'normal');
      setIosPickerVisible(false);
    }
  }, [visible, item]);

  const handleSave = () => {
    if (!item) return;

    const scheduledFor = scheduledDate ? formatDateForApi(scheduledDate) : null;

    mutate({
      userContentId: item.id,
      scheduledFor,
      priority,
    });
  };

  const handleCloseModal = () => {
    setIosPickerVisible(false);
    onClose();
  };

  const handleSelectDate = (date: Date | null) => {
    if (date) {
      setScheduledDate(normalizeToStartOfDay(date));
    } else {
      setScheduledDate(null);
    }
  };

  const handleSelectToday = () => handleSelectDate(getDefaultSchedule());
  const handleSelectTomorrow = () => handleSelectDate(getTomorrowPreset(getDefaultSchedule()));
  const handleSelectThisWeek = () => handleSelectDate(getEndOfCurrentWeek(getDefaultSchedule()));
  const handleSelectNextWeek = () => handleSelectDate(getNextWeekPreset(getDefaultSchedule()));
  const handleClearSchedule = () => handleSelectDate(null);

  const handleAndroidDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'dismissed') return;
    if (date) {
      handleSelectDate(date);
    }
  };

  const showDatePicker = () => {
    const minDate = getDefaultSchedule(); // Today is the minimum date

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode: 'date',
        value: scheduledDate ?? getDefaultSchedule(),
        minimumDate: minDate,
        onChange: handleAndroidDateChange,
      });
    } else {
      setIosPickerVisible(true);
    }
  };

  const handleIosDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      handleSelectDate(date);
    }
  };

  if (!item) return null;

  const today = getDefaultSchedule();
  const tomorrow = getTomorrowPreset(today);
  const thisWeek = getEndOfCurrentWeek(today);
  const nextWeek = getNextWeekPreset(today);

  const scheduleDisplay = formatScheduleLabel(scheduledDate, today);
  const priorityDisplay = PRIORITY_LABELS[priority];

  const isTodaySelected = scheduledDate ? isSameDayPreset(scheduledDate, today) : false;
  const isTomorrowSelected = scheduledDate ? isSameDayPreset(scheduledDate, tomorrow) : false;
  const isThisWeekSelected = scheduledDate ? isSameDayPreset(scheduledDate, thisWeek) : false;
  const isNextWeekSelected = scheduledDate ? isSameDayPreset(scheduledDate, nextWeek) : false;

  // Check if values have changed from original
  const hasChanges = (() => {
    const originalSchedule = item.scheduled_for ? new Date(item.scheduled_for) : null;
    const originalPriority = item.priority || 'normal';

    const scheduleChanged = scheduledDate?.toISOString() !== originalSchedule?.toISOString();
    const priorityChanged = priority !== originalPriority;

    return scheduleChanged || priorityChanged;
  })();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCloseModal}
    >
      {/* Overlay to detect outside taps */}
      <TouchableWithoutFeedback onPress={handleCloseModal}>
        <View className="flex-1 justify-end bg-black/50">
          {/* KeyboardAvoidingView for proper keyboard handling */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            {/* Modal content wrapper to block touch passthrough */}
            <Pressable className="max-h-[90%]">
              <View className="rounded-t-3xl bg-white dark:bg-gray-900">
                {/* Modal Header */}
                <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-gray-700">
                  <TouchableOpacity onPress={handleCloseModal}>
                    <Text className="text-blue-500 dark:text-blue-400">Cancel</Text>
                  </TouchableOpacity>
                  <View className="flex-row items-center gap-2">
                    <Icon as={Edit2} className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Edit Content
                    </Text>
                  </View>
                  <View className="w-12" />
                </View>

                <View className="px-4 py-6">
                  {/* Content Title */}
                  <View className="mb-6">
                    <Text className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Content
                    </Text>
                    <Text
                      className="text-base font-semibold text-gray-900 dark:text-gray-100"
                      numberOfLines={2}
                    >
                      {item.contents?.title || 'Untitled'}
                    </Text>
                  </View>

                  {/* Preview Card */}
                  <View className="mb-6 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900/80">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Current Settings
                    </Text>
                    <View className="mt-3 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Icon
                          as={Calendar}
                          size={18}
                          className="text-gray-500 dark:text-gray-300"
                        />
                        <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {scheduleDisplay}
                        </Text>
                      </View>
                      <View
                        className={cn(
                          'flex-row items-center rounded-full px-3 py-1',
                          PRIORITY_STYLES[priority].badge,
                        )}
                      >
                        <View
                          className={cn(
                            'mr-2 h-2.5 w-2.5 rounded-full',
                            PRIORITY_STYLES[priority].dot,
                          )}
                        />
                        <Text
                          className={cn(
                            'text-xs font-semibold uppercase tracking-wide',
                            PRIORITY_STYLES[priority].text,
                          )}
                        >
                          {priorityDisplay}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Schedule Selection */}
                  <View className="mb-6">
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
                          value={scheduledDate ?? getDefaultSchedule()}
                          mode="date"
                          display="inline"
                          locale="en-US"
                          minimumDate={getDefaultSchedule()}
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

                  {/* Priority Selection */}
                  <View className="mb-6">
                    <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Priority
                    </Text>
                    <View className="flex-row gap-2">
                      {PRIORITY_ORDER.map((value) => {
                        const selected = priority === value;
                        return (
                          <TouchableOpacity
                            key={value}
                            onPress={() => setPriority(value)}
                            className={cn(
                              'flex-1 items-center justify-center rounded-md border border-gray-300 px-3 py-3 dark:border-gray-600',
                              selected &&
                                'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10',
                            )}
                          >
                            <Text
                              className={cn(
                                'text-sm font-semibold capitalize text-gray-700 dark:text-gray-300',
                                selected && 'text-blue-600 dark:text-blue-200',
                              )}
                            >
                              {PRIORITY_LABELS[value]}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Save Button */}
                  <Button
                    onPress={handleSave}
                    disabled={!hasChanges || isPending}
                    className="h-12 rounded-lg bg-blue-500 active:bg-blue-600 disabled:opacity-50"
                  >
                    <Text className="font-semibold text-white">
                      {isPending ? 'Saving...' : 'Save Changes'}
                    </Text>
                  </Button>
                </View>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
