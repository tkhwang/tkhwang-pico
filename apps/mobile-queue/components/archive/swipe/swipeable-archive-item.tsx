import React, { useCallback } from 'react';
import { View, Alert, TouchableOpacity } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { ArchiveCard } from '../archive-item';
import { Icon } from '@/components/ui/icon';
import { RotateCcw, Trash2, Heart, Circle, X } from 'lucide-react-native';
import type { UserContentWithDetails } from '@tkhwang-pico/common';
import { Text } from '@/components/ui/text';
import { useSwipeableItem } from '@/hooks/use-swipeable-item';
import {
  SWIPE_ACTION_BUTTON_WIDTH,
  SWIPE_MENU_DAMPING,
  ARCHIVE_TAB_LEFT_ACTION_WIDTH,
  ARCHIVE_TAB_RIGHT_ACTION_WIDTH,
} from '@/consts/app-consts';
import { ACTION_STYLES, DELETE_STYLES, REOPEN_STYLES } from '@/consts/app-styles';
import { useSwipeActionFeedback } from '@/hooks/use-swipe-action-feedback';

interface SwipeableArchiveItemProps {
  item: UserContentWithDetails;
  isFirstOfDay?: boolean;
  onReopen?: (id: string) => void;
  onDelete?: (contentId: string) => void;
  onPress?: (item: UserContentWithDetails) => void;
  onLike?: (contentId: string) => void;
  isLiked?: boolean;
}

export function SwipeableArchiveItem({
  item,
  isFirstOfDay = false,
  onReopen,
  onDelete,
  onPress,
  onLike,
  isLiked = false,
}: SwipeableArchiveItemProps) {
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
    maxSwipeDistance: Math.max(ARCHIVE_TAB_LEFT_ACTION_WIDTH, ARCHIVE_TAB_RIGHT_ACTION_WIDTH),
    leftOpenValue: ARCHIVE_TAB_LEFT_ACTION_WIDTH,
    rightOpenValue: ARCHIVE_TAB_RIGHT_ACTION_WIDTH,
    swipeDamping: SWIPE_MENU_DAMPING,
  });

  const handleReopen = useCallback(() => {
    executeWithFeedback('reopen', () => onReopen?.(item.id), close);
  }, [executeWithFeedback, item.id, onReopen, close]);

  const handleLike = useCallback(() => {
    executeWithFeedback('like', () => onLike?.(item.content_id), close);
  }, [executeWithFeedback, item.content_id, onLike, close]);

  const handleDelete = useCallback(() => {
    if (!onDelete) {
      close();
      return;
    }

    Alert.alert('Delete Content', 'Are you sure you want to delete this content?', [
      { text: 'Cancel', style: 'cancel', onPress: close },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          executeWithFeedback('delete', () => onDelete(item.content_id), close);
        },
      },
    ]);
  }, [executeWithFeedback, item.content_id, onDelete, close]);

  const handlePress = (content: UserContentWithDetails) => {
    if (isLeftOpen || isRightOpen) {
      close();
      return;
    }
    onPress?.(content);
  };

  // Dynamic styles based on action state
  const leftLikeStyles =
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
  const leftReopenStyles =
    actionCompleted === 'reopen'
      ? {
          bg: ACTION_STYLES.reopen.success.container,
          icon: ACTION_STYLES.reopen.success.icon,
          text: ACTION_STYLES.reopen.success.text,
          label: ACTION_STYLES.reopen.success.label,
        }
      : {
          bg: ACTION_STYLES.reopen.default.container,
          icon: ACTION_STYLES.reopen.default.icon,
          text: ACTION_STYLES.reopen.default.text,
          label: ACTION_STYLES.reopen.default.label,
        };
  const rightStyles =
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

  const AnimatedViewTyped = Animated.View as any;

  return (
    <View className="relative">
      {/* Left Background - Reopen (Blue) - Only visible when swiping right */}
      <AnimatedViewTyped
        className="absolute left-0 top-0 overflow-hidden rounded-l-xl"
        style={[leftContainerStyle, { width: ARCHIVE_TAB_LEFT_ACTION_WIDTH }]}>
        <View
          className="flex-row items-stretch"
          style={{ width: ARCHIVE_TAB_LEFT_ACTION_WIDTH, height: '100%' }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLike}
            disabled={isProcessing}
            className={`items-center justify-center ${leftLikeStyles.bg}`}
            style={{ width: SWIPE_ACTION_BUTTON_WIDTH }}>
            <AnimatedViewTyped style={leftIconStyle}>
              <Icon
                as={Heart}
                className={`h-6 w-6 ${leftLikeStyles.icon}`}
                fill={isLiked ? 'currentColor' : 'none'}
              />
            </AnimatedViewTyped>
            <Text className={`mt-1 text-xs font-semibold ${leftLikeStyles.text}`}>
              {leftLikeStyles.label}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleReopen}
            disabled={isProcessing}
            className={`items-center justify-center ${leftReopenStyles.bg}`}
            style={{ width: SWIPE_ACTION_BUTTON_WIDTH }}>
            <AnimatedViewTyped style={leftIconStyle}>
              <Icon
                as={actionCompleted === 'reopen' ? Circle : RotateCcw}
                className={`h-6 w-6 ${leftReopenStyles.icon}`}
              />
            </AnimatedViewTyped>
            <Text className={`mt-1 text-xs font-semibold ${leftReopenStyles.text}`}>
              {leftReopenStyles.label}
            </Text>
          </TouchableOpacity>
        </View>
      </AnimatedViewTyped>

      {/* Right Background - Delete (Red) - Only visible when swiping left */}
      <AnimatedViewTyped
        className={`absolute right-0 top-0 overflow-hidden rounded-r-xl ${rightStyles.bg}`}
        style={[rightContainerStyle, { width: ARCHIVE_TAB_RIGHT_ACTION_WIDTH }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDelete}
          disabled={isProcessing}
          className="items-center justify-center"
          style={{ width: ARCHIVE_TAB_RIGHT_ACTION_WIDTH, height: '100%' }}>
          <AnimatedViewTyped style={rightIconStyle}>
            <Icon
              as={actionCompleted === 'delete' ? X : Trash2}
              className={`h-6 w-6 ${rightStyles.icon}`}
            />
          </AnimatedViewTyped>
          <Text className={`mt-1 text-xs font-semibold ${rightStyles.text}`}>
            {rightStyles.label}
          </Text>
        </TouchableOpacity>
      </AnimatedViewTyped>

      {/* Swipeable Content */}
      <GestureDetector gesture={panGesture}>
        <AnimatedViewTyped
          className="bg-transparent"
          style={animatedStyle}
          onLayout={(e: any) => {
            itemHeight.value = e.nativeEvent.layout.height;
          }}>
          <ArchiveCard item={item} isFirstOfDay={isFirstOfDay} onPress={handlePress} />
        </AnimatedViewTyped>
      </GestureDetector>
    </View>
  );
}
