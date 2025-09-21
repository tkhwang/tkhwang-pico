import type { Recommendation } from '@tkhwang-pico/common';
import { Circle, ThumbsDown, ThumbsUp, X } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

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

import { RecommendItem } from '../recommend-item';

interface SwipeableRecommendItemProps {
  recommendation: Recommendation;
  onAddToQueue?: (url: string, contentId: string) => void;
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

    executeWithFeedback('queue', () => onAddToQueue?.(url, recommendation.content_id), close);
  }, [executeWithFeedback, recommendation, onAddToQueue, close]);

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
          onLayout={(event: any) => {
            itemHeight.value = event.nativeEvent.layout.height;
          }}
        >
          <RecommendItem recommendation={recommendation} onPress={handleItemPress} />
        </AnimatedViewTyped>
      </GestureDetector>
    </View>
  );
}
