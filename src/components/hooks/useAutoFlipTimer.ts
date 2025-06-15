
import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Controls a countdown timer for auto-flipping flashcards.
 * Returns [secondsLeft, resetTimer]
 */
export function useAutoFlipTimer({
  enabled,
  duration,
  onElapsed,
  resetDeps = [],
}: {
  enabled: boolean;
  duration: number;
  onElapsed: () => void;
  resetDeps?: any[]; // Card id, interval, etc.
}): [number, () => void] {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper: Clears any interval
  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Start timer logic (shared by effect and reset)
  const startTimer = useCallback(() => {
    clearTimer();
    setSecondsLeft(duration);
    if (!enabled) return;
    let tick = 0;
    intervalRef.current = setInterval(() => {
      tick += 1;
      setSecondsLeft(duration - tick);
      if (tick >= duration) {
        clearTimer();
        onElapsed();
      }
    }, 1000);
  }, [duration, enabled, onElapsed]);

  // Effect: Start timer when dependencies change
  useEffect(() => {
    startTimer();
    return clearTimer;
    // eslint-disable-next-line
  }, [startTimer, ...resetDeps]);

  // Manual reset (for navigation)
  const resetTimer = useCallback(() => {
    startTimer();
  }, [startTimer]);

  return [secondsLeft, resetTimer];
}
