
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

  // Logging helpers for debugging
  const log = (...args: any[]) => {
    // Uncomment to debug:
    // console.log("[useAutoFlipTimer]", ...args);
  };

  // Always clear timer (helper)
  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      log("Cleared timer");
      intervalRef.current = null;
    }
  }, []);

  // Start timer, always cleans up previous first
  const startTimer = useCallback(() => {
    log("startTimer called. enabled:", enabled, "duration:", duration);

    clearTimer();
    setSecondsLeft(duration);

    if (!enabled) {
      log("Timer not enabled, not starting.");
      return;
    }

    let count = duration;
    setSecondsLeft(count);

    intervalRef.current = setInterval(() => {
      count -= 1;
      setSecondsLeft(count);
      log("Tick:", count);

      if (count <= 0) {
        clearTimer();
        log("Timer elapsed, calling onElapsed");
        onElapsed();
      }
    }, 1000);

    log("Timer started.");
  }, [enabled, duration, onElapsed, clearTimer]);

  // Recreate timer whenever the deps change (card, interval, etc)
  useEffect(() => {
    startTimer();
    return clearTimer;
    // eslint-disable-next-line
  }, [startTimer, ...resetDeps]);

  // Manual timer reset for navigation
  const resetTimer = useCallback(() => {
    log("Manual resetTimer called.");
    startTimer();
  }, [startTimer]);

  return [secondsLeft, resetTimer];
}
