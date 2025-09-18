import { DEFAULT_HAPTIC_DURATION_MS } from '@/consts/app-consts';
import { useCallback } from 'react';
import { Platform, Vibration } from 'react-native';

export function useHapticFeedback(defaultDuration = DEFAULT_HAPTIC_DURATION_MS) {
  const triggerFeedback = useCallback(
    (duration = defaultDuration) => {
      if (Platform.OS !== 'web') {
        Vibration.vibrate(duration);
      }
    },
    [defaultDuration]
  );

  const executeWithHapticFeedback = useCallback(
    <TResult>(fn: () => TResult, duration?: number): TResult => {
      triggerFeedback(duration);
      return fn();
    },
    [triggerFeedback]
  );

  return {
    triggerFeedback,
    executeWithHapticFeedback,
  };
}
