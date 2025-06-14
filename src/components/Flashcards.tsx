
import React, { useEffect, useState } from "react";
import DeckList from "./DeckList";
import DeckEditor from "./DeckEditor";
import FlashcardStudy, { Flashcard } from "./FlashcardStudy";
import { SchedulerState } from "@/utils/ankiScheduler";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface Deck {
  id: string;
  name: string;
  cards: Flashcard[];
}

const defaultDecks: Deck[] = [
  {
    id: "1",
    name: "Sample Deck",
    cards: [
      {
        id: "1",
        front: "What is the capital of France?",
        back: "Paris",
        state: { interval: 1, ease: 2.5, repetitions: 0 },
        nextReview: new Date().toISOString(),
      },
    ],
  },
];

const FLASHCARD_STORAGE_KEY = "studymate-anki-decks-v1";

const loadDecks = (): Deck[] => {
  const val = localStorage.getItem(FLASHCARD_STORAGE_KEY);
  if (val) {
    try {
      const decksFromStorage = JSON.parse(val) as Deck[];
      return decksFromStorage;
    } catch {
      // Fall through
    }
  }
  return defaultDecks;
};

const saveDecks = (decks: Deck[]) => {
  localStorage.setItem(FLASHCARD_STORAGE_KEY, JSON.stringify(decks));
};

const Flashcards: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [editDeckId, setEditDeckId] = useState<string | null>(null);
  const [studyDeckId, setStudyDeckId] = useState<string | null>(null);

  useEffect(() => {
    setDecks(loadDecks());
  }, []);

  useEffect(() => {
    saveDecks(decks);
  }, [decks]);

  const addDeck = () => {
    const name = window.prompt("Deck name?");
    if (!name) return;
    const deck: Deck = {
      id: Date.now().toString(),
      name,
      cards: [],
    };
    setDecks((ds) => [...ds, deck]);
  };

  const deleteDeck = (id: string) => {
    setDecks((ds) => ds.filter(d => d.id !== id));
    if (editDeckId === id) setEditDeckId(null);
    if (studyDeckId === id) setStudyDeckId(null);
  };

  const handleUpdateDeck = (id: string, update: { name?: string; cards?: Flashcard[] }) => {
    setDecks(decks =>
      decks.map(deck =>
        deck.id === id ? { ...deck, ...update } : deck
      )
    );
  };

  // Updating cards during study: (toggle nextReview etc)
  const handleUpdateCard = (deckId: string, cardId: string, update: Partial<Flashcard>) => {
    setDecks(decks =>
      decks.map(deck =>
        deck.id !== deckId
          ? deck
          : {
              ...deck,
              cards: deck.cards.map((card) =>
                card.id === cardId ? { ...card, ...update } : card
              ),
            }
      )
    );
  };

  if (studyDeckId) {
    const deck = decks.find(d => d.id === studyDeckId);
    if (!deck) return null;
    return (
      <FlashcardStudy
        deckName={deck.name}
        flashcards={deck.cards}
        onUpdateCard={(cardId, update) =>
          handleUpdateCard(deck.id, cardId, update)
        }
        onClose={() => setStudyDeckId(null)}
      />
    );
  }

  if (editDeckId) {
    const deck = decks.find(d => d.id === editDeckId);
    if (!deck) return null;
    return (
      <DeckEditor
        deck={deck}
        onUpdateDeck={update => handleUpdateDeck(deck.id, update)}
        onBack={() => setEditDeckId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center text-2xl text-purple-700">
            Flashcards & Spaced Repetition (Anki)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Button
              onClick={addDeck}
              className="bg-purple-600 hover:bg-purple-700 rounded-xl"
            >
              <Plus size={16} className="mr-2" />
              New Deck
            </Button>
          </div>
        </CardContent>
      </Card>
      {decks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No flashcard decks yet</p>
          <Button
            onClick={addDeck}
            className="bg-purple-600 hover:bg-purple-700 rounded-xl"
          >
            Create Your First Deck
          </Button>
        </div>
      )}
      {decks.length > 0 && (
        <DeckList
          decks={decks}
          onDeleteDeck={deleteDeck}
          onEditDeck={setEditDeckId}
          onStudyDeck={setStudyDeckId}
        />
      )}
    </div>
  );
};

export default Flashcards;
