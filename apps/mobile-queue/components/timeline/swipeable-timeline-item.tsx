import React from 'react';
import { View, Alert } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { TimelineCard } from './timeline-item';
import { Icon } from '@/components/ui/icon';
import { RotateCcw, Trash2 } from 'lucide-react-native';
import type { UserContentWithDetails } from '@tkhwang-pico/common';

interface SwipeableTimelineItemProps {
  item: UserContentWithDetails;
  isFirstOfDay?: boolean;
  onReopen?: (id: string) => void;
  onDelete?: (contentId: string) => void;
  onPress?: (item: UserContentWithDetails) => void;
}

const SWIPE_THRESHOLD = 60;
const MAX_SWIPE_DISTANCE = 150;
const SWIPE_DAMPING = 0.4; // Lower damping for much slower movement

export function SwipeableTimelineItem({
  item,
  isFirstOfDay = false,
  onReopen,
  onDelete,
  onPress,
}: SwipeableTimelineItemProps) {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(0);

  const springConfig = {
    damping: 25, // Even higher damping for smoother animation
    stiffness: 70, // Much lower stiffness for slower movement
    mass: 1.5, // Higher mass for heavier feel
    velocity: 0,
  };

  const triggerAction = (action: 'reopen' | 'delete') => {
    if (action === 'reopen' && onReopen) {
      Alert.alert(
        'Move to Reading List',
        'Do you want to move this content back to your reading list?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              translateX.value = withSpring(0, springConfig);
            },
          },
          {
            text: 'Move',
            style: 'default',
            onPress: () => {
              onReopen(item.id);
              translateX.value = withSpring(0, springConfig);
            },
          },
        ]
      );
      return;
    }
    if (action === 'delete' && onDelete) {
      Alert.alert('Delete Content', 'Are you sure you want to delete this content?', [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            translateX.value = withSpring(0, springConfig);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(item.content_id);
            translateX.value = withSpring(0, springConfig);
          },
        },
      ]);
      return;
    }
    if (__DEV__) {
      console.log(`Action triggered: ${action} for item ${item.id}`);
    }
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Require 10px horizontal movement to activate
    .failOffsetY([-5, 5]) // Cancel if vertical movement exceeds 5px
    .onUpdate((e) => {
      // Much slower, heavier swipe with more resistance
      const dampedTranslation = e.translationX * SWIPE_DAMPING;

      // Apply even stronger resistance at edges for ultra-smooth feel
      if (Math.abs(dampedTranslation) > MAX_SWIPE_DISTANCE * 0.7) {
        const excess = Math.abs(dampedTranslation) - MAX_SWIPE_DISTANCE * 0.7;
        const resistance = 1 - excess / (MAX_SWIPE_DISTANCE * 2);
        translateX.value =
          Math.sign(dampedTranslation) *
          (MAX_SWIPE_DISTANCE * 0.7 + excess * Math.max(resistance, 0.1));
      } else {
        translateX.value = dampedTranslation;
      }
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        runOnJS(triggerAction)('reopen');
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        runOnJS(triggerAction)('delete');
      } else {
        translateX.value = withSpring(0, springConfig);
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
    <View className="relative">
      {/* Left Background - Reopen (Blue) - Only visible when swiping right */}
      <AnimatedViewTyped
        className="absolute left-0 top-0 w-24 items-center justify-center rounded-l-xl bg-blue-500"
        style={leftContainerStyle}>
        <AnimatedViewTyped style={leftIconStyle}>
          <Icon as={RotateCcw} className="h-6 w-6 text-white" />
        </AnimatedViewTyped>
      </AnimatedViewTyped>

      {/* Right Background - Delete (Red) - Only visible when swiping left */}
      <AnimatedViewTyped
        className="absolute right-0 top-0 w-24 items-center justify-center rounded-r-xl bg-red-500"
        style={rightContainerStyle}>
        <AnimatedViewTyped style={rightIconStyle}>
          <Icon as={Trash2} className="h-6 w-6 text-white" />
        </AnimatedViewTyped>
      </AnimatedViewTyped>

      {/* Swipeable Content */}
      <GestureDetector gesture={panGesture}>
        <AnimatedViewTyped
          className="bg-transparent"
          style={animatedStyle}
          onLayout={(e: any) => {
            itemHeight.value = e.nativeEvent.layout.height;
          }}>
          <TimelineCard item={item} isFirstOfDay={isFirstOfDay} onPress={onPress} />
        </AnimatedViewTyped>
      </GestureDetector>
    </View>
  );
}
