
import { useState } from "react";
import { Flashcard } from "@/components/FlashcardStudy";

/**
 * A queue for free review mode that cycles through all card indices.
 * User can "restart" at any time.
 */
export function useFreeReviewQueue(flashcards: Flashcard[]) {
  const [index, setIndex] = useState(0);
  const total = flashcards.length;
  const currIdx = total === 0 ? 0 : index;
  const isDone = total === 0 ? true : false;

  function next() {
    setIndex((i) => (i + 1) % (total || 1));
  }
  function prev() {
    setIndex((i) => (i === 0 ? (total - 1) : i - 1));
  }
  function restart() {
    setIndex(0);
  }

  return {
    currIdx,
    index,
    count: total,
    isDone,
    next,
    prev,
    restart
  };
}
