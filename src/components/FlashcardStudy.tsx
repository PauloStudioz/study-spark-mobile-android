import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { scheduleAnki, SchedulerState, ReviewGrade } from "@/utils/ankiScheduler";
import { useGamification } from "@/contexts/GamificationContext";
import FlashcardCard from "./FlashcardCard";
import { useFlashcardQueue } from "./hooks/useFlashcardQueue";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  state: SchedulerState;
  nextReview: string; // ISO String date
}

interface FlashcardStudyProps {
  deckName: string;
  flashcards: Flashcard[];
  onUpdateCard: (id: string, update: Partial<Flashcard>) => void;
  onClose: () => void;
}

// XP by grade (must match GamificationContext as much as possible)
const GRADE_XP: Record<ReviewGrade, number> = {
  again: 0,
  hard: 3,
  good: 7,
  easy: 10,
};

const reviewButtons: { label: string; grade: ReviewGrade; color: string; xp: number }[] = [
  { label: "Again", grade: "again", color: "bg-red-500", xp: GRADE_XP["again"] },
  { label: "Hard", grade: "hard", color: "bg-yellow-600", xp: GRADE_XP["hard"] },
  { label: "Good", grade: "good", color: "bg-blue-600", xp: GRADE_XP["good"] },
  { label: "Easy", grade: "easy", color: "bg-green-600", xp: GRADE_XP["easy"] },
];

const FlashcardStudy: React.FC<FlashcardStudyProps> = ({
  deckName,
  flashcards,
  onUpdateCard,
  onClose,
}) => {
  const { reviewFlashcard, showNotification } = useGamification();

  // New state: is user in "Free Review" mode? (studying all cards)
  const [freeReviewMode, setFreeReviewMode] = useState(false);

  // Select cards depending on mode:
  const now = new Date();
  const dueCards = flashcards.filter(fc => new Date(fc.nextReview) <= now);
  const cardsToStudy = freeReviewMode ? flashcards : dueCards;

  // Always use the queue for the current set of cards
  const {
    queue, index, setIndex, repeatQueue, setRepeatQueue, isDone,
    currIdx, addRepeat, removeCurrentFromQueue, next, prev
  } = useFlashcardQueue(cardsToStudy);

  const card = cardsToStudy[currIdx] || cardsToStudy[0];
  const [showBack, setShowBack] = useState(false);

  // ---- FIX: Free Review mode end - allow restart ----
  const handleRestartFreeReview = () => {
    // Reset queue and index so user can keep going through all cards
    setIndex(0);
    setRepeatQueue([]);
    // By default, useFlashcardQueue will fill initial queue with all indices (see hook code)
    // For the reset to work, we have to simulate a "reset": change freeReviewMode off then back on
    setFreeReviewMode(false);
    setTimeout(() => setFreeReviewMode(true), 0); // quick toggle
    setShowBack(false);
  };

  // Handle case when no cards available at all (empty deck)
  if (flashcards.length === 0) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">No cards in this deck</h2>
        <Badge variant="secondary">{deckName}</Badge>
        <div className="text-gray-600">Add some flashcards to get started.</div>
        <Button className="mt-6" onClick={onClose}>Back to Decks</Button>
      </div>
    );
  }

  // If not in free review, but no cards are due for review
  if (!freeReviewMode && dueCards.length === 0) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">No cards available for review 🎉</h2>
        <Badge variant="secondary">{deckName}</Badge>
        <div className="text-gray-600">Check back later or add more cards to this deck.</div>
        <div className="flex flex-col gap-3 items-center mt-4">
          <Button className="bg-blue-600 rounded-xl" onClick={() => setFreeReviewMode(true)}>
            Review All Cards
          </Button>
          <Button variant="outline" className="mt-2 rounded-xl" onClick={onClose}>Back to Decks</Button>
        </div>
      </div>
    );
  }

  // If not in free review, and we finished all due cards (queue is empty, not in freeReview)
  if (!freeReviewMode && isDone) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">All done for now!</h2>
        <Badge variant="secondary">{deckName}</Badge>
        <div className="flex flex-col gap-3 items-center mt-4">
          <Button
            className="bg-purple-600 rounded-xl"
            onClick={handleRestartFreeReview}
          >
            Restart Reviewing All Cards
          </Button>
          <Button variant="outline" className="mt-2 rounded-xl" onClick={onClose}>Back to Decks</Button>
        </div>
      </div>
    );
  }

  // Free review mode: end message when finished all cards
  if (freeReviewMode && isDone) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">You finished reviewing all cards!</h2>
        <Badge variant="secondary">{deckName}</Badge>
        <Button className="mt-6" onClick={onClose}>Back to Decks</Button>
      </div>
    );
  }

  const getDiffLabel = (grade: ReviewGrade) => {
    if (grade === "again") return "hard";
    if (grade === "hard") return "hard";
    if (grade === "good") return "medium";
    if (grade === "easy") return "easy";
    return "medium";
  };

  const review = (grade: ReviewGrade) => {
    // If in free review mode, don't update scheduler or gamification
    if (freeReviewMode) {
      setShowBack(false);
      removeCurrentFromQueue();
      return;
    }

    let xp = GRADE_XP[grade];
    reviewFlashcard(getDiffLabel(grade));
    if (xp > 0) showNotification(`+${xp} XP (flashcards)`);

    // Schedule next review
    const newState = scheduleAnki(card.state, grade);
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newState.interval);

    onUpdateCard(card.id, {
      state: newState,
      nextReview: nextReview.toISOString(),
    });

    if (grade === "hard") {
      addRepeat(currIdx);
    }
    setShowBack(false);
    removeCurrentFromQueue();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={onClose} variant="outline" className="rounded-xl">
          <ChevronLeft size={16} /> Back to Decks
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            {queue.length > 0 ? index + 1 : 0} / {queue.length}
          </Badge>
          {freeReviewMode && (
            <Badge variant="outline" className="ml-2 text-blue-700 border-blue-400">
              Free Review Mode
            </Badge>
          )}
        </div>
      </div>

      <FlashcardCard
        front={card.front}
        back={card.back}
        showBack={showBack}
        onToggle={() => setShowBack(b => !b)}
      />

      {showBack && (
        <div className="flex justify-center space-x-2">
          {reviewButtons.map(btn => (
            <Button
              key={btn.grade}
              className={btn.color + " rounded-xl px-4"}
              onClick={() => review(btn.grade)}
            >
              {btn.label} {(!freeReviewMode && btn.xp > 0) && (
                <span className="text-xs opacity-70 ml-1">+{btn.xp}XP</span>
              )}
            </Button>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button
          onClick={prev}
          variant="outline"
          className="rounded-xl px-6"
          disabled={queue.length === 0}
        >
          <ChevronLeft size={16} /> Previous
        </Button>
        <Button
          onClick={next}
          variant="outline"
          className="rounded-xl px-6"
          disabled={queue.length === 0}
        >
          Next <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default FlashcardStudy;
