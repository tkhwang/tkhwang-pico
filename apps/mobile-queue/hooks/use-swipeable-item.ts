import { Alert } from 'react-native';
import { Gesture, GestureUpdateEvent } from 'react-native-gesture-handler';
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
  onSwipeLeft?: () => void;
  confirmDelete?: boolean;
  deleteMessage?: string;
  swipeThreshold?: number;
  maxSwipeDistance?: number;
  swipeDamping?: number;
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
  onSwipeLeft,
  confirmDelete = true,
  deleteMessage = 'Are you sure you want to delete this item?',
  swipeThreshold = 60,
  maxSwipeDistance = 150,
  swipeDamping = 0.4,
}: UseSwipeableItemProps): SwipeableItemReturn {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(0);

  const handleSwipeRight = () => {
    onSwipeRight?.();
    translateX.value = withSpring(0, defaultSpringConfig);
  };

  const handleSwipeLeft = () => {
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
    .onUpdate((event: GestureUpdateEvent<any>) => {
      // Apply damping factor for smoother movement
      const dampedTranslation = event.translationX * swipeDamping;

      // Limit the swipe distance
      translateX.value = Math.max(-maxSwipeDistance, Math.min(maxSwipeDistance, dampedTranslation));
    })
    .onEnd(() => {
      // Check if swipe passes threshold
      if (translateX.value > swipeThreshold) {
        // Right swipe
        runOnJS(handleSwipeRight)();
      } else if (translateX.value < -swipeThreshold) {
        // Left swipe
        runOnJS(handleSwipeLeft)();
      } else {
        // Return to center if not past threshold
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
      [0, swipeThreshold, maxSwipeDistance],
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
      [0, -swipeThreshold, -maxSwipeDistance],
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
  };
}
