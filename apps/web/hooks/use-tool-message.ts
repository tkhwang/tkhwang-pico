import { useRef, useMemo } from "react";

/**
 * Hook for generating tool status messages with optional elapsed time tracking
 * @param name - Tool name
 * @param status - Tool status ("inProgress", "executing", "complete", etc.)
 * @param showElapsedSec - Whether to show elapsed time in seconds
 * @returns Formatted message string
 */
export function useToolMessage(
  name: string,
  status: string,
  showElapsedSec = false
): string {
  const startTimeRef = useRef<number>(Date.now());

  const message = useMemo(() => {
    if (status !== "complete") {
      return `Using ${name}...`;
    }

    if (showElapsedSec) {
      const elapsedMs = Date.now() - startTimeRef.current;
      const elapsedSec = (elapsedMs / 1000).toFixed(1);
      return `Used ${name} for ${elapsedSec}s`;
    }

    return `Used ${name}`;
  }, [name, status, showElapsedSec]);

  return message;
}
