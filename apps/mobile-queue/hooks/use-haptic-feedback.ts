import { DEFAULT_HAPTIC_DURATION_MS } from '@/consts/app-consts';
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Platform } from 'react-native';

export function useHapticFeedback(defaultDuration = DEFAULT_HAPTIC_DURATION_MS) {
  const triggerFeedback = useCallback(
    async (duration = defaultDuration) => {
      if (Platform.OS === 'web') return;

      // Use expo-haptics for better cross-platform support
      // For short durations (< 100ms), use light impact
      // For medium durations (100-200ms), use medium impact
      // For longer durations (> 200ms), use heavy impact
      let impactStyle: Haptics.ImpactFeedbackStyle;

      if (duration < 100) {
        impactStyle = Haptics.ImpactFeedbackStyle.Light;
      } else if (duration <= 200) {
        impactStyle = Haptics.ImpactFeedbackStyle.Medium;
      } else {
        impactStyle = Haptics.ImpactFeedbackStyle.Heavy;
      }

      try {
        await Haptics.impactAsync(impactStyle);
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
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
