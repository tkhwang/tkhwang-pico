import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { UserContentWithDetails } from '@tkhwang-pico/supabase';
import { Circle, Heart, RotateCcw, Trash2, X } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { ContentItem } from '@/components/content/content-item';
import { SchedulePriorityPicker } from '@/components/content/shared/schedule-priority-picker';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  ARCHIVE_TAB_LEFT_ACTION_WIDTH,
  ARCHIVE_TAB_RIGHT_ACTION_WIDTH,
  SWIPE_ACTION_BUTTON_WIDTH,
  SWIPE_MENU_DAMPING,
} from '@/consts/app-consts';
import { ACTION_STYLES } from '@/consts/app-styles';
import { useSwipeActionFeedback } from '@/hooks/use-swipe-action-feedback';
import { useSwipeableItem } from '@/hooks/use-swipeable-item';
import { isContentLiked } from '@/utils/content-helpers';
import { formatDateForApi, getDefaultSchedule, normalizeToStartOfDay } from '@/utils/date';
import { DEFAULT_PRIORITY, type PriorityValue } from '@/utils/priority';

interface ReopenOptions {
  userContentId: string;
  scheduledFor: string;
  priority: PriorityValue;
}

interface SwipeableCompletedItemProps {
  item: UserContentWithDetails;
  onReopen?: (options: ReopenOptions) => void | Promise<void>;
  onDelete?: (contentId: string) => void;
  onPress?: (item: UserContentWithDetails) => void;
  onLike?: (contentId: string) => void;
}

export function SwipeableCompletedItem({
  item,
  onReopen,
  onDelete,
  onPress,
  onLike,
}: SwipeableCompletedItemProps) {
  const isLiked = isContentLiked(item);
  const { isProcessing, actionCompleted, executeWithFeedback } = useSwipeActionFeedback();

  const {
    itemHeight,
    panGesture,
    animatedStyle,
    leftContainerStyle,
    rightContainerStyle,
    leftIconStyle,
    rightIconStyle,
    close,
    isLeftOpen,
    isRightOpen,
  } = useSwipeableItem({
    swipeThreshold: 60,
    maxSwipeDistance: Math.max(ARCHIVE_TAB_LEFT_ACTION_WIDTH, ARCHIVE_TAB_RIGHT_ACTION_WIDTH),
    leftOpenValue: ARCHIVE_TAB_LEFT_ACTION_WIDTH,
    rightOpenValue: ARCHIVE_TAB_RIGHT_ACTION_WIDTH,
    swipeDamping: SWIPE_MENU_DAMPING,
  });

  const scheduleSheetRef = useRef<BottomSheetModal>(null);
  const [scheduleDate, setScheduleDate] = useState<Date>(getDefaultSchedule());
  const [schedulePriorityValue, setSchedulePriorityValue] =
    useState<PriorityValue>(DEFAULT_PRIORITY);
  const [pendingReopen, setPendingReopen] = useState<{ userContentId: string } | null>(null);
  const [isScheduleSheetOpen, setScheduleSheetOpen] = useState(false);

  const sheetSnapPoints = useMemo(() => ['60%'], []);

  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    [],
  );

  const openScheduleSheet = useCallback(() => {
    const initialSchedule = (() => {
      if (!item.scheduled_for) return getDefaultSchedule();
      const parsed = new Date(item.scheduled_for);
      if (Number.isNaN(parsed.getTime())) {
        return getDefaultSchedule();
      }
      return normalizeToStartOfDay(parsed);
    })();

    const initialPriority = (item.priority ?? DEFAULT_PRIORITY) as PriorityValue;

    setScheduleDate(initialSchedule);
    setSchedulePriorityValue(initialPriority);
    setPendingReopen({ userContentId: item.id });
    setScheduleSheetOpen(true);
    close();
    scheduleSheetRef.current?.present();
  }, [close, item.id, item.priority, item.scheduled_for]);

  const handleScheduleSheetDismiss = useCallback(() => {
    setScheduleSheetOpen(false);
    setPendingReopen(null);
    setScheduleDate(getDefaultSchedule());
    setSchedulePriorityValue(DEFAULT_PRIORITY);
  }, []);

  const handleScheduleDateChange = useCallback((date: Date | null) => {
    setScheduleDate(date ? normalizeToStartOfDay(date) : getDefaultSchedule());
  }, []);

  const handleCancelReopen = useCallback(() => {
    scheduleSheetRef.current?.dismiss();
    close();
  }, [close]);

  const handleConfirmReopen = useCallback(() => {
    if (!pendingReopen || !onReopen) return;

    const scheduledFor = formatDateForApi(scheduleDate);
    scheduleSheetRef.current?.dismiss();

    executeWithFeedback(
      'reopen',
      () =>
        Promise.resolve(
          onReopen({
            userContentId: pendingReopen.userContentId,
            scheduledFor,
            priority: schedulePriorityValue,
          }),
        ),
      close,
    );
  }, [close, executeWithFeedback, onReopen, pendingReopen, scheduleDate, schedulePriorityValue]);

  const handleReopen = useCallback(() => {
    if (!onReopen) {
      executeWithFeedback('reopen', () => Promise.resolve(), close);
      return;
    }
    openScheduleSheet();
  }, [close, executeWithFeedback, onReopen, openScheduleSheet]);

  const handleLike = useCallback(() => {
    executeWithFeedback('like', () => onLike?.(item.content_id), close);
  }, [executeWithFeedback, item.content_id, onLike, close]);

  const handleDelete = useCallback(() => {
    if (!onDelete) {
      close();
      return;
    }

    Alert.alert('Delete Content', 'Are you sure you want to delete this content?', [
      { text: 'Cancel', style: 'cancel', onPress: close },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          executeWithFeedback('delete', () => onDelete(item.content_id), close);
        },
      },
    ]);
  }, [executeWithFeedback, item.content_id, onDelete, close]);

  const handlePress = (content: UserContentWithDetails) => {
    if (isLeftOpen || isRightOpen) {
      close();
      return;
    }
    onPress?.(content);
  };

  // Dynamic styles based on action state
  const leftLikeStyles =
    actionCompleted === 'like'
      ? {
          bg: ACTION_STYLES.like.completed.container,
          icon: ACTION_STYLES.like.completed.icon,
          text: ACTION_STYLES.like.completed.text,
          label: ACTION_STYLES.like.completed.label,
        }
      : isLiked
        ? {
            bg: ACTION_STYLES.like.liked.container,
            icon: ACTION_STYLES.like.liked.icon,
            text: ACTION_STYLES.like.liked.text,
            label: ACTION_STYLES.like.liked.label,
          }
        : {
            bg: ACTION_STYLES.like.unliked.container,
            icon: ACTION_STYLES.like.unliked.icon,
            text: ACTION_STYLES.like.unliked.text,
            label: ACTION_STYLES.like.unliked.label,
          };
  const leftReopenStyles =
    actionCompleted === 'reopen'
      ? {
          bg: ACTION_STYLES.reopen.success.container,
          icon: ACTION_STYLES.reopen.success.icon,
          text: ACTION_STYLES.reopen.success.text,
          label: ACTION_STYLES.reopen.success.label,
        }
      : {
          bg: ACTION_STYLES.reopen.default.container,
          icon: ACTION_STYLES.reopen.default.icon,
          text: ACTION_STYLES.reopen.default.text,
          label: ACTION_STYLES.reopen.default.label,
        };
  const rightStyles =
    actionCompleted === 'delete'
      ? {
          bg: ACTION_STYLES.delete.completed.container,
          icon: ACTION_STYLES.delete.completed.icon,
          text: ACTION_STYLES.delete.completed.text,
          label: ACTION_STYLES.delete.completed.label,
        }
      : {
          bg: ACTION_STYLES.delete.default.container,
          icon: ACTION_STYLES.delete.default.icon,
          text: ACTION_STYLES.delete.default.text,
          label: ACTION_STYLES.delete.default.label,
        };

  const AnimatedViewTyped = Animated.View as any;

  return (
    <>
      <View className="relative">
        {/* Left Background - Reopen (Blue) - Only visible when swiping right */}
        <AnimatedViewTyped
          className="absolute left-0 top-0 overflow-hidden rounded-l-xl"
          style={[leftContainerStyle, { width: ARCHIVE_TAB_LEFT_ACTION_WIDTH }]}
        >
          <View
            className="flex-row items-stretch"
            style={{ width: ARCHIVE_TAB_LEFT_ACTION_WIDTH, height: '100%' }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleReopen}
              disabled={isProcessing}
              className={`items-center justify-center ${leftReopenStyles.bg}`}
              style={{ width: SWIPE_ACTION_BUTTON_WIDTH }}
            >
              <AnimatedViewTyped style={leftIconStyle}>
                <Icon
                  as={actionCompleted === 'reopen' ? Circle : RotateCcw}
                  className={`h-6 w-6 ${leftReopenStyles.icon}`}
                />
              </AnimatedViewTyped>
              <Text className={`mt-1 text-xs font-semibold ${leftReopenStyles.text}`}>
                {leftReopenStyles.label}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLike}
              disabled={isProcessing}
              className={`items-center justify-center ${leftLikeStyles.bg}`}
              style={{ width: SWIPE_ACTION_BUTTON_WIDTH }}
            >
              <AnimatedViewTyped style={leftIconStyle}>
                <Icon
                  as={Heart}
                  className={`h-6 w-6 ${leftLikeStyles.icon}`}
                  fill={isLiked ? 'currentColor' : 'none'}
                />
              </AnimatedViewTyped>
              <Text className={`mt-1 text-xs font-semibold ${leftLikeStyles.text}`}>
                {leftLikeStyles.label}
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedViewTyped>

        {/* Right Background - Delete (Red) - Only visible when swiping left */}
        <AnimatedViewTyped
          className={`absolute right-0 top-0 overflow-hidden rounded-r-xl ${rightStyles.bg}`}
          style={[rightContainerStyle, { width: ARCHIVE_TAB_RIGHT_ACTION_WIDTH }]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleDelete}
            disabled={isProcessing}
            className="items-center justify-center"
            style={{ width: ARCHIVE_TAB_RIGHT_ACTION_WIDTH, height: '100%' }}
          >
            <AnimatedViewTyped style={rightIconStyle}>
              <Icon
                as={actionCompleted === 'delete' ? X : Trash2}
                className={`h-6 w-6 ${rightStyles.icon}`}
              />
            </AnimatedViewTyped>
            <Text className={`mt-1 text-xs font-semibold ${rightStyles.text}`}>
              {rightStyles.label}
            </Text>
          </TouchableOpacity>
        </AnimatedViewTyped>

        {/* Swipeable Content */}
        <GestureDetector gesture={panGesture}>
          <AnimatedViewTyped
            className="bg-transparent"
            style={animatedStyle}
            onLayout={(e: any) => {
              itemHeight.value = e.nativeEvent.layout.height;
            }}
          >
            <ContentItem
              item={item}
              onPress={handlePress}
              isLiked={isLiked}
              showCompletedTime={true}
            />
          </AnimatedViewTyped>
        </GestureDetector>
      </View>

      {onReopen && (
        <BottomSheetModal
          ref={scheduleSheetRef}
          snapPoints={sheetSnapPoints}
          onDismiss={handleScheduleSheetDismiss}
          backdropComponent={renderBackdrop}
          enablePanDownToClose={!isProcessing}
        >
          <BottomSheetView className="flex-1 px-4 py-4">
            <Text className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-100">
              Add to Queue
            </Text>
            <Text className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              Choose when to read and how important it is.
            </Text>

            <SchedulePriorityPicker
              visible={isScheduleSheetOpen}
              scheduledDate={scheduleDate}
              onScheduledDateChange={handleScheduleDateChange}
              priority={schedulePriorityValue}
              onPriorityChange={setSchedulePriorityValue}
              previewTitle="Preview"
            />

            <View className="mt-6 flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onPress={handleCancelReopen}
                disabled={isProcessing}
              >
                <Text>Cancel</Text>
              </Button>
              <Button
                className="flex-1 bg-blue-500"
                onPress={handleConfirmReopen}
                disabled={isProcessing || !pendingReopen}
              >
                <Text className="font-semibold text-white">Save</Text>
              </Button>
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      )}
    </>
  );
}
