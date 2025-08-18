import { getConfig } from "@/lib/config";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hasEnvVars = () => {
  const config = getConfig();
  return config.supabase.supabaseUrl && config.supabase.publishableKey;
};
