
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FlashcardCard from "./FlashcardCard";

interface FlashcardStudyCardProps {
  card: { front: string; back: string };
  showBack: boolean;
  setShowBack: (show: boolean) => void;
  reviewButtons: { label: string; grade: string; color: string; xp: number }[];
  onReview: () => void;
  freeReviewMode: boolean;
  onNext: () => void;
  onPrev: () => void;
  onRestart?: () => void;
  onExitFree?: () => void;
  currIndex: number;
  totalCards: number;
  deckName: string;
}

const FlashcardStudyCard: React.FC<FlashcardStudyCardProps> = ({
  card,
  showBack,
  setShowBack,
  onReview,
  freeReviewMode,
  onNext,
  onPrev,
  onRestart,
  onExitFree,
  currIndex,
  totalCards,
  deckName,
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Badge variant="secondary" className="px-3 py-1">
          {(totalCards > 0 ? currIndex + 1 : 0)} / {totalCards}
        </Badge>
        {freeReviewMode && (
          <Badge variant="outline" className="ml-2 text-blue-700 border-blue-400">
            Free Review Mode
          </Badge>
        )}
      </div>
      <Badge variant="outline" className="hidden sm:inline">{deckName}</Badge>
    </div>

    <FlashcardCard
      front={card.front}
      back={card.back}
      showBack={showBack}
      onToggle={() => setShowBack(!showBack)}
    />

    {!showBack && (
      <div className="flex justify-center space-x-2">
        <Button
          className="bg-blue-600 rounded-xl px-4"
          onClick={onReview}
        >
          Reveal Answer
        </Button>
      </div>
    )}

    <div className="flex justify-between">
      <Button
        onClick={onPrev}
        variant="outline"
        className="rounded-xl px-6"
      >
        <ChevronLeft size={16} /> Previous
      </Button>
      <div className="flex gap-2 items-center">
        {freeReviewMode && onRestart && (
          <Button
            variant="outline"
            onClick={() => {
              onRestart();
              setShowBack(false);
            }}
            className="rounded-xl px-6"
          >Restart</Button>
        )}
        <Button
          onClick={onNext}
          variant="outline"
          className="rounded-xl px-6"
        >
          Next <ChevronRight size={16} />
        </Button>
      </div>
    </div>

    {freeReviewMode && onExitFree && (
      <div className="flex justify-center mt-2">
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={onExitFree}
        >
          Exit Free Review
        </Button>
      </div>
    )}
  </div>
);

export default FlashcardStudyCard;
