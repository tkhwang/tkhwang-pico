import { useCallback, useEffect, useRef, useState } from 'react';

import { SWIPE_ACTION_FEEDBACK_DURATION_MS } from '@/consts/app-consts';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';

type SwipeActionType = 'like' | 'complete' | 'delete' | 'queue' | 'notInterested' | 'reopen';

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

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { triggerFeedback } = useHapticFeedback();

  const executeWithFeedback = useCallback(
    async (
      actionType: SwipeActionType,
      onAction: () => void | Promise<void>,
      onComplete: () => void
    ) => {
      if (isProcessing) return;

      setIsProcessing(true);

      // Haptic feedback on mobile
      triggerFeedback();

      try {
        await onAction();

        // Show success only after action completes
        setActionCompleted(actionType);

        // Reset after animation
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
          onComplete();
          setIsProcessing(false);
          setActionCompleted(null);
        }, SWIPE_ACTION_FEEDBACK_DURATION_MS);
      } catch (err) {
        // Ensure UI recovers even on failure
        setIsProcessing(false);
        setActionCompleted(null);
        throw err;
      }
    },
    [isProcessing, triggerFeedback]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    isProcessing,
    actionCompleted,
    executeWithFeedback,
  };
}
