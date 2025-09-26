import { useEffect, useRef, useState } from 'react';
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

import { SchedulePriorityPicker } from '@/components/content/shared/schedule-priority-picker';
import { Text } from '@/components/ui/text';
import { useSaveContent } from '@/hooks/mutations/use-save-content';
import { formatDateForApi, getDefaultSchedule } from '@/utils/date';
import { DEFAULT_PRIORITY, type PriorityValue } from '@/utils/priority';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface FabModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FabModal({ visible, onClose, onSuccess }: FabModalProps) {
  const [url, setUrl] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(getDefaultSchedule());
  const [priority, setPriority] = useState<PriorityValue>(DEFAULT_PRIORITY);

  const inputRef = useRef<TextInput>(null);

  const { mutate, reset, isPending, isSuccess } = useSaveContent({
    onSuccess: () => {
      setUrl('');
      setScheduledDate(getDefaultSchedule());
      setPriority(DEFAULT_PRIORITY);
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
      setPriority(DEFAULT_PRIORITY);
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
    setPriority(DEFAULT_PRIORITY);
    onClose();
  };

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
                    <SchedulePriorityPicker
                      className="mt-3"
                      visible={visible}
                      scheduledDate={scheduledDate}
                      onScheduledDateChange={setScheduledDate}
                      priority={priority}
                      onPriorityChange={setPriority}
                      previewTitle="Preview"
                    />
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
