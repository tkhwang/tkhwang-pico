import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity, Alert, Platform, Vibration } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { RecommendItem } from '../recommend-item';
import { Icon } from '@/components/ui/icon';
import { ThumbsUp, ThumbsDown, Sparkles, Plus, X } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { useSwipeableItem } from '@/hooks/use-swipeable-item';
import {
  RECOMMEND_LEFT_ACTION_WIDTH,
  RECOMMEND_RIGHT_ACTION_WIDTH,
  SWIPE_MENU_DAMPING,
} from '@/consts/app-consts';
import { RECOMMEND_ADD_STYLES, RECOMMEND_SKIP_STYLES } from '@/consts/app-styles';
import type { Recommendation } from '@tkhwang-pico/common';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionCompleted, setActionCompleted] = useState<'queue' | 'notInterested' | null>(null);

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
    maxSwipeDistance: Math.max(RECOMMEND_LEFT_ACTION_WIDTH, RECOMMEND_RIGHT_ACTION_WIDTH),
    leftOpenValue: RECOMMEND_LEFT_ACTION_WIDTH,
    rightOpenValue: RECOMMEND_RIGHT_ACTION_WIDTH,
    swipeDamping: SWIPE_MENU_DAMPING,
  });

  const handleAddToQueue = useCallback(async () => {
    if (isProcessing) return;

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

    setIsProcessing(true);

    // Haptic feedback on mobile
    if (Platform.OS !== 'web') {
      Vibration.vibrate(10);
    }

    // Animate success state
    setActionCompleted('queue');

    // Execute action
    onAddToQueue?.(url, recommendation.content_id);

    // Reset after animation
    setTimeout(() => {
      close();
      setIsProcessing(false);
      setActionCompleted(null);
    }, 500);
  }, [isProcessing, recommendation, onAddToQueue, close]);

  const handleNotInterested = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    // Haptic feedback on mobile
    if (Platform.OS !== 'web') {
      Vibration.vibrate(10);
    }

    // Animate success state
    setActionCompleted('notInterested');

    // Execute action
    onNotInterested?.(recommendation.content_id);

    // Reset after animation
    setTimeout(() => {
      close();
      setIsProcessing(false);
      setActionCompleted(null);
    }, 500);
  }, [isProcessing, recommendation.content_id, onNotInterested, close]);

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
      {/* Left Background - Add to Queue */}
      <AnimatedViewTyped
        className={`absolute left-0 top-0 overflow-hidden rounded-xl ${leftStyles.wrapper}`}
        style={[leftContainerStyle, { width: RECOMMEND_LEFT_ACTION_WIDTH }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAddToQueue}
          disabled={isProcessing}
          className={`h-full items-center justify-center ${leftStyles.container}`}
          style={{ width: RECOMMEND_LEFT_ACTION_WIDTH }}>
          <AnimatedViewTyped style={leftIconStyle}>
            <View className="relative">
              <Icon
                as={actionCompleted === 'queue' ? Plus : ThumbsUp}
                className={`h-7 w-7 ${leftStyles.icon}`}
              />
              {actionCompleted === 'queue' && (
                <View className="absolute -right-1 -top-1">
                  <Icon as={Sparkles} className="h-3 w-3 text-yellow-300" />
                </View>
              )}
            </View>
          </AnimatedViewTyped>
          <Text className={`mt-2 text-xs font-bold uppercase tracking-wider ${leftStyles.text}`}>
            {actionCompleted === 'queue' ? 'Added!' : 'Add Queue'}
          </Text>
        </TouchableOpacity>
      </AnimatedViewTyped>

      {/* Right Background - Not Interested */}
      <AnimatedViewTyped
        className={`absolute right-0 top-0 overflow-hidden rounded-xl ${rightStyles.wrapper}`}
        style={[rightContainerStyle, { width: RECOMMEND_RIGHT_ACTION_WIDTH }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleNotInterested}
          disabled={isProcessing}
          className={`h-full items-center justify-center ${rightStyles.container}`}
          style={{ width: RECOMMEND_RIGHT_ACTION_WIDTH }}>
          <AnimatedViewTyped style={rightIconStyle}>
            <View className="relative">
              <Icon
                as={actionCompleted === 'notInterested' ? X : ThumbsDown}
                className={`h-7 w-7 ${rightStyles.icon}`}
              />
            </View>
          </AnimatedViewTyped>
          <Text className={`mt-2 text-xs font-bold uppercase tracking-wider ${rightStyles.text}`}>
            {actionCompleted === 'notInterested' ? 'Removed' : 'Skip'}
          </Text>
        </TouchableOpacity>
      </AnimatedViewTyped>

      <GestureDetector gesture={panGesture}>
        <AnimatedViewTyped
          style={animatedStyle}
          onLayout={(event: any) => {
            itemHeight.value = event.nativeEvent.layout.height;
          }}>
          <RecommendItem recommendation={recommendation} onPress={handleItemPress} />
        </AnimatedViewTyped>
      </GestureDetector>
    </View>
  );
}
