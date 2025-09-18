import { useCallback } from 'react';
import { Platform, Vibration } from 'react-native';

const DEFAULT_HAPTIC_DURATION_MS = 10;

type AnyFn = (...args: unknown[]) => unknown;

type WrapWithHaptics = <T extends AnyFn>(
  fn: T,
  duration?: number
) => (...args: Parameters<T>) => ReturnType<T>;

export function useHapticFeedback(defaultDuration = DEFAULT_HAPTIC_DURATION_MS) {
  const triggerFeedback = useCallback(
    (duration = defaultDuration) => {
      if (Platform.OS !== 'web') {
        Vibration.vibrate(duration);
      }
    },
    [defaultDuration]
  );

  const withHapticFeedback = useCallback<WrapWithHaptics>(
    (fn, duration) => {
      return (...args) => {
        triggerFeedback(duration);
        return fn(...args);
      };
    },
    [triggerFeedback]
  );

  return {
    triggerFeedback,
    withHapticFeedback,
  };
}
