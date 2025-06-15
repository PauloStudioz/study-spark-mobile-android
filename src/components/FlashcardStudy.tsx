import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { scheduleAnki, SchedulerState, ReviewGrade } from "@/utils/ankiScheduler";
import { useGamification } from "@/contexts/GamificationContext";
import FlashcardCard from "./FlashcardCard";
import { useFlashcardQueue } from "./hooks/useFlashcardQueue";
import { useFreeReviewQueue } from "./hooks/useFreeReviewQueue";

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
  const [freeReviewMode, setFreeReviewMode] = useState(false);
  const [showBack, setShowBack] = useState(false);

  // Regular due cards
  const now = new Date();
  const dueCards = flashcards.filter(fc => new Date(fc.nextReview) <= now);

  // Use correct queue logic for mode
  const regularQueue = useFlashcardQueue(dueCards);
  const freeQueue = useFreeReviewQueue(flashcards);

  // What queue/state do we use?
  const isEmptyDeck = flashcards.length === 0;
  const isRegularDone = !freeReviewMode && (dueCards.length === 0 || regularQueue.isDone);
  const isFreeReview = freeReviewMode;
  const freeHasCards = flashcards.length > 0;

  // Pick the correct card/set
  const card = freeReviewMode
    ? flashcards[freeQueue.currIdx] || flashcards[0]
    : dueCards[regularQueue.currIdx] || dueCards[0];

  const totalCards = freeReviewMode ? flashcards.length : dueCards.length;
  const currIndex = freeReviewMode ? freeQueue.index : regularQueue.index;
  
  // Handle "empty deck" case
  if (isEmptyDeck) {
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
        <div className="text-gray-600">Check back later or review all cards.</div>
        <div className="flex flex-col gap-3 items-center mt-4">
          <Button className="bg-blue-600 rounded-xl" onClick={() => { setFreeReviewMode(true); setShowBack(false); }}>
            Review All Cards
          </Button>
          <Button variant="outline" className="mt-2 rounded-xl" onClick={onClose}>Back to Decks</Button>
        </div>
      </div>
    );
  }

  // Regular review, all done, prompt user to go into free review mode
  if (!freeReviewMode && regularQueue.isDone) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">All done for now!</h2>
        <Badge variant="secondary">{deckName}</Badge>
        <div className="flex flex-col gap-3 items-center mt-4">
          <Button
            className="bg-purple-600 rounded-xl"
            onClick={() => { setFreeReviewMode(true); setShowBack(false); }}
          >
            Review All Cards
          </Button>
          <Button variant="outline" className="mt-2 rounded-xl" onClick={onClose}>Back to Decks</Button>
        </div>
      </div>
    );
  }

  // Free review mode, all cards - allow endless cycle, restart puts you back at first card
  // (We hide this message, as all navigation is now looped, so user never "finishes", can keep going)
  // Instead, we always show the controls.

  const getDiffLabel = (grade: ReviewGrade) => {
    if (grade === "again") return "hard";
    if (grade === "hard") return "hard";
    if (grade === "good") return "medium";
    if (grade === "easy") return "easy";
    return "medium";
  };

  const review = (grade: ReviewGrade) => {
    if (freeReviewMode) {
      setShowBack(false);
      freeQueue.next();
      return;
    }
    let xp = GRADE_XP[grade];
    reviewFlashcard(getDiffLabel(grade));
    if (xp > 0) showNotification(`+${xp} XP (flashcards)`);
    const newState = scheduleAnki(card.state, grade);
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newState.interval);

    onUpdateCard(card.id, {
      state: newState,
      nextReview: nextReview.toISOString(),
    });

    if (grade === "hard") {
      regularQueue.addRepeat(regularQueue.currIdx);
    }
    setShowBack(false);
    regularQueue.removeCurrentFromQueue();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={onClose} variant="outline" className="rounded-xl">
          <ChevronLeft size={16} /> Back to Decks
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            {(totalCards > 0 ? currIndex + 1 : 0)} / {totalCards}
          </Badge>
          {freeReviewMode && (
            <Badge variant="outline" className="ml-2 text-blue-700 border-blue-400">
              Free Review Mode
            </Badge>
          )}
        </div>
      </div>

      {/* Always show card */}
      <FlashcardCard
        front={card.front}
        back={card.back}
        showBack={showBack}
        onToggle={() => setShowBack(b => !b)}
      />

      {/* Review/answer buttons */}
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
          onClick={freeReviewMode ? freeQueue.prev : regularQueue.prev}
          variant="outline"
          className="rounded-xl px-6"
        >
          <ChevronLeft size={16} /> Previous
        </Button>
        <div className="flex gap-2 items-center">
          {freeReviewMode && (
            <Button
              variant="outline"
              onClick={() => { freeQueue.restart(); setShowBack(false); }}
              className="rounded-xl px-6"
            >Restart</Button>
          )}
          <Button
            onClick={freeReviewMode ? freeQueue.next : regularQueue.next}
            variant="outline"
            className="rounded-xl px-6"
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Exit button for free review */}
      {freeReviewMode && (
        <div className="flex justify-center mt-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => setFreeReviewMode(false)}
          >
            Exit Free Review
          </Button>
        </div>
      )}
    </div>
  );
};

export default FlashcardStudy;
