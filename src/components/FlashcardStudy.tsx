
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { scheduleAnki, SchedulerState, ReviewGrade } from "@/utils/ankiScheduler";
import { useGamification } from "@/contexts/GamificationContext";

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

  // Filter due cards now
  const now = new Date();
  // Only show due cards
  const initialDue = flashcards.filter(fc => new Date(fc.nextReview) <= now);
  // Session queue: holds the indices of cards still to review this round
  const [queue, setQueue] = useState(initialDue.map((_, i) => i));
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  // Track which indices should repeat (e.g. hard)
  const [repeatQueue, setRepeatQueue] = useState<number[]>([]);

  // If no cards due OR emptied queue
  if (queue.length === 0 && repeatQueue.length === 0)
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">All done for now!</h2>
        <Badge variant="secondary">{deckName}</Badge>
        <Button className="mt-6" onClick={onClose}>Back to Decks</Button>
      </div>
    );
  
  // If current queue empty but has repeat: go again
  React.useEffect(() => {
    if (queue.length === 0 && repeatQueue.length > 0) {
      setQueue(repeatQueue);
      setRepeatQueue([]);
      setIndex(0);
    }
    // eslint-disable-next-line
  }, [queue, repeatQueue]);

  // Session cards: include all due cards, or just repeat cards
  const dueCards = initialDue;
  // Defensive (should always be safe as we never show unless queue.length > 0)
  const currIdx = queue.length > 0 ? queue[index] : 0;
  const card = dueCards[currIdx];

  // Assign XP activity label
  const getDiffLabel = (grade: ReviewGrade) => {
    if (grade === "again") return "hard";
    if (grade === "hard") return "hard";
    if (grade === "good") return "medium";
    if (grade === "easy") return "easy";
    return "medium";
  };

  const review = (grade: ReviewGrade) => {
    // Logic for XP
    let xp = GRADE_XP[grade];
    reviewFlashcard(getDiffLabel(grade)); // Sends to gamification
    if (xp > 0) showNotification(`+${xp} XP (flashcards)`);

    // Schedule next review
    const newState = scheduleAnki(card.state, grade);
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newState.interval);

    onUpdateCard(card.id, {
      state: newState,
      nextReview: nextReview.toISOString(),
    });

    // Add "Hard"-marked cards to re-review at end of session *before* finishing
    if (grade === "hard") {
      setRepeatQueue(old => [...old, currIdx]);
    }

    setShowBack(false);

    // Next in queue or wrap
    if (index < queue.length - 1) setIndex(i => i + 1);
    else setQueue(q => q.filter((_, idx) => idx !== index)); // Remove just-finished card from queue
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

      <Card
        className="h-96 flex cursor-pointer shadow-2xl border-0 bg-gradient-to-br from-purple-50 to-blue-50 items-center justify-center"
        onClick={() => setShowBack(b => !b)}
      >
        <CardContent className="h-full flex items-center justify-center p-8 w-full">
          <div className="w-full text-center">
            <Badge variant={showBack ? "secondary" : "default"} className="mb-4">
              {showBack ? "Answer" : "Question"}
            </Badge>
            <div className="text-lg leading-relaxed">
              {showBack ? card.back : card.front}
            </div>
            {!showBack && (
              <p className="text-sm mt-6 text-gray-500">Tap to reveal answer</p>
            )}
          </div>
        </CardContent>
      </Card>

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
          onClick={() => setIndex(index === 0 ? queue.length - 1 : index - 1)}
          variant="outline"
          className="rounded-xl px-6"
          disabled={queue.length === 0}
        >
          <ChevronLeft size={16} /> Previous
        </Button>
        <Button
          onClick={() => setIndex((index + 1) % queue.length)}
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

