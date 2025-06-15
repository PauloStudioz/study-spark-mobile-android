
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
    className="h-96 flex cursor-pointer shadow-2xl border-0 bg-gradient-to-br from-purple-50 to-blue-50 items-center justify-center transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl"
    onClick={onToggle}
  >
    <CardContent className="h-full flex items-center justify-center p-8 w-full">
      <div className="w-full text-center">
        <Badge 
          variant={showBack ? "secondary" : "default"} 
          className={`mb-4 transition-all duration-300 ${showBack ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
        >
          {showBack ? "Answer" : "Question"}
        </Badge>
        <div className={`text-lg leading-relaxed transition-all duration-500 ${showBack ? 'animate-fade-in' : 'animate-fade-in'}`}>
          {showBack ? back : front}
        </div>
        {!showBack && (
          <p className="text-sm mt-6 text-gray-500 animate-pulse">Tap to reveal answer</p>
        )}
      </div>
    </CardContent>
  </Card>
);

export default FlashcardCard;
