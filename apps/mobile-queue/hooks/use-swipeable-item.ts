import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
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
  onSwipeRight?: () => void;
  onSwipeRightSecondary?: () => void;
  onSwipeLeft?: () => void;
  confirmDelete?: boolean;
  deleteMessage?: string;
  swipeThreshold?: number;
  rightSecondaryThreshold?: number;
  maxSwipeDistance?: number;
  swipeDamping?: number;
  actionMode?: 'instant' | 'menu';
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
 * Hook for creating swipeable item behavior
 */
export function useSwipeableItem({
  onSwipeRight,
  onSwipeRightSecondary,
  onSwipeLeft,
  confirmDelete = true,
  deleteMessage = 'Are you sure you want to delete this item?',
  swipeThreshold = 60,
  rightSecondaryThreshold,
  maxSwipeDistance = 150,
  swipeDamping = 0.4,
  actionMode = 'instant',
  leftOpenValue,
  rightOpenValue,
}: UseSwipeableItemProps): SwipeableItemReturn {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(0);
  const startX = useSharedValue(0);
  const [openDirection, setOpenDirection] = useState<'left' | 'right' | null>(null);

  const updateOpenDirection = useCallback((direction: 'left' | 'right' | null) => {
    setOpenDirection(direction);
  }, []);

  const effectiveSwipeDamping = actionMode === 'menu' && swipeDamping === 0.4 ? 1 : swipeDamping;

  const normalizedLeftOpenValue =
    actionMode === 'menu' ? Math.max(leftOpenValue ?? maxSwipeDistance, swipeThreshold) : 0;

  const normalizedRightOpenValue =
    actionMode === 'menu' ? Math.max(rightOpenValue ?? maxSwipeDistance, swipeThreshold) : 0;

  const distanceLimit = Math.max(
    maxSwipeDistance,
    normalizedLeftOpenValue,
    normalizedRightOpenValue
  );

  const secondaryThreshold = Math.min(
    rightSecondaryThreshold && rightSecondaryThreshold > swipeThreshold
      ? rightSecondaryThreshold
      : swipeThreshold * 2,
    distanceLimit
  );

  const closingThreshold = swipeThreshold / 2;

  const close = useCallback(() => {
    updateOpenDirection(null);
    translateX.value = withSpring(0, defaultSpringConfig);
  }, [translateX, updateOpenDirection]);

  const handleSwipeRight = (action: 'primary' | 'secondary') => {
    updateOpenDirection(null);
    if (action === 'secondary') {
      onSwipeRightSecondary?.();
    } else {
      onSwipeRight?.();
    }
    translateX.value = withSpring(0, defaultSpringConfig);
  };

  const handleSwipeLeft = () => {
    updateOpenDirection(null);
    if (confirmDelete) {
      Alert.alert('Delete', deleteMessage, [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            translateX.value = withSpring(0, defaultSpringConfig);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onSwipeLeft?.();
            translateX.value = withSpring(0, defaultSpringConfig);
          },
        },
      ]);
    } else {
      onSwipeLeft?.();
      translateX.value = withSpring(0, defaultSpringConfig);
    }
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .shouldCancelWhenOutside(true)
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      // Apply damping factor for smoother movement
      const dampedTranslation = event.translationX * effectiveSwipeDamping;

      // Limit the swipe distance
      const nextValue = startX.value + dampedTranslation;
      translateX.value = Math.max(-distanceLimit, Math.min(distanceLimit, nextValue));
    })
    .onEnd(() => {
      if (actionMode === 'menu') {
        const startedLeftOpen = startX.value > 0;
        const startedRightOpen = startX.value < 0;

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
        return;
      }

      // Instant action mode
      if (translateX.value > secondaryThreshold && onSwipeRightSecondary) {
        runOnJS(handleSwipeRight)('secondary');
      } else if (translateX.value > swipeThreshold) {
        runOnJS(handleSwipeRight)('primary');
      } else if (translateX.value < -swipeThreshold) {
        runOnJS(handleSwipeLeft)();
      } else {
        translateX.value = withSpring(0, defaultSpringConfig);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Left background container style
  const leftContainerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, 10, swipeThreshold],
      [0, 0.3, 1],
      Extrapolation.CLAMP
    );
    return {
      height: itemHeight.value > 0 ? itemHeight.value : undefined,
      opacity: translateX.value > 0 ? opacity : 0,
    };
  });

  // Right background container style
  const rightContainerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, -10, -swipeThreshold],
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
