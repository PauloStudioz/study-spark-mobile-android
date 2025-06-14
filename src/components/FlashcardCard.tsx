
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FlashcardCardProps {
  front: string;
  back: string;
  showBack: boolean;
  onToggle: () => void;
}

const FlashcardCard: React.FC<FlashcardCardProps> = ({ front, back, showBack, onToggle }) => (
  <Card
    className="h-96 flex cursor-pointer shadow-2xl border-0 bg-gradient-to-br from-purple-50 to-blue-50 items-center justify-center"
    onClick={onToggle}
  >
    <CardContent className="h-full flex items-center justify-center p-8 w-full">
      <div className="w-full text-center">
        <Badge variant={showBack ? "secondary" : "default"} className="mb-4">
          {showBack ? "Answer" : "Question"}
        </Badge>
        <div className="text-lg leading-relaxed">
          {showBack ? back : front}
        </div>
        {!showBack && (
          <p className="text-sm mt-6 text-gray-500">Tap to reveal answer</p>
        )}
      </div>
    </CardContent>
  </Card>
);

export default FlashcardCard;
