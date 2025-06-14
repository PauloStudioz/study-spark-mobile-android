
import { useState, useEffect } from "react";
import { Flashcard } from "@/components/FlashcardStudy";
import { ReviewGrade } from "@/utils/ankiScheduler";

export function useFlashcardQueue(flashcards: Flashcard[]) {
  const now = new Date();
  const initialDue = flashcards.filter(fc => new Date(fc.nextReview) <= now);

  const [queue, setQueue] = useState(initialDue.map((_, i) => i));
  const [index, setIndex] = useState(0);
  const [repeatQueue, setRepeatQueue] = useState<number[]>([]);

  useEffect(() => {
    if (queue.length === 0 && repeatQueue.length > 0) {
      setQueue(repeatQueue);
      setRepeatQueue([]);
      setIndex(0);
    }
    // eslint-disable-next-line
  }, [queue, repeatQueue]);

  const currIdx = queue.length > 0 ? queue[index] : 0;
  const isDone = queue.length === 0 && repeatQueue.length === 0;

  function addRepeat(idx: number) {
    setRepeatQueue(old => [...old, idx]);
  }

  function removeCurrentFromQueue() {
    setQueue(q => q.filter((_, i) => i !== index));
    setIndex(i => (i > 0 ? i - 1 : 0));
  }

  function next() {
    setIndex(i => (i + 1) % (queue.length || 1));
  }

  function prev() {
    setIndex(i => (i === 0 ? (queue.length - 1) : (i - 1)));
  }

  return {
    queue, index, setIndex,
    repeatQueue, setRepeatQueue,
    currIdx, isDone,
    addRepeat,
    removeCurrentFromQueue,
    next, prev
  };
}
