import { useState, useCallback } from 'react';
import { Platform, Vibration } from 'react-native';
import { SWIPE_ACTION_FEEDBACK_DURATION_MS } from '@/consts/app-consts';

/**
 * Hook for managing swipe action feedback with haptic response and visual state
 *
 * @example
 * ```tsx
 * const { isProcessing, actionCompleted, executeWithFeedback } = useSwipeActionFeedback();
 *
 * const handleLikePress = () => {
 *   executeWithFeedback('like',
 *     () => onLike?.(item.content_id),
 *     close
 *   );
 * };
 * ```
 */
export function useSwipeActionFeedback() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionCompleted, setActionCompleted] = useState<string | null>(null);

  const executeWithFeedback = useCallback(
    async (actionType: string, onAction: () => void | Promise<void>, onComplete: () => void) => {
      if (isProcessing) return;

      setIsProcessing(true);

      // Haptic feedback on mobile
      if (Platform.OS !== 'web') {
        Vibration.vibrate(10);
      }

      // Animate success state
      setActionCompleted(actionType);

      // Execute action
      await onAction();

      // Reset after animation
      setTimeout(() => {
        onComplete();
        setIsProcessing(false);
        setActionCompleted(null);
      }, SWIPE_ACTION_FEEDBACK_DURATION_MS);
    },
    [isProcessing]
  );

  return {
    isProcessing,
    actionCompleted,
    executeWithFeedback,
  };
}
