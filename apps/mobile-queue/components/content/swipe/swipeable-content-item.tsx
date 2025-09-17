import React from 'react';
import { View, LayoutChangeEvent, TouchableOpacity, Alert } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { Icon } from '@/components/ui/icon';
import { Check, Trash2, RotateCcw, Heart } from 'lucide-react-native';
import { useSwipeableItem } from '@/hooks/use-swipeable-item';
import type { UserContentWithDetails } from '@tkhwang-pico/common';
import { Text } from '@/components/ui/text';
import { LEFT_ACTION_WIDTH, RIGHT_ACTION_WIDTH, SWIPE_MENU_DAMPING } from '@/consts/app-consts';
import { LIKE_STYLES, COMPLETION_STYLES, DELETE_STYLES } from '@/consts/app-styles';
import { ContentItem } from '@/components/content/content-item';

// Type assertion for React 19 compatibility
const AnimatedViewTyped = Animated.View as any;

interface SwipeableContentItemProps {
  item: UserContentWithDetails;
  onToggleComplete?: (id: string) => void;
  onDelete?: (contentId: string) => void;
  onLike?: (contentId: string) => void;
  onPress?: (item: UserContentWithDetails) => void;
}

export function SwipeableContentItem({
  item,
  onToggleComplete,
  onDelete,
  onLike,
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
    close,
    isLeftOpen,
    isRightOpen,
  } = useSwipeableItem({
    actionMode: 'menu',
    swipeThreshold: 60,
    maxSwipeDistance: Math.max(LEFT_ACTION_WIDTH, RIGHT_ACTION_WIDTH),
    leftOpenValue: LEFT_ACTION_WIDTH,
    rightOpenValue: RIGHT_ACTION_WIDTH,
    swipeDamping: SWIPE_MENU_DAMPING,
  });

  const isLiked =
    item.preferences?.some((preference) => preference.preference_type === 'liked') ?? false;

  // Dynamic colors and icons based on todo_status
  const isCompleted = item.todo_status === 'completed';
  const LeftIcon = isCompleted ? RotateCcw : Check;

  const likeStyles = isLiked ? LIKE_STYLES.liked : LIKE_STYLES.unliked;
  const completionStyles = isCompleted ? COMPLETION_STYLES.completed : COMPLETION_STYLES.pending;
  const deleteStyles = DELETE_STYLES;

  const handleLikePress = () => {
    onLike?.(item.content_id);
    close();
  };

  const handleCompletePress = () => {
    onToggleComplete?.(item.id);
    close();
  };

  const handleDeletePress = () => {
    if (!onDelete) {
      close();
      return;
    }

    Alert.alert('Delete Content', 'Are you sure you want to delete this content?', [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: close,
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onDelete(item.content_id);
          close();
        },
      },
    ]);
  };

  const handleContentPress = (contentItem: UserContentWithDetails) => {
    if (isLeftOpen || isRightOpen) {
      close();
      return;
    }
    onPress?.(contentItem);
  };

  return (
    <View className="relative mb-2">
      {/* Left Background - Like + Complete (blue when reopening) - visible when swiping right */}
      <AnimatedViewTyped
        className="absolute left-0 top-0 flex-row overflow-hidden rounded-l-lg"
        style={[leftContainerStyle, { width: LEFT_ACTION_WIDTH }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLikePress}
          className={`flex-1 items-center justify-center ${likeStyles.bg}`}>
          <AnimatedViewTyped style={leftIconStyle}>
            <Icon as={Heart} className={`h-6 w-6 ${likeStyles.icon}`} />
          </AnimatedViewTyped>
          <Text className={`mt-1 text-xs font-semibold ${likeStyles.text}`}>
            {likeStyles.label}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCompletePress}
          className={`flex-1 items-center justify-center ${completionStyles.bg}`}>
          <AnimatedViewTyped style={leftIconStyle}>
            <Icon as={LeftIcon} className={`h-6 w-6 ${completionStyles.icon}`} />
          </AnimatedViewTyped>
          <Text className={`mt-1 text-xs font-semibold ${completionStyles.text}`}>
            {isCompleted ? 'Pending' : 'Complete'}
          </Text>
        </TouchableOpacity>
      </AnimatedViewTyped>

      {/* Right Background - Delete - Only visible when swiping left */}
      <AnimatedViewTyped
        className="absolute right-0 top-0 overflow-hidden rounded-r-lg"
        style={[
          rightContainerStyle,
          { width: RIGHT_ACTION_WIDTH, alignItems: 'center', justifyContent: 'center' },
        ]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDeletePress}
          className={`h-full w-full items-center justify-center rounded-r-lg ${deleteStyles.bg}`}>
          <AnimatedViewTyped style={rightIconStyle}>
            <Icon as={Trash2} className={`h-6 w-6 ${deleteStyles.icon}`} />
          </AnimatedViewTyped>
          <Text className={`mt-1 text-xs font-semibold ${deleteStyles.text}`}>Delete</Text>
        </TouchableOpacity>
      </AnimatedViewTyped>

      {/* Swipeable Content */}
      <GestureDetector gesture={panGesture}>
        <AnimatedViewTyped
          style={animatedStyle}
          onLayout={(event: LayoutChangeEvent) => {
            itemHeight.value = event.nativeEvent.layout.height;
          }}>
          <ContentItem
            item={item}
            onToggleComplete={onToggleComplete}
            onPress={handleContentPress}
            isLiked={isLiked}
          />
        </AnimatedViewTyped>
      </GestureDetector>
    </View>
  );
}
