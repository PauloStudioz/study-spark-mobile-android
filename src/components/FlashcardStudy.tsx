
import React, { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FlashcardStudyCard from "./FlashcardStudyCard";
import { useFlashcardQueue } from "./hooks/useFlashcardQueue";
import { useFreeReviewQueue } from "./hooks/useFreeReviewQueue";
import { useHaptics } from "./hooks/useHaptics";
import { useShakeToRestart } from "./hooks/useShakeToRestart";
import { useGamification } from "@/contexts/GamificationContext";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  // Remove state and nextReview, but keep for backward compatibility for now
  state?: any;
  nextReview?: string;
}

interface FlashcardStudyProps {
  deckName: string;
  flashcards: Flashcard[];
  onUpdateCard: (id: string, update: Partial<Flashcard>) => void;
  onClose: () => void;
  onImportFlashcards?: (cards: Flashcard[]) => void;
}

// Review buttons with XP rewards
const reviewButtons = [
  { label: "Hard", grade: "hard", color: "bg-red-600 hover:bg-red-700", xp: 5 },
  { label: "Medium", grade: "medium", color: "bg-yellow-600 hover:bg-yellow-700", xp: 10 },
  { label: "Easy", grade: "easy", color: "bg-green-600 hover:bg-green-700", xp: 15 },
];

const FullscreenIcon = ({ isFS }: { isFS: boolean }) => (
  <span role="img" aria-label={isFS ? "Exit Fullscreen" : "Fullscreen"}>
    {isFS ? "⤢" : "⤢"}
  </span>
);

const FlashcardStudy: React.FC<FlashcardStudyProps> = ({
  deckName,
  flashcards,
  onUpdateCard,
  onClose,
  onImportFlashcards,
}) => {
  const [freeReviewMode, setFreeReviewMode] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { vibrate } = useHaptics();
  const { reviewFlashcard } = useGamification();

  // Shake to restart handler
  useShakeToRestart(
    () => {
      setFreeReviewMode(false);
      setShowBack(false);
    },
    vibrate
  );

  // All cards are availble always since no scheduling now
  const allCards = flashcards;

  // Queues for card modes
  const regularQueue = useFlashcardQueue(allCards);
  const freeQueue = useFreeReviewQueue(allCards);

  const isEmptyDeck = flashcards.length === 0;

  const card = freeReviewMode
    ? flashcards[freeQueue.currIdx] || flashcards[0]
    : allCards[regularQueue.currIdx] || allCards[0];

  const totalCards = freeReviewMode ? flashcards.length : allCards.length;
  const currIndex = freeReviewMode ? freeQueue.index : regularQueue.index;

  // Enhanced card navigation with animation
  const handleNext = useCallback(() => {
    setIsAnimating(true);
    setShowBack(false);
    
    setTimeout(() => {
      if (freeReviewMode) {
        freeQueue.next();
      } else {
        regularQueue.next();
      }
      setIsAnimating(false);
    }, 150);
  }, [freeReviewMode, freeQueue, regularQueue]);

  const handlePrev = useCallback(() => {
    setIsAnimating(true);
    setShowBack(false);
    
    setTimeout(() => {
      if (freeReviewMode) {
        freeQueue.prev();
      } else {
        regularQueue.prev();
      }
      setIsAnimating(false);
    }, 150);
  }, [freeReviewMode, freeQueue, regularQueue]);

  const handleRestart = useCallback(() => {
    setShowBack(false);
    freeQueue.restart();
  }, [freeQueue]);

  const handleExitFree = useCallback(() => {
    setShowBack(false);
    setFreeReviewMode(false);
  }, []);

  // Handle review with XP
  const handleReview = useCallback((difficulty: 'easy' | 'medium' | 'hard') => {
    reviewFlashcard(difficulty);
    vibrate();
    handleNext();
  }, [reviewFlashcard, vibrate, handleNext]);

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

  // Only show free review controls/main UI, ignore all "done" logic
  return (
    <div>
      {/* Fullscreen control only */}
      <div className="flex justify-between mb-3">
        <Button onClick={onClose} variant="outline" className="rounded-xl">
          &larr; Back to Decks
        </Button>
        <div className="flex gap-2">
          <Button
            variant={isFullscreen ? "default" : "outline"}
            className="rounded-xl"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <FullscreenIcon isFS={isFullscreen} />
          </Button>
        </div>
      </div>
      <div className={isFullscreen
        ? "fixed inset-0 bg-white z-50 flex flex-col items-center justify-center transition-all"
        : ""}
      >
        <FlashcardStudyCard
          card={card}
          showBack={showBack}
          setShowBack={setShowBack}
          reviewButtons={reviewButtons}
          onReview={() => setShowBack(true)}
          onReviewWithDifficulty={handleReview}
          freeReviewMode={freeReviewMode}
          onNext={handleNext}
          onPrev={handlePrev}
          onRestart={freeReviewMode ? handleRestart : undefined}
          onExitFree={freeReviewMode ? handleExitFree : undefined}
          currIndex={currIndex}
          totalCards={totalCards}
          deckName={deckName}
          isAnimating={isAnimating}
        />
      </div>
    </div>
  );
};

export default FlashcardStudy;
