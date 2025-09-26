import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { Recommendation } from '@tkhwang-pico/supabase';
import { Circle, ThumbsDown, ThumbsUp, X } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, type LayoutChangeEvent, TouchableOpacity, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { SchedulePriorityPicker } from '@/components/content/shared/schedule-priority-picker';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  RECOMMEND_TAB_LEFT_ACTION_WIDTH,
  RECOMMEND_TAB_RIGHT_ACTION_WIDTH,
  SWIPE_ACTION_BUTTON_WIDTH,
  SWIPE_MENU_DAMPING,
} from '@/consts/app-consts';
import { ACTION_STYLES, RECOMMEND_ADD_STYLES, RECOMMEND_SKIP_STYLES } from '@/consts/app-styles';
import { useSwipeActionFeedback } from '@/hooks/use-swipe-action-feedback';
import { useSwipeableItem } from '@/hooks/use-swipeable-item';
import { formatDateForApi, getDefaultSchedule } from '@/utils/date';
import { DEFAULT_PRIORITY, type PriorityValue } from '@/utils/priority';

import { RecommendItem } from '../recommend-item';

interface AddToQueueOptions {
  url: string;
  contentId: string;
  scheduledFor: string;
  priority: PriorityValue;
}

interface SwipeableRecommendItemProps {
  recommendation: Recommendation;
  onAddToQueue?: (options: AddToQueueOptions) => void | Promise<void>;
  onNotInterested?: (contentId: string) => void;
  onPress?: (recommendation: Recommendation) => void;
}

export function SwipeableRecommendItem({
  recommendation,
  onAddToQueue,
  onNotInterested,
  onPress,
}: SwipeableRecommendItemProps) {
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
    maxSwipeDistance: Math.max(RECOMMEND_TAB_LEFT_ACTION_WIDTH, RECOMMEND_TAB_RIGHT_ACTION_WIDTH),
    leftOpenValue: RECOMMEND_TAB_LEFT_ACTION_WIDTH,
    rightOpenValue: RECOMMEND_TAB_RIGHT_ACTION_WIDTH,
    swipeDamping: SWIPE_MENU_DAMPING,
  });

  const scheduleSheetRef = useRef<BottomSheetModal>(null);
  const [scheduledDate, setScheduledDate] = useState<Date>(getDefaultSchedule());
  const [priority, setPriority] = useState<PriorityValue>(DEFAULT_PRIORITY);
  const [pendingAdd, setPendingAdd] = useState<{ url: string; contentId: string } | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);

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

  const resetSheetState = useCallback(() => {
    setScheduledDate(getDefaultSchedule());
    setPriority(DEFAULT_PRIORITY);
  }, []);

  const openScheduleSheet = useCallback(
    (url: string, contentId: string) => {
      resetSheetState();
      setPendingAdd({ url, contentId });
      setIsSheetVisible(true);
      close();
      scheduleSheetRef.current?.present();
    },
    [close, resetSheetState],
  );

  const handleSheetDismiss = useCallback(() => {
    setIsSheetVisible(false);
    setPendingAdd(null);
  }, []);

  const handleScheduleChange = useCallback((date: Date | null) => {
    setScheduledDate(date ?? getDefaultSchedule());
  }, []);

  const handleAddToQueue = useCallback(() => {
    const content = recommendation.contents;
    if (!content) {
      close();
      return;
    }
    const url = content.canonical_url || content.url;
    if (!url) {
      Alert.alert('Unavailable', 'This content does not have a URL to add.');
      close();
      return;
    }

    openScheduleSheet(url, recommendation.content_id);
  }, [recommendation, close, openScheduleSheet]);

  const handleCancelSheet = useCallback(() => {
    scheduleSheetRef.current?.dismiss();
    close();
  }, [close]);

  const handleConfirmSheet = useCallback(() => {
    if (!pendingAdd) return;

    const scheduledFor = formatDateForApi(scheduledDate);
    scheduleSheetRef.current?.dismiss();

    executeWithFeedback(
      'queue',
      () =>
        onAddToQueue?.({
          url: pendingAdd.url,
          contentId: pendingAdd.contentId,
          scheduledFor,
          priority,
        }),
      close,
    );
  }, [pendingAdd, scheduledDate, priority, onAddToQueue, executeWithFeedback, close]);

  const handleNotInterested = useCallback(() => {
    executeWithFeedback('notInterested', () => onNotInterested?.(recommendation.content_id), close);
  }, [executeWithFeedback, recommendation.content_id, onNotInterested, close]);

  const handleItemPress = (item: Recommendation) => {
    if (isLeftOpen || isRightOpen) {
      close();
      return;
    }
    onPress?.(item);
  };

  // Dynamic styles based on action state
  const leftStyles =
    actionCompleted === 'queue' ? RECOMMEND_ADD_STYLES.completed : RECOMMEND_ADD_STYLES.default;

  const rightStyles =
    actionCompleted === 'notInterested'
      ? RECOMMEND_SKIP_STYLES.completed
      : RECOMMEND_SKIP_STYLES.default;

  const AnimatedViewTyped = Animated.View as any;

  return (
    <View className="relative mb-4">
      {/* Left Background - Add to Queue (structured like working components) */}
      <AnimatedViewTyped
        className="absolute left-0 top-0 flex-row overflow-hidden rounded-l-lg"
        style={[leftContainerStyle, { width: RECOMMEND_TAB_LEFT_ACTION_WIDTH }]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAddToQueue}
          disabled={isProcessing}
          className={`items-center justify-center ${leftStyles.container}`}
          style={{ width: SWIPE_ACTION_BUTTON_WIDTH }}
        >
          <AnimatedViewTyped style={leftIconStyle}>
            <Icon
              as={actionCompleted === 'queue' ? Circle : ThumbsUp}
              className={`h-6 w-6 ${leftStyles.icon}`}
            />
          </AnimatedViewTyped>
          <Text className={`mt-1 text-xs font-semibold ${leftStyles.text}`}>
            {actionCompleted === 'queue'
              ? ACTION_STYLES.addToQueue.completed.label
              : ACTION_STYLES.addToQueue.default.label}
          </Text>
        </TouchableOpacity>
      </AnimatedViewTyped>

      {/* Right Background - Not Interested (structured like working components) */}
      <AnimatedViewTyped
        className="absolute right-0 top-0 overflow-hidden rounded-r-lg"
        style={[
          rightContainerStyle,
          {
            width: RECOMMEND_TAB_RIGHT_ACTION_WIDTH,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleNotInterested}
          disabled={isProcessing}
          className={`h-full items-center justify-center rounded-r-lg ${rightStyles.container}`}
          style={{ width: SWIPE_ACTION_BUTTON_WIDTH }}
        >
          <AnimatedViewTyped style={rightIconStyle}>
            <Icon
              as={actionCompleted === 'notInterested' ? X : ThumbsDown}
              className={`h-6 w-6 ${rightStyles.icon}`}
            />
          </AnimatedViewTyped>
          <Text className={`mt-1 text-xs font-semibold ${rightStyles.text}`}>
            {actionCompleted === 'notInterested'
              ? ACTION_STYLES.notInterested.completed.label
              : ACTION_STYLES.notInterested.default.label}
          </Text>
        </TouchableOpacity>
      </AnimatedViewTyped>

      <GestureDetector gesture={panGesture}>
        <AnimatedViewTyped
          style={animatedStyle}
          onLayout={(event: LayoutChangeEvent) => {
            itemHeight.value = event.nativeEvent.layout.height;
          }}
        >
          <RecommendItem recommendation={recommendation} onPress={handleItemPress} />
        </AnimatedViewTyped>
      </GestureDetector>

      <BottomSheetModal
        ref={scheduleSheetRef}
        snapPoints={sheetSnapPoints}
        onDismiss={handleSheetDismiss}
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
            visible={isSheetVisible}
            scheduledDate={scheduledDate}
            onScheduledDateChange={handleScheduleChange}
            priority={priority}
            onPriorityChange={setPriority}
            previewTitle="Preview"
          />

          <View className="mt-6 flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onPress={handleCancelSheet}
              disabled={isProcessing}
            >
              <Text>Cancel</Text>
            </Button>
            <Button
              className="flex-1 bg-blue-500"
              onPress={handleConfirmSheet}
              disabled={isProcessing || !pendingAdd}
            >
              <Text className="font-semibold text-white">Save</Text>
            </Button>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}
