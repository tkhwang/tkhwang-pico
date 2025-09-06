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
import { ContentItem } from './content-item';
import { Icon } from '../ui/icon';
import { Check, Trash2 } from 'lucide-react-native';
import type { UserContentWithDetails } from '@tkhwang-pico/common';

interface SwipeableContentItemProps {
  item: UserContentWithDetails;
  onToggleComplete?: (id: string) => void;
}

const SWIPE_THRESHOLD = 75;
const MAX_SWIPE_DISTANCE = 200;

export function SwipeableContentItem({ item, onToggleComplete }: SwipeableContentItemProps) {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(0);

  const triggerAction = (action: 'complete' | 'delete') => {
    console.log(`Action triggered: ${action} for item ${item.id}`);
    // UI only - no actual mutations
    // Just reset the position after showing the action
    translateX.value = withSpring(0);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Limit the swipe distance
      translateX.value = Math.max(
        -MAX_SWIPE_DISTANCE,
        Math.min(MAX_SWIPE_DISTANCE, event.translationX)
      );
    })
    .onEnd(() => {
      // Check if swipe passes threshold
      if (translateX.value > SWIPE_THRESHOLD) {
        // Right swipe - Complete action
        runOnJS(triggerAction)('complete');
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        // Left swipe - Delete action
        runOnJS(triggerAction)('delete');
      } else {
        // Return to center if not past threshold
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Left background container style with dynamic height
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

  // Right background container style with dynamic height
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
    <View className="relative mb-2">
      {/* Left Background - Complete (Green) - Only visible when swiping right */}
      <AnimatedViewTyped
        className="absolute left-0 top-0 w-24 items-center justify-center rounded-l-lg bg-green-500"
        style={leftContainerStyle}>
        <AnimatedViewTyped style={leftIconStyle}>
          <Icon as={Check} className="h-6 w-6 text-white" />
        </AnimatedViewTyped>
      </AnimatedViewTyped>

      {/* Right Background - Delete (Red) - Only visible when swiping left */}
      <AnimatedViewTyped
        className="absolute right-0 top-0 w-24 items-center justify-center rounded-r-lg bg-red-500"
        style={rightContainerStyle}>
        <AnimatedViewTyped style={rightIconStyle}>
          <Icon as={Trash2} className="h-6 w-6 text-white" />
        </AnimatedViewTyped>
      </AnimatedViewTyped>

      {/* Swipeable Content */}
      <GestureDetector gesture={panGesture}>
        <AnimatedViewTyped
          style={animatedStyle}
          onLayout={(event: any) => {
            itemHeight.value = event.nativeEvent.layout.height;
          }}>
          <ContentItem item={item} onToggleComplete={onToggleComplete} />
        </AnimatedViewTyped>
      </GestureDetector>
    </View>
  );
}
