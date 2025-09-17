import { useCallback, useState } from 'react';
import {
  Gesture,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';

interface UseSwipeableItemProps {
  swipeThreshold?: number;
  maxSwipeDistance?: number;
  swipeDamping?: number;
  leftOpenValue?: number;
  rightOpenValue?: number;
}

interface SwipeableItemReturn {
  translateX: SharedValue<number>;
  itemHeight: SharedValue<number>;
  panGesture: ReturnType<typeof Gesture.Pan>;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  leftContainerStyle: ReturnType<typeof useAnimatedStyle>;
  rightContainerStyle: ReturnType<typeof useAnimatedStyle>;
  leftIconStyle: ReturnType<typeof useAnimatedStyle>;
  rightIconStyle: ReturnType<typeof useAnimatedStyle>;
  close: () => void;
  isLeftOpen: boolean;
  isRightOpen: boolean;
}

const defaultSpringConfig = {
  damping: 25,
  stiffness: 70,
  mass: 1.5,
  velocity: 0,
};

/**
 * Hook for creating swipeable menu item behavior
 */
export function useSwipeableItem({
  swipeThreshold = 60,
  maxSwipeDistance = 150,
  swipeDamping = 1,
  leftOpenValue,
  rightOpenValue,
}: UseSwipeableItemProps = {}): SwipeableItemReturn {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(0);
  const startX = useSharedValue(0);
  const [openDirection, setOpenDirection] = useState<'left' | 'right' | null>(null);

  const updateOpenDirection = useCallback((direction: 'left' | 'right' | null) => {
    setOpenDirection(direction);
  }, []);

  const normalizedLeftOpenValue = Math.max(leftOpenValue ?? maxSwipeDistance, swipeThreshold);
  const normalizedRightOpenValue = Math.max(rightOpenValue ?? maxSwipeDistance, swipeThreshold);

  const distanceLimit = Math.max(
    maxSwipeDistance,
    normalizedLeftOpenValue,
    normalizedRightOpenValue
  );

  const closingThreshold = swipeThreshold / 2;

  const close = useCallback(() => {
    updateOpenDirection(null);
    translateX.value = withSpring(0, defaultSpringConfig);
  }, [translateX, updateOpenDirection]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .shouldCancelWhenOutside(true)
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      // Apply damping factor for smoother movement
      const dampedTranslation = event.translationX * swipeDamping;

      // Limit the swipe distance
      const nextValue = startX.value + dampedTranslation;
      translateX.value = Math.max(-distanceLimit, Math.min(distanceLimit, nextValue));
    })
    .onEnd(() => {
      const startedLeftOpen = startX.value > 0;
      const startedRightOpen = startX.value < 0;

      // Handle closing gesture from open state
      if (startedLeftOpen && translateX.value < startX.value - closingThreshold) {
        translateX.value = withSpring(0, defaultSpringConfig);
        runOnJS(updateOpenDirection)(null);
        return;
      }

      if (startedRightOpen && translateX.value > startX.value + closingThreshold) {
        translateX.value = withSpring(0, defaultSpringConfig);
        runOnJS(updateOpenDirection)(null);
        return;
      }

      // Handle opening gesture
      if (translateX.value > swipeThreshold) {
        translateX.value = withSpring(normalizedLeftOpenValue, defaultSpringConfig);
        runOnJS(updateOpenDirection)('left');
      } else if (translateX.value < -swipeThreshold) {
        translateX.value = withSpring(-normalizedRightOpenValue, defaultSpringConfig);
        runOnJS(updateOpenDirection)('right');
      } else {
        translateX.value = withSpring(0, defaultSpringConfig);
        runOnJS(updateOpenDirection)(null);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Left background container style
  const leftContainerStyle = useAnimatedStyle(() => {
    const isRevealed = translateX.value > 0;
    return {
      height: itemHeight.value > 0 ? itemHeight.value : undefined,
      opacity: isRevealed ? 1 : 0,
    };
  });

  // Right background container style
  const rightContainerStyle = useAnimatedStyle(() => {
    const isRevealed = translateX.value < 0;
    return {
      height: itemHeight.value > 0 ? itemHeight.value : undefined,
      opacity: isRevealed ? 1 : 0,
    };
  });

  // Icon animations
  const leftIconStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateX.value,
      [0, swipeThreshold, distanceLimit],
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
      [0, -swipeThreshold, -distanceLimit],
      [0.8, 1, 1.2],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }],
    };
  });

  return {
    translateX,
    itemHeight,
    panGesture,
    animatedStyle,
    leftContainerStyle,
    rightContainerStyle,
    leftIconStyle,
    rightIconStyle,
    close,
    isLeftOpen: openDirection === 'left',
    isRightOpen: openDirection === 'right',
  };
}
