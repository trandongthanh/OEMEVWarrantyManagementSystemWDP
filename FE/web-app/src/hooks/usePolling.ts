import { useEffect, useRef, useCallback } from "react";

interface UsePollingOptions {
  interval?: number; // in milliseconds, default 5000 (5 seconds)
  enabled?: boolean; // whether polling is active, default true
  immediate?: boolean; // whether to fetch immediately on start, default false
  onError?: (error: Error) => void;
}

/**
 * Custom hook for polling data at regular intervals
 * @param fetchFn - Async function to fetch data
 * @param options - Polling configuration options
 *
 * @example
 * ```tsx
 * const { data, isPolling, startPolling, stopPolling } = usePolling(
 *   () => fetchAssignedRecords(),
 *   { interval: 10000, enabled: true }
 * );
 * ```
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  options: UsePollingOptions = {}
) {
  const {
    interval = 5000,
    enabled = true,
    immediate = false,
    onError,
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const poll = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      await fetchFn();
    } catch (error) {
      console.error("Polling error:", error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [fetchFn, onError]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return; // Already polling

    // Initial fetch only if immediate is true
    if (immediate) {
      poll();
    }

    // Set up interval
    intervalRef.current = setInterval(() => {
      poll();
    }, interval);
  }, [poll, interval, immediate]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      startPolling();
    }

    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling]);

  return {
    isPolling: intervalRef.current !== null,
    startPolling,
    stopPolling,
  };
}
