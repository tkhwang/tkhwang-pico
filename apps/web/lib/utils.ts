import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { getConfig } from '@/lib/config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hasEnvVars = (): boolean => {
  try {
    const { supabase } = getConfig();
    return Boolean(supabase.supabaseUrl && supabase.publishableKey);
  } catch {
    return false;
  }
};
