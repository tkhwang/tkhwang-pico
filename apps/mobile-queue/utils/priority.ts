import { Constants, type Enums } from '@tkhwang-pico/supabase';

export type PriorityValue = Enums<'content_priority'>;

export const PRIORITY_VALUES = Constants.public.Enums.content_priority as readonly PriorityValue[];

export const DEFAULT_PRIORITY: PriorityValue = (PRIORITY_VALUES.find(
  (value) => value === 'normal',
) ??
  PRIORITY_VALUES[0] ??
  'normal') as PriorityValue;

export const PRIORITY_LABELS = PRIORITY_VALUES.reduce<Record<PriorityValue, string>>(
  (acc, value) => {
    acc[value] = value.charAt(0).toUpperCase() + value.slice(1);
    return acc;
  },
  {} as Record<PriorityValue, string>,
);
