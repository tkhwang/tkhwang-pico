import React from 'react';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { ContentItem } from '../content-item';
import { Icon } from '@/components/ui/icon';
import { Check, Trash2, RotateCcw } from 'lucide-react-native';
import { useSwipeableItem } from '@/hooks/use-swipeable-item';
import type { UserContentWithDetails } from '@tkhwang-pico/common';

// Type assertion for React 19 compatibility
const AnimatedViewTyped = Animated.View as any;

interface SwipeableContentItemProps {
  item: UserContentWithDetails;
  onToggleComplete?: (id: string) => void;
  onDelete?: (contentId: string) => void;
  onPress?: (item: UserContentWithDetails) => void;
}

export function SwipeableContentItem({
  item,
  onToggleComplete,
  onDelete,
  onPress,
}: SwipeableContentItemProps) {
  const {
    itemHeight,
    panGesture,
    animatedStyle,
    leftContainerStyle,
    rightContainerStyle,
    leftIconStyle,
    rightIconStyle,
  } = useSwipeableItem({
    onSwipeRight: () => onToggleComplete?.(item.id),
    onSwipeLeft: () => onDelete?.(item.content_id),
    confirmDelete: true,
    deleteMessage: 'Are you sure you want to delete this content?',
  });

  // Dynamic colors and icons based on todo_status
  const isCompleted = item.todo_status === 'completed';
  const leftBgColor = isCompleted ? 'bg-blue-500' : 'bg-green-500';
  const LeftIcon = isCompleted ? RotateCcw : Check;

  return (
    <View className="relative mb-2">
      {/* Left Background - Toggle (Green for complete, Blue for reopen) - Only visible when swiping right */}
      <AnimatedViewTyped
        className={`absolute left-0 top-0 w-24 items-center justify-center rounded-l-lg ${leftBgColor}`}
        style={leftContainerStyle}>
        <AnimatedViewTyped style={leftIconStyle}>
          <Icon as={LeftIcon} className="h-6 w-6 text-white" />
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
          <ContentItem item={item} onToggleComplete={onToggleComplete} onPress={onPress} />
        </AnimatedViewTyped>
      </GestureDetector>
    </View>
  );
}
