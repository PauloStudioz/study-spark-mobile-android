import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { Flashcard } from "./FlashcardStudy";

interface DeckEditorProps {
  deck: {
    id: string;
    name: string;
    cards: Flashcard[];
  };
  onUpdateDeck: (update: { name?: string; cards?: Flashcard[] }) => void;
  onBack: () => void;
}

const DeckEditor: React.FC<DeckEditorProps> = ({ deck, onUpdateDeck, onBack }) => {
  const [newCard, setNewCard] = useState({ front: "", back: "" });

  const handleAddCard = () => {
    if (!newCard.front.trim() || !newCard.back.trim()) return;
    const now = new Date();
    const card: Flashcard = {
      id: Date.now().toString(),
      front: newCard.front,
      back: newCard.back,
    };
    onUpdateDeck({ cards: [...deck.cards, card] });
    setNewCard({ front: "", back: "" });
  };

  const handleEditCard = (id: string, field: "front" | "back", value: string) => {
    onUpdateDeck({
      cards: deck.cards.map(c =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    });
  };

  const handleDeleteCard = (id: string) => {
    onUpdateDeck({
      cards: deck.cards.filter(c => c.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="outline">Editing Deck:</Badge>
        <Input
          value={deck.name}
          onChange={e => onUpdateDeck({ name: e.target.value })}
          className="w-auto min-w-[160px]"
        />
        <Button onClick={onBack} variant="outline" className="ml-auto">Back</Button>
      </div>
      <div className="space-y-2">
        {deck.cards.map(card => (
          <Card key={card.id} className="mb-2">
            <CardContent className="flex items-center gap-4 p-4">
              <Textarea
                rows={2}
                value={card.front}
                onChange={e =>
                  handleEditCard(card.id, "front", e.target.value)
                }
                className="rounded-xl flex-1"
              />
              <Textarea
                rows={2}
                value={card.back}
                onChange={e =>
                  handleEditCard(card.id, "back", e.target.value)
                }
                className="rounded-xl flex-1"
              />
              <Button
                onClick={() => handleDeleteCard(card.id)}
                size="sm"
                variant="outline"
                className="ml-2 text-red-500 hover:text-red-700"
                title="Delete card"
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex items-center gap-4 py-4">
        <Textarea
          rows={2}
          placeholder="Front (Question)"
          value={newCard.front}
          onChange={e =>
            setNewCard(c => ({ ...c, front: e.target.value }))
          }
          className="rounded-xl flex-1"
        />
        <Textarea
          rows={2}
          placeholder="Back (Answer)"
          value={newCard.back}
          onChange={e =>
            setNewCard(c => ({ ...c, back: e.target.value }))
          }
          className="rounded-xl flex-1"
        />
        <Button
          onClick={handleAddCard}
          className="bg-purple-600 hover:bg-purple-700 rounded-xl"
          title="Add Card"
        >
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );
};

export default DeckEditor;
