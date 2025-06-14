
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { scheduleAnki, SchedulerState, ReviewGrade } from "@/utils/ankiScheduler";

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

const reviewButtons: { label: string; grade: ReviewGrade; color: string }[] = [
  { label: "Again", grade: "again", color: "bg-red-500" },
  { label: "Hard", grade: "hard", color: "bg-yellow-600" },
  { label: "Good", grade: "good", color: "bg-blue-600" },
  { label: "Easy", grade: "easy", color: "bg-green-600" },
];

const FlashcardStudy: React.FC<FlashcardStudyProps> = ({
  deckName,
  flashcards,
  onUpdateCard,
  onClose,
}) => {
  // Filter due cards
  const now = new Date();
  const dueCards = flashcards.filter(fc => new Date(fc.nextReview) <= now);
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  // If no cards due
  if (dueCards.length === 0)
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">All done for now!</h2>
        <Badge variant="secondary">{deckName}</Badge>
        <Button className="mt-6" onClick={onClose}>Back to Decks</Button>
      </div>
    );

  const card = dueCards[index];

  const review = (grade: ReviewGrade) => {
    const newState = scheduleAnki(card.state, grade);
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newState.interval);
    onUpdateCard(card.id, {
      state: newState,
      nextReview: nextReview.toISOString(),
    });
    setShowBack(false);
    // Show next due card, or loop if at end
    if (index < dueCards.length - 1) setIndex(i => i + 1);
    else setIndex(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={onClose} variant="outline" className="rounded-xl">
          <ChevronLeft size={16} /> Back to Decks
        </Button>
        <Badge variant="secondary" className="px-3 py-1">
          {index + 1} / {dueCards.length}
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
              {btn.label}
            </Button>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button
          onClick={() => setIndex(index === 0 ? dueCards.length - 1 : index - 1)}
          variant="outline"
          className="rounded-xl px-6"
        >
          <ChevronLeft size={16} /> Previous
        </Button>
        <Button
          onClick={() => setIndex((index + 1) % dueCards.length)}
          variant="outline"
          className="rounded-xl px-6"
        >
          Next <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default FlashcardStudy;
