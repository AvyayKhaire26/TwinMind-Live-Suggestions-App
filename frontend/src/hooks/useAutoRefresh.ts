import { useEffect, useRef, useState } from 'react';
import { AUTO_REFRESH_INTERVAL_MS } from '../constants';

interface UseAutoRefreshProps {
  isActive: boolean;   // only counts down when recording
  onRefresh: () => void;
}

/** Counts down from 30 and fires onRefresh, then resets. */
export function useAutoRefresh({ isActive, onRefresh }: UseAutoRefreshProps) {
  const [secondsLeft, setSecondsLeft] = useState(AUTO_REFRESH_INTERVAL_MS / 1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSecondsLeft(AUTO_REFRESH_INTERVAL_MS / 1000);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          onRefreshRef.current();
          return AUTO_REFRESH_INTERVAL_MS / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  return { secondsLeft };
}
