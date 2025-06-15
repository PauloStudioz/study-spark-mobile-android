
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
  onReviewWithDifficulty?: (difficulty: 'easy' | 'medium' | 'hard') => void;
  freeReviewMode: boolean;
  onNext: () => void;
  onPrev: () => void;
  onRestart?: () => void;
  onExitFree?: () => void;
  currIndex: number;
  totalCards: number;
  deckName: string;
  isAnimating?: boolean;
}

const FlashcardStudyCard: React.FC<FlashcardStudyCardProps> = ({
  card,
  showBack,
  setShowBack,
  reviewButtons,
  onReview,
  onReviewWithDifficulty,
  freeReviewMode,
  onNext,
  onPrev,
  onRestart,
  onExitFree,
  currIndex,
  totalCards,
  deckName,
  isAnimating = false,
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

    <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      <FlashcardCard
        front={card.front}
        back={card.back}
        showBack={showBack}
        onToggle={() => setShowBack(!showBack)}
      />
    </div>

    {!showBack && (
      <div className="flex justify-center space-x-2">
        <Button
          className="bg-blue-600 hover:bg-blue-700 rounded-xl px-4 transition-all duration-200 hover:scale-105"
          onClick={onReview}
        >
          Reveal Answer
        </Button>
      </div>
    )}

    {showBack && onReviewWithDifficulty && (
      <div className="space-y-4">
        <div className="text-center text-sm text-gray-600 mb-3">
          How difficult was this card?
        </div>
        <div className="flex justify-center space-x-3">
          {reviewButtons.map((button) => (
            <Button
              key={button.grade}
              className={`${button.color} rounded-xl px-4 py-2 transition-all duration-200 hover:scale-105 hover:shadow-lg`}
              onClick={() => onReviewWithDifficulty(button.grade as 'easy' | 'medium' | 'hard')}
            >
              <div className="text-center">
                <div className="font-medium">{button.label}</div>
                <div className="text-xs opacity-90">+{button.xp} XP</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    )}

    <div className="flex justify-between">
      <Button
        onClick={onPrev}
        variant="outline"
        className="rounded-xl px-6 transition-all duration-200 hover:scale-105"
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
            className="rounded-xl px-6 transition-all duration-200 hover:scale-105"
          >Restart</Button>
        )}
        <Button
          onClick={onNext}
          variant="outline"
          className="rounded-xl px-6 transition-all duration-200 hover:scale-105"
        >
          Next <ChevronRight size={16} />
        </Button>
      </div>
    </div>

    {freeReviewMode && onExitFree && (
      <div className="flex justify-center mt-2">
        <Button
          variant="outline"
          className="rounded-xl transition-all duration-200 hover:scale-105"
          onClick={onExitFree}
        >
          Exit Free Review
        </Button>
      </div>
    )}
  </div>
);

export default FlashcardStudyCard;
