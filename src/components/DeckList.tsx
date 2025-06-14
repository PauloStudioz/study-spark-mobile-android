
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { Flashcard } from "./FlashcardStudy";

interface Deck {
  id: string;
  name: string;
  cards: Flashcard[];
}

interface DeckListProps {
  decks: Deck[];
  onDeleteDeck: (id: string) => void;
  onEditDeck: (id: string) => void;
  onStudyDeck: (id: string) => void;
}

const DeckList: React.FC<DeckListProps> = ({
  decks,
  onDeleteDeck,
  onEditDeck,
  onStudyDeck,
}) => {
  return (
    <div className="space-y-4">
      {decks.map((deck) => (
        <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" key={deck.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {deck.name}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{deck.cards.length} cards</span>
                  <Badge variant="outline" className="text-xs">
                    Due: {deck.cards.filter(card => new Date(card.nextReview) <= new Date()).length}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => onStudyDeck(deck.id)}
                  disabled={deck.cards.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Study
                </Button>
                <Button
                  onClick={() => onEditDeck(deck.id)}
                  variant="outline"
                  className="rounded-xl"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => onDeleteDeck(deck.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-700 rounded-xl"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DeckList;
