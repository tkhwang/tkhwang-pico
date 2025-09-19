import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import {
  ExternalLink,
  CheckCircle,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Heart,
} from 'lucide-react-native';
import { MODAL_ACTION_STYLES, ACTION_STYLES } from '@/consts/app-styles';

interface ContentDetailBottomActionsProps {
  mode: 'home' | 'recommend';
  isCompleted: boolean;
  isLiked: boolean;
  sheetPaddingBottom: number;
  // Action handlers
  onToggleComplete: () => void | Promise<void>;
  onLike: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  onOpenURL: () => void | Promise<void>;
  onAddToQueue?: () => void | Promise<void>;
  onNotInterested?: () => void | Promise<void>;
}

export function ContentDetailBottomActions({
  mode,
  isCompleted,
  isLiked,
  sheetPaddingBottom,
  onToggleComplete,
  onLike,
  onDelete,
  onOpenURL,
  onAddToQueue,
  onNotInterested,
}: ContentDetailBottomActionsProps) {
  const isRecommendation = mode === 'recommend';
  const completeStyles = isCompleted
    ? MODAL_ACTION_STYLES.complete.completed
    : MODAL_ACTION_STYLES.complete.pending;

  const likeStyles = isLiked ? MODAL_ACTION_STYLES.like.liked : MODAL_ACTION_STYLES.like.unliked;

  return (
    <View
      className="border-t border-gray-200 bg-white px-4 pt-2 dark:border-gray-700 dark:bg-gray-800"
      style={{ paddingBottom: sheetPaddingBottom }}>
      <View className="flex-row gap-2">
        {isRecommendation ? (
          <>
            {/* Add to Queue Button */}
            <TouchableOpacity
              onPress={onAddToQueue}
              className={`flex-1 items-center justify-center rounded-lg px-2 py-3 ${MODAL_ACTION_STYLES.addToQueue.container}`}>
              <Icon
                as={ThumbsUp}
                className={`mb-1 h-5 w-5 ${MODAL_ACTION_STYLES.addToQueue.icon}`}
              />
              <Text className={`text-xs font-semibold ${MODAL_ACTION_STYLES.addToQueue.text}`}>
                Add to Queue
              </Text>
            </TouchableOpacity>

            {/* Open in Browser Button */}
            <TouchableOpacity
              onPress={onOpenURL}
              className={`flex-1 items-center justify-center rounded-lg px-2 py-3 ${MODAL_ACTION_STYLES.open.container}`}>
              <Icon as={ExternalLink} className={`mb-1 h-5 w-5 ${MODAL_ACTION_STYLES.open.icon}`} />
              <Text className={`text-xs font-semibold ${MODAL_ACTION_STYLES.open.text}`}>Open</Text>
            </TouchableOpacity>

            {/* Not Interested Button */}
            <TouchableOpacity
              onPress={onNotInterested}
              className={`flex-1 items-center justify-center rounded-lg px-2 py-3 ${MODAL_ACTION_STYLES.notInterested.container}`}>
              <Icon
                as={ThumbsDown}
                className={`mb-1 h-5 w-5 ${MODAL_ACTION_STYLES.notInterested.icon}`}
              />
              <Text className={`text-xs font-semibold ${MODAL_ACTION_STYLES.notInterested.text}`}>
                Not Interested
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Like Button */}
            <TouchableOpacity
              onPress={onLike}
              className={`flex-1 items-center justify-center rounded-lg px-2 py-3 ${likeStyles.container}`}>
              <Icon
                as={Heart}
                className={`mb-1 h-5 w-5 ${likeStyles.icon}`}
                fill={isLiked ? 'currentColor' : 'none'}
              />
              <Text className={`text-xs font-semibold ${likeStyles.text}`}>
                {isLiked ? 'Unlike' : 'Like'}
              </Text>
            </TouchableOpacity>

            {/* Toggle Complete Button */}
            <TouchableOpacity
              onPress={onToggleComplete}
              className={`flex-1 items-center justify-center rounded-lg px-2 py-3 ${completeStyles.container}`}>
              <Icon
                as={isCompleted ? RotateCcw : CheckCircle}
                className={`mb-1 h-5 w-5 ${completeStyles.icon}`}
              />
              <Text className={`text-xs font-semibold ${completeStyles.text}`}>
                {isCompleted
                  ? ACTION_STYLES.complete.completed.label
                  : ACTION_STYLES.complete.pending.label}
              </Text>
            </TouchableOpacity>

            {/* Open in Browser Button */}
            <TouchableOpacity
              onPress={onOpenURL}
              className={`flex-1 items-center justify-center rounded-lg px-2 py-3 ${MODAL_ACTION_STYLES.open.container}`}>
              <Icon as={ExternalLink} className={`mb-1 h-5 w-5 ${MODAL_ACTION_STYLES.open.icon}`} />
              <Text className={`text-xs font-semibold ${MODAL_ACTION_STYLES.open.text}`}>Open</Text>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              onPress={onDelete}
              className={`flex-1 items-center justify-center rounded-lg px-2 py-3 ${MODAL_ACTION_STYLES.delete.container}`}>
              <Icon as={Trash2} className={`mb-1 h-5 w-5 ${MODAL_ACTION_STYLES.delete.icon}`} />
              <Text className={`text-xs font-semibold ${MODAL_ACTION_STYLES.delete.text}`}>
                Delete
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
