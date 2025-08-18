import { getConfig } from "@/lib/config";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
