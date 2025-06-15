
import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Controls a countdown timer for auto-flipping flashcards.
 * Returns [secondsLeft, triggerFlip, resetTimer]
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

  // When timer should start/restart
  useEffect(() => {
    if (!enabled) {
      setSecondsLeft(duration);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    setSecondsLeft(duration);
    let tick = 0;
    intervalRef.current = setInterval(() => {
      tick += 1;
      setSecondsLeft(duration - tick);
      if (tick >= duration) {
        onElapsed();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line
  }, [enabled, duration, onElapsed, ...resetDeps]);

  // Manual reset (e.g. when card changes)
  const resetTimer = useCallback(() => {
    setSecondsLeft(duration);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!enabled) return;
    let tick = 0;
    intervalRef.current = setInterval(() => {
      tick += 1;
      setSecondsLeft(duration - tick);
      if (tick >= duration) {
        onElapsed();
      }
    }, 1000);
  }, [duration, enabled, onElapsed]);

  return [secondsLeft, resetTimer];
}
