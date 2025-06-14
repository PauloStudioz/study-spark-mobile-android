
/**
 * Anki-like scheduler for flashcard reviews.
 * Returns { interval (days), ease, repetitions }
 */
export interface SchedulerState {
  interval: number; // next interval in days
  ease: number;     // ease factor: recommended start 2.5
  repetitions: number; // successful reps in a row
}

export type ReviewGrade = "again" | "hard" | "good" | "easy";

export function scheduleAnki(
  state: SchedulerState,
  grade: ReviewGrade
): SchedulerState {
  let { interval, ease, repetitions } = state;

  if (grade === "again") {
    // Reset interval and reps, lower ease slightly
    return {
      interval: 1,
      ease: Math.max(1.3, ease - 0.2),
      repetitions: 0,
    };
  }

  if (grade === "hard") {
    repetitions = Math.max(1, repetitions);
    interval = Math.max(1, Math.round(interval * 1.2));
    ease = Math.max(1.3, ease - 0.15);
  } else if (grade === "good") {
    repetitions++;
    interval = Math.round(interval * ease);
  } else if (grade === "easy") {
    repetitions++;
    interval = Math.round(interval * ease * 1.3);
    ease += 0.15;
  }

  // Clamp minimums/maximums for realistic study
  interval = Math.max(1, interval);
  ease = Math.min(Math.max(ease, 1.3), 3.0);

  return { interval, ease, repetitions };
}
