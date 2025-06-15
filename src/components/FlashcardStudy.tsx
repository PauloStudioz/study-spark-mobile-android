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

  const {
    queue, index, setIndex, repeatQueue, isDone,
    currIdx, addRepeat, removeCurrentFromQueue, next, prev
  } = useFlashcardQueue(flashcards);

  const dueCards = flashcards.filter(fc => new Date(fc.nextReview) <= new Date());
  const card = dueCards[currIdx] || dueCards[0];
  const [showBack, setShowBack] = useState(false);

  // Handle case when no due cards are available
  if (dueCards.length === 0) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">No cards available for review 🎉</h2>
        <Badge variant="secondary">{deckName}</Badge>
        <div className="text-gray-600">Check back later or add more cards to this deck.</div>
        <Button className="mt-6" onClick={onClose}>Back to Decks</Button>
      </div>
    );
  }

  if (isDone)
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">All done for now!</h2>
        <Badge variant="secondary">{deckName}</Badge>
        <Button className="mt-6" onClick={onClose}>Back to Decks</Button>
      </div>
    );

  const getDiffLabel = (grade: ReviewGrade) => {
    if (grade === "again") return "hard";
    if (grade === "hard") return "hard";
    if (grade === "good") return "medium";
    if (grade === "easy") return "easy";
    return "medium";
  };

  const review = (grade: ReviewGrade) => {
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
        <Badge variant="secondary" className="px-3 py-1">
          {queue.length > 0 ? index + 1 : 0} / {queue.length}
        </Badge>
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
              {btn.label} {btn.xp > 0 && (
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
