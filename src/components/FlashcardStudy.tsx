import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { scheduleAnki, SchedulerState, ReviewGrade } from "@/utils/ankiScheduler";
import { useGamification } from "@/contexts/GamificationContext";
import FlashcardStudyCard from "./FlashcardStudyCard";
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
  hard: 3,
  good: 7,
  easy: 10,
};

const reviewButtons: { label: string; grade: ReviewGrade; color: string; xp: number }[] = [
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

  const getDiffLabel = (grade: ReviewGrade) => {
    if (grade === "hard") return "hard";
    if (grade === "good") return "medium";
    if (grade === "easy") return "easy";
    return "medium";
  };

  // Handle answer grading for either mode
  const review = (grade: ReviewGrade) => {
    if (freeReviewMode) {
      // If "Hard", add card to repeat queue in free review mode:
      if (grade === "hard") {
        freeQueue.addRepeat(freeQueue.currIdx);
      }
      setShowBack(false);

      // If currently on the last card of the main queue and there are cards in the repeatQueue
      if (
        freeQueue.queue.length === 1 &&
        freeQueue.index === 0 &&
        freeQueue.repeatQueue &&
        freeQueue.repeatQueue.length > 0
      ) {
        // Swap to repeat queue and start over with first hard card
        freeQueue.next();
        return;
      }

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
    <div>
      {/* Back navigation always available */}
      <div className="flex mb-3">
        <Button onClick={onClose} variant="outline" className="rounded-xl">
          &larr; Back to Decks
        </Button>
      </div>
      <FlashcardStudyCard
        card={card}
        showBack={showBack}
        setShowBack={setShowBack}
        reviewButtons={reviewButtons}
        onReview={review}
        freeReviewMode={freeReviewMode}
        onNext={freeReviewMode ? freeQueue.next : regularQueue.next}
        onPrev={freeReviewMode ? freeQueue.prev : regularQueue.prev}
        onRestart={freeReviewMode ? () => freeQueue.restart() : undefined}
        onExitFree={freeReviewMode ? () => setFreeReviewMode(false) : undefined}
        currIndex={currIndex}
        totalCards={totalCards}
        deckName={deckName}
      />
    </div>
  );
};

export default FlashcardStudy;
