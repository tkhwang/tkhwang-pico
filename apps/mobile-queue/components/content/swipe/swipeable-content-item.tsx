import React, { useCallback } from 'react';
import { View, LayoutChangeEvent, TouchableOpacity, Alert } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { Icon } from '@/components/ui/icon';
import { Check, Trash2, RotateCcw, Heart, X, CircleCheckBig } from 'lucide-react-native';
import { useSwipeableItem } from '@/hooks/use-swipeable-item';
import type { UserContentWithDetails } from '@tkhwang-pico/common';
import { Text } from '@/components/ui/text';
import {
  HOME_TAB_LEFT_ACTION_WIDTH,
  HOME_TAB_RIGHT_ACTION_WIDTH,
  SWIPE_ACTION_BUTTON_WIDTH,
  SWIPE_MENU_DAMPING,
} from '@/consts/app-consts';
import { ACTION_STYLES, COMPLETION_STYLES, DELETE_STYLES } from '@/consts/app-styles';
import { ContentItem } from '@/components/content/content-item';
import { isContentLiked } from '@/utils/content-helpers';
import { useSwipeActionFeedback } from '@/hooks/use-swipe-action-feedback';

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
    maxSwipeDistance: Math.max(HOME_TAB_LEFT_ACTION_WIDTH, HOME_TAB_RIGHT_ACTION_WIDTH),
    leftOpenValue: HOME_TAB_LEFT_ACTION_WIDTH,
    rightOpenValue: HOME_TAB_RIGHT_ACTION_WIDTH,
    swipeDamping: SWIPE_MENU_DAMPING,
  });

  const isLiked = isContentLiked(item);

  // Dynamic colors and icons based on todo_status
  const isCompleted = item.todo_status === 'completed';
  const LeftIcon =
    actionCompleted === 'complete' ? CircleCheckBig : isCompleted ? RotateCcw : Check;

  // Dynamic styles based on action state
  const likeStyles =
    actionCompleted === 'like'
      ? {
          bg: ACTION_STYLES.like.completed.container,
          icon: ACTION_STYLES.like.completed.icon,
          text: ACTION_STYLES.like.completed.text,
          label: ACTION_STYLES.like.completed.label,
        }
      : isLiked
        ? {
            bg: ACTION_STYLES.like.liked.container,
            icon: ACTION_STYLES.like.liked.icon,
            text: ACTION_STYLES.like.liked.text,
            label: ACTION_STYLES.like.liked.label,
          }
        : {
            bg: ACTION_STYLES.like.unliked.container,
            icon: ACTION_STYLES.like.unliked.icon,
            text: ACTION_STYLES.like.unliked.text,
            label: ACTION_STYLES.like.unliked.label,
          };

  const completionStyles =
    actionCompleted === 'complete'
      ? {
          bg: ACTION_STYLES.complete.success.container,
          icon: ACTION_STYLES.complete.success.icon,
          text: ACTION_STYLES.complete.success.text,
          label: ACTION_STYLES.complete.success.label,
        }
      : isCompleted
        ? {
            bg: ACTION_STYLES.complete.completed.container,
            icon: ACTION_STYLES.complete.completed.icon,
            text: ACTION_STYLES.complete.completed.text,
            label: ACTION_STYLES.complete.completed.label,
          }
        : {
            bg: ACTION_STYLES.complete.pending.container,
            icon: ACTION_STYLES.complete.pending.icon,
            text: ACTION_STYLES.complete.pending.text,
            label: ACTION_STYLES.complete.pending.label,
          };

  const deleteStyles =
    actionCompleted === 'delete'
      ? {
          bg: ACTION_STYLES.delete.completed.container,
          icon: ACTION_STYLES.delete.completed.icon,
          text: ACTION_STYLES.delete.completed.text,
          label: ACTION_STYLES.delete.completed.label,
        }
      : {
          bg: ACTION_STYLES.delete.default.container,
          icon: ACTION_STYLES.delete.default.icon,
          text: ACTION_STYLES.delete.default.text,
          label: ACTION_STYLES.delete.default.label,
        };

  const handleLikePress = useCallback(() => {
    executeWithFeedback('like', () => onLike?.(item.content_id), close);
  }, [executeWithFeedback, item.content_id, onLike, close]);

  const handleCompletePress = useCallback(() => {
    executeWithFeedback('complete', () => onToggleComplete?.(item.id), close);
  }, [executeWithFeedback, item.id, onToggleComplete, close]);

  const handleDeletePress = useCallback(() => {
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
          executeWithFeedback('delete', () => onDelete(item.content_id), close);
        },
      },
    ]);
  }, [executeWithFeedback, item.content_id, onDelete, close]);

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
        style={[leftContainerStyle, { width: HOME_TAB_LEFT_ACTION_WIDTH }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLikePress}
          disabled={isProcessing}
          className={`items-center justify-center ${likeStyles.bg}`}
          style={{ width: SWIPE_ACTION_BUTTON_WIDTH }}>
          <AnimatedViewTyped style={leftIconStyle}>
            <Icon
              as={Heart}
              className={`h-6 w-6 ${likeStyles.icon}`}
              fill={isLiked ? 'currentColor' : 'none'}
            />
          </AnimatedViewTyped>
          <Text className={`mt-1 text-xs font-semibold ${likeStyles.text}`}>
            {likeStyles.label}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCompletePress}
          disabled={isProcessing}
          className={`items-center justify-center ${completionStyles.bg}`}
          style={{ width: SWIPE_ACTION_BUTTON_WIDTH }}>
          <AnimatedViewTyped style={leftIconStyle}>
            <Icon as={LeftIcon} className={`h-6 w-6 ${completionStyles.icon}`} />
          </AnimatedViewTyped>
          <Text className={`mt-1 text-xs font-semibold ${completionStyles.text}`}>
            {completionStyles.label}
          </Text>
        </TouchableOpacity>
      </AnimatedViewTyped>

      {/* Right Background - Delete - Only visible when swiping left */}
      <AnimatedViewTyped
        className="absolute right-0 top-0 overflow-hidden rounded-r-lg"
        style={[
          rightContainerStyle,
          { width: HOME_TAB_RIGHT_ACTION_WIDTH, alignItems: 'center', justifyContent: 'center' },
        ]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDeletePress}
          disabled={isProcessing}
          className={`h-full w-full items-center justify-center rounded-r-lg ${deleteStyles.bg}`}>
          <AnimatedViewTyped style={rightIconStyle}>
            <Icon
              as={actionCompleted === 'delete' ? X : Trash2}
              className={`h-6 w-6 ${deleteStyles.icon}`}
            />
          </AnimatedViewTyped>
          <Text className={`mt-1 text-xs font-semibold ${deleteStyles.text}`}>
            {deleteStyles.label}
          </Text>
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
            onPress={handleContentPress}
            isLiked={isLiked}
          />
        </AnimatedViewTyped>
      </GestureDetector>
    </View>
  );
}
