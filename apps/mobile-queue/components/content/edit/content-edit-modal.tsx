import type { UserContentWithDetails } from '@tkhwang-pico/supabase';
import { Edit2 } from 'lucide-react-native';
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

import { SchedulePriorityPicker } from '@/components/content/shared/schedule-priority-picker';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useUpdateContent } from '@/hooks/mutations/use-update-content';
import { formatDateForApi, normalizeToStartOfDay } from '@/utils/date';
import { DEFAULT_PRIORITY, type PriorityValue } from '@/utils/priority';

import { Button } from '../../ui/button';

interface ContentEditModalProps {
  visible: boolean;
  item: UserContentWithDetails | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ContentEditModal({ visible, item, onClose, onSuccess }: ContentEditModalProps) {
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<PriorityValue>(DEFAULT_PRIORITY);

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
        const parsed = new Date(item.scheduled_for);
        setScheduledDate(Number.isNaN(parsed.getTime()) ? null : normalizeToStartOfDay(parsed));
      } else {
        setScheduledDate(null);
      }
      // Initialize priority
      setPriority((item.priority ?? DEFAULT_PRIORITY) as PriorityValue);
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

  if (!item) return null;

  // Check if values have changed from original
  const hasChanges = (() => {
    const originalSchedule = item.scheduled_for
      ? normalizeToStartOfDay(new Date(item.scheduled_for))
      : null;
    const originalPriority = (item.priority ?? DEFAULT_PRIORITY) as PriorityValue;

    const scheduleChanged = (() => {
      if (!scheduledDate && !originalSchedule) return false;
      if (scheduledDate && originalSchedule) {
        return scheduledDate.getTime() !== originalSchedule.getTime();
      }
      return true;
    })();

    const priorityChanged = priority !== originalPriority;

    return scheduleChanged || priorityChanged;
  })();

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      {/* Overlay to detect outside taps */}
      <TouchableWithoutFeedback onPress={onClose}>
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
                  <View className="w-12" />
                  <View className="flex-1 flex-row items-center justify-center gap-2">
                    <Icon as={Edit2} className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Edit Content
                    </Text>
                  </View>
                  <TouchableOpacity onPress={onClose}>
                    <Text className="text-blue-500 dark:text-blue-400">Cancel</Text>
                  </TouchableOpacity>
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
                  <SchedulePriorityPicker
                    className="mb-6"
                    visible={visible}
                    scheduledDate={scheduledDate}
                    onScheduledDateChange={setScheduledDate}
                    priority={priority}
                    onPriorityChange={setPriority}
                    previewTitle="Reading Plan"
                  />

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
