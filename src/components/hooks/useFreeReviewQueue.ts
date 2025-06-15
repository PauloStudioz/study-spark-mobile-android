import { useState, useEffect, useRef } from "react";
import { Flashcard } from "@/components/FlashcardStudy";

/**
 * A queue for free review mode that cycles through all card indices and can repeat cards (e.g., Hard).
 * User can "restart" at any time.
 */
export function useFreeReviewQueue(flashcards: Flashcard[]) {
  const total = flashcards.length;

  // Main queue of card indices to study in current cycle
  const [queue, setQueue] = useState<number[]>(flashcards.map((_, i) => i));
  const [index, setIndex] = useState(0);

  // Repeat queue holds card indices that should be seen again after finishing current queue
  const [repeatQueue, setRepeatQueue] = useState<number[]>([]);

  // Track when we just swapped to repeats so we can force next/re-render
  const justSwappedRef = useRef(false);

  // On deck change or restart, reset everything
  useEffect(() => {
    setQueue(flashcards.map((_, i) => i));
    setIndex(0);
    setRepeatQueue([]);
    justSwappedRef.current = false;
  }, [flashcards]);

  // When queue is empty but repeatQueue exists, swap them and go to the first repeat card
  useEffect(() => {
    if (queue.length === 0 && repeatQueue.length > 0) {
      setQueue(repeatQueue);
      setRepeatQueue([]);
      setIndex(0);
      justSwappedRef.current = true;
    }
  }, [queue, repeatQueue]);

  // Index within queue (fallback to 0 if empty)
  const currIdx = queue.length > 0 ? queue[index] : 0;
  const isDone = total === 0 || (queue.length === 0 && repeatQueue.length === 0);

  function next() {
    if (queue.length === 0 && repeatQueue.length > 0) {
      // If swapping to repeat queue, ensure we advance to first card instantly
      setQueue(repeatQueue);
      setRepeatQueue([]);
      setIndex(0);
      justSwappedRef.current = false;
      return;
    }
    setIndex(i => {
      if (queue.length === 0) return 0;
      if (i + 1 >= queue.length) {
        return 0;
      }
      return i + 1;
    });
  }

  function prev() {
    setIndex(i => {
      if (queue.length === 0) return 0;
      return i === 0 ? queue.length - 1 : i - 1;
    });
  }

  function restart() {
    setQueue(flashcards.map((_, i) => i));
    setIndex(0);
    setRepeatQueue([]);
    justSwappedRef.current = false;
  }

  // Add a card index to be reviewed again after finishing the current run.
  function addRepeat(cardIdx: number) {
    // Only add if not already in repeat queue for this cycle
    setRepeatQueue(old => (old.includes(cardIdx) ? old : [...old, cardIdx]));
  }

  function removeCurrentFromQueue() {
    setQueue(q => q.filter((_, i) => i !== index));
    setIndex(i => (i > 0 ? i - 1 : 0));
  }

  return {
    currIdx,
    index,
    count: total,
    isDone,
    next,
    prev,
    restart,
    addRepeat,
    removeCurrentFromQueue,
    queue,
    repeatQueue,
  };
}
