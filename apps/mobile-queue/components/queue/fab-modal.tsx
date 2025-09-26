import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import type { Enums } from '@tkhwang-pico/supabase';
import { Calendar } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  type TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { PRIORITY_STYLES } from '@/consts/app-styles';
import { useSaveContent } from '@/hooks/mutations/use-save-content';
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

import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface FabModalProps {
  visible: boolean;
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

export function FabModal({ visible, onClose, onSuccess }: FabModalProps) {
  const [url, setUrl] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(getDefaultSchedule());
  const [priority, setPriority] = useState<PriorityValue>('normal');
  const [isIosPickerVisible, setIosPickerVisible] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const { mutate, reset, isPending, isSuccess } = useSaveContent({
    onSuccess: () => {
      setUrl('');
      setScheduledDate(getDefaultSchedule());
      setPriority('normal');
      setIosPickerVisible(false);
      Keyboard.dismiss(); // Only dismiss keyboard on success
      onSuccess?.();
      onClose();
    },
  });

  const handleSubmitUrl = async () => {
    if (!url.trim()) return;

    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url.trim())) {
      Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://');
      return;
    }

    const scheduledFor = scheduledDate ? formatDateForApi(scheduledDate) : null;

    mutate({
      url: url.trim(),
      scheduledFor,
      priority,
    });
  };

  useEffect(() => {
    if (!visible) {
      setUrl('');
      setScheduledDate(getDefaultSchedule());
      setPriority('normal');
      setIosPickerVisible(false);
      reset();
      return;
    }

    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(focusTimer);
  }, [reset, visible]);

  const handleCloseModal = () => {
    setUrl('');
    setScheduledDate(getDefaultSchedule());
    setPriority('normal');
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
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode: 'date',
        value: scheduledDate ?? getDefaultSchedule(),
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
                  <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Add Content
                  </Text>
                  <View className="w-12" />
                </View>

                <ScrollView className="px-4 py-6" showsVerticalScrollIndicator={false}>
                  {/* URL Input */}
                  <View className="mb-6">
                    <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Content URL
                    </Text>
                    <Input
                      ref={inputRef}
                      value={url}
                      onChangeText={(text) => {
                        setUrl(text);
                        // Keep keyboard visible after paste
                        setTimeout(() => {
                          inputRef.current?.focus();
                        }, 10);
                      }}
                      placeholder="https://example.com/article"
                      className="h-12 rounded-lg border-gray-300 bg-gray-50 px-4 dark:border-gray-600 dark:bg-gray-800"
                      keyboardType="url"
                      autoCapitalize="none"
                      autoFocus={true}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmitUrl}
                    />
                    <View className="mt-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900/80">
                      <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Preview
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
                  </View>

                  {/* Schedule Selection */}
                  <View className="mb-6">
                    <Text
                      className="mb-2 text-sm font-medium leading-tight text-gray-700 dark:text-gray-300"
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      Reading Schedule
                    </Text>
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={handleSelectToday}
                        className={cn(
                          'flex-1 items-center justify-center rounded-md border border-gray-300 px-3 py-3 dark:border-gray-600',
                          isTodaySelected &&
                            'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10',
                        )}
                      >
                        <Text
                          className={cn(
                            'text-sm font-semibold text-gray-700 dark:text-gray-300',
                            isTodaySelected && 'text-blue-600 dark:text-blue-200',
                          )}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                        >
                          Today
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleSelectTomorrow}
                        className={cn(
                          'flex-1 items-center justify-center rounded-md border border-gray-300 px-3 py-3 dark:border-gray-600',
                          isTomorrowSelected &&
                            'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10',
                        )}
                      >
                        <Text
                          className={cn(
                            'text-sm font-semibold text-gray-700 dark:text-gray-300',
                            isTomorrowSelected && 'text-blue-600 dark:text-blue-200',
                          )}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                        >
                          Tomorrow
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleSelectThisWeek}
                        className={cn(
                          'flex-1 items-center justify-center rounded-md border border-gray-300 px-3 py-3 dark:border-gray-600',
                          isThisWeekSelected &&
                            'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10',
                        )}
                      >
                        <Text
                          className={cn(
                            'text-xs font-semibold uppercase text-gray-500 dark:text-gray-400',
                            isThisWeekSelected && 'text-blue-500 dark:text-blue-200',
                          )}
                        >
                          This
                        </Text>
                        <Text
                          className={cn(
                            'text-base font-semibold text-gray-700 dark:text-gray-100',
                            isThisWeekSelected && 'text-blue-600 dark:text-blue-200',
                          )}
                        >
                          Week
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleSelectNextWeek}
                        className={cn(
                          'flex-1 items-center justify-center rounded-md border border-gray-300 px-3 py-3 dark:border-gray-600',
                          isNextWeekSelected &&
                            'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10',
                        )}
                      >
                        <Text
                          className={cn(
                            'text-xs font-semibold uppercase text-gray-500 dark:text-gray-400',
                            isNextWeekSelected && 'text-blue-500 dark:text-blue-200',
                          )}
                        >
                          Next
                        </Text>
                        <Text
                          className={cn(
                            'text-base font-semibold text-gray-700 dark:text-gray-100',
                            isNextWeekSelected && 'text-blue-600 dark:text-blue-200',
                          )}
                        >
                          Week
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View className="mt-2 flex-row flex-wrap gap-2">
                      <TouchableOpacity
                        onPress={showDatePicker}
                        className={cn(
                          'rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600',
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
                          'rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600',
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
                    <Text
                      className="mb-2 text-sm font-medium leading-tight text-gray-700 dark:text-gray-300"
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      Priority
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {PRIORITY_ORDER.map((value) => {
                        const selected = priority === value;
                        return (
                          <TouchableOpacity
                            key={value}
                            onPress={() => setPriority(value)}
                            className={cn(
                              'basis-[24%] items-center justify-center rounded-md border border-gray-300 px-3 py-3 dark:border-gray-600',
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

                  {/* Submit Button */}
                  <Button
                    onPress={handleSubmitUrl}
                    disabled={!url.trim() || isPending}
                    className="mb-6 h-12 rounded-lg bg-blue-500 active:bg-blue-600 disabled:opacity-50"
                  >
                    <Text className="font-semibold text-white">
                      {isPending ? 'Saving...' : 'Add Content'}
                    </Text>
                  </Button>

                  {/* Success Message */}
                  {isSuccess && (
                    <View className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                      <View className="flex-row items-center">
                        <Text className="mr-2 text-2xl">✅</Text>
                        <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
                          Content saved successfully!
                        </Text>
                      </View>
                    </View>
                  )}
                </ScrollView>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
