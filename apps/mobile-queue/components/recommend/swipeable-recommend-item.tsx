import React from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { RecommendItem } from './recommend-item';
import { Icon } from '../ui/icon';
import { ThumbsUp, ThumbsDown } from 'lucide-react-native';
import type { Recommendation } from '@tkhwang-pico/common';

interface SwipeableRecommendItemProps {
  recommendation: Recommendation;
  onAddToQueue?: (url: string, contentId: string) => void;
  onNotInterested?: (contentId: string) => void;
  onPress?: (recommendation: Recommendation) => void;
}

const SWIPE_THRESHOLD = 60;
const MAX_SWIPE_DISTANCE = 150;
const SWIPE_DAMPING = 0.4; // Lower damping for much slower movement

export function SwipeableRecommendItem({
  recommendation,
  onAddToQueue,
  onNotInterested,
  onPress,
}: SwipeableRecommendItemProps) {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(0);

  const springConfig = {
    damping: 25, // Even higher damping for smoother animation
    stiffness: 70, // Much lower stiffness for slower movement
    mass: 1.5, // Higher mass for heavier feel
    velocity: 0,
  };

  const triggerAction = (action: 'addToQueue' | 'notInterested') => {
    const content = recommendation.contents;
    if (!content) return;

    if (action === 'addToQueue' && onAddToQueue) {
      const url = content.canonical_url || content.url;
      if (url) {
        onAddToQueue(url, recommendation.content_id);
      }
    }
    if (action === 'notInterested' && onNotInterested) {
      onNotInterested(recommendation.content_id);
    }
    if (__DEV__) {
      // Keep useful trace in development; avoid noisy logs in production
      // eslint-disable-next-line no-console
      console.log(`Action triggered: ${action} for recommendation ${recommendation.content_id}`);
    }
    translateX.value = withSpring(0, springConfig);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Require 10px horizontal movement to activate
    .failOffsetY([-5, 5]) // Cancel if vertical movement exceeds 5px
    .shouldCancelWhenOutside(true)
    .onUpdate((event) => {
      // Apply damping factor for smoother movement
      const dampedTranslation = event.translationX * SWIPE_DAMPING;

      // Limit the swipe distance
      translateX.value = Math.max(
        -MAX_SWIPE_DISTANCE,
        Math.min(MAX_SWIPE_DISTANCE, dampedTranslation)
      );
    })
    .onEnd(() => {
      // Check if swipe passes threshold
      if (translateX.value > SWIPE_THRESHOLD) {
        // Right swipe - Add to Queue action
        runOnJS(triggerAction)('addToQueue');
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        // Left swipe - Not Interested action
        runOnJS(triggerAction)('notInterested');
      } else {
        // Return to center if not past threshold
        translateX.value = withSpring(0, springConfig);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Left background container style with dynamic height (Add to Queue - Green)
  const leftContainerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, 10, SWIPE_THRESHOLD],
      [0, 0.3, 1],
      Extrapolation.CLAMP
    );
    return {
      height: itemHeight.value > 0 ? itemHeight.value : undefined,
      opacity: translateX.value > 0 ? opacity : 0,
    };
  });

  // Right background container style with dynamic height (Not Interested - Gray)
  const rightContainerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, -10, -SWIPE_THRESHOLD],
      [0, 0.3, 1],
      Extrapolation.CLAMP
    );
    return {
      height: itemHeight.value > 0 ? itemHeight.value : undefined,
      opacity: translateX.value < 0 ? opacity : 0,
    };
  });

  // Icon animations
  const leftIconStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD, MAX_SWIPE_DISTANCE],
      [0.8, 1, 1.2],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }],
    };
  });

  const rightIconStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateX.value,
      [0, -SWIPE_THRESHOLD, -MAX_SWIPE_DISTANCE],
      [0.8, 1, 1.2],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }],
    };
  });

  // Type assertion for React 19 compatibility
  const AnimatedViewTyped = Animated.View as any;

  return (
    <View className="relative mb-4">
      {/* Left Background - Add to Queue (Green) - Only visible when swiping right */}
      <AnimatedViewTyped
        className="absolute left-0 top-0 w-24 items-center justify-center rounded-l-xl bg-green-500"
        style={leftContainerStyle}>
        <AnimatedViewTyped style={leftIconStyle}>
          <Icon as={ThumbsUp} className="h-6 w-6 text-white" />
        </AnimatedViewTyped>
      </AnimatedViewTyped>

      {/* Right Background - Not Interested (Red) - Only visible when swiping left */}
      <AnimatedViewTyped
        className="absolute right-0 top-0 w-24 items-center justify-center rounded-r-xl bg-red-500"
        style={rightContainerStyle}>
        <AnimatedViewTyped style={rightIconStyle}>
          <Icon as={ThumbsDown} className="h-6 w-6 text-white" />
        </AnimatedViewTyped>
      </AnimatedViewTyped>

      {/* Swipeable Content */}
      <GestureDetector gesture={panGesture}>
        <AnimatedViewTyped
          style={animatedStyle}
          onLayout={(event: any) => {
            itemHeight.value = event.nativeEvent.layout.height;
          }}>
          <RecommendItem recommendation={recommendation} onPress={onPress || (() => {})} />
        </AnimatedViewTyped>
      </GestureDetector>
    </View>
  );
}