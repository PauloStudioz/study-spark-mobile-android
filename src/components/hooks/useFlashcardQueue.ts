
// A simple manual queue that cycles through all cards, no anki logic.
import { useState } from "react";
import { Flashcard } from "@/components/FlashcardStudy";

export function useFlashcardQueue(flashcards: Flashcard[]) {
  const [queue, setQueue] = useState(flashcards.map((_, i) => i));
  const [index, setIndex] = useState(0);

  const currIdx = queue.length > 0 ? queue[index] : 0;
  const isDone = queue.length === 0;

  function addRepeat(idx: number) { /* No repeat logic in manual mode */ }
  function removeCurrentFromQueue() {}
  function next() {
    setIndex(i => (i + 1) % (queue.length || 1));
  }
  function prev() {
    setIndex(i => (i === 0 ? (queue.length - 1) : (i - 1)));
  }
  return {
    queue, index, setIndex,
    currIdx, isDone,
    addRepeat,
    removeCurrentFromQueue,
    next, prev
  };
}
