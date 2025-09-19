import { DEFAULT_HAPTIC_DURATION_MS } from '@/consts/app-consts';
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Platform, Vibration } from 'react-native';

export function useHapticFeedback(defaultDuration = DEFAULT_HAPTIC_DURATION_MS) {
  const triggerFeedback = useCallback(
    async (duration = defaultDuration) => {
      if (Platform.OS === 'web') return;

      // Use platform-appropriate haptic patterns
      // iOS: Impact styles
      // Android: Notification/selection patterns are often more noticeable
      let impactStyle: Haptics.ImpactFeedbackStyle;

      if (duration < 100) {
        impactStyle = Haptics.ImpactFeedbackStyle.Light;
      } else if (duration <= 200) {
        impactStyle = Haptics.ImpactFeedbackStyle.Medium;
      } else {
        impactStyle = Haptics.ImpactFeedbackStyle.Heavy;
      }

      try {
        if (Platform.OS === 'android') {
          if (duration < 100) {
            await Haptics.selectionAsync();
          } else if (duration <= 200) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        } else {
          await Haptics.impactAsync(impactStyle);
        }
      } catch (error) {
        // Fallback to direct vibration on Android if available
        if (Platform.OS === 'android') {
          const clamped = Math.max(20, Math.min(duration, 60));
          try {
            Vibration.vibrate(clamped);
          } catch {}
        }
      }
    },
    [defaultDuration]
  );

  const executeWithHapticFeedback = useCallback(
    async <TResult>(fn: () => TResult | Promise<TResult>, duration?: number): Promise<TResult> => {
      await triggerFeedback(duration);
      return fn();
    },
    [triggerFeedback]
  );

  return {
    triggerFeedback,
    executeWithHapticFeedback,
  };
}
