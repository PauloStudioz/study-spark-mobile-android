
import React, { useEffect, useState } from "react";
import DeckList from "./DeckList";
import DeckEditor from "./DeckEditor";
import FlashcardStudy, { Flashcard } from "./FlashcardStudy";
import { SchedulerState } from "@/utils/ankiScheduler";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateFlashcardsFromText } from "@/utils/geminiApi";

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

const GEMINI_KEY_STORAGE = "studymate-gemini-key";

const Flashcards: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [editDeckId, setEditDeckId] = useState<string | null>(null);
  const [studyDeckId, setStudyDeckId] = useState<string | null>(null);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiInput, setAIInput] = useState({ title: "", text: "", deckId: "" });
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [aiError, setAIError] = useState<string | null>(null);

  useEffect(() => {
    setDecks(loadDecks());
    const k = localStorage.getItem(GEMINI_KEY_STORAGE) || "";
    setApiKey(k);
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

  // ==== AI Flashcards creator logic ====
  const openAIDialog = (deckId?: string) => {
    setAIInput({ title: "", text: "", deckId: deckId || "" });
    setShowAIDialog(true);
    setAIError(null);
  };

  const handleSaveAPIKey = () => {
    localStorage.setItem(GEMINI_KEY_STORAGE, apiKey);
    setShowApiDialog(false);
  };

  const handleAIGenerate = async () => {
    setAIError(null);
    if (!aiInput.title.trim() || !aiInput.text.trim()) {
      setAIError("Please provide both a title and content text.");
      return;
    }
    if (!apiKey.trim()) {
      setShowApiDialog(true);
      setAIError("Please enter your Gemini API key first.");
      return;
    }
    setIsGenerating(true);
    try {
      const flashcards = await generateFlashcardsFromText(aiInput.text, apiKey);
      if (!flashcards.length) {
        setAIError("Could not generate flashcards. Try different text.");
        setIsGenerating(false);
        return;
      }

      // Build new cards for the target deck
      const now = new Date();
      const baseState: SchedulerState = { interval: 1, ease: 2.5, repetitions: 0 };
      const newCards: Flashcard[] = flashcards.map((c: any, i: number) => ({
        id: Date.now().toString() + "_" + i,
        front: c.front,
        back: c.back,
        state: baseState,
        nextReview: now.toISOString(),
      }));

      let updatedDecks: Deck[];
      if (aiInput.deckId) {
        updatedDecks = decks.map(deck =>
          deck.id === aiInput.deckId
            ? { ...deck, cards: [...deck.cards, ...newCards] }
            : deck
        );
      } else {
        // Create new deck with the generated cards
        const newDeck: Deck = {
          id: Date.now().toString(),
          name: aiInput.title,
          cards: newCards,
        };
        updatedDecks = [...decks, newDeck];
      }
      setDecks(updatedDecks);
      setShowAIDialog(false);
      setAIInput({ title: "", text: "", deckId: "" });
    } catch (err: any) {
      setAIError(`Failed to generate flashcards: ${err?.message || "Unknown error"}`);
    }
    setIsGenerating(false);
  };
  // ==== end AI Flashcards creator logic ====

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
          <div className="flex justify-center gap-3">
            <Button
              onClick={addDeck}
              className="bg-purple-600 hover:bg-purple-700 rounded-xl"
            >
              <Plus size={16} className="mr-2" />
              New Deck
            </Button>
            <Button
              onClick={() => openAIDialog()}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center"
              title="Generate flashcards from a text or lesson using AI"
            >
              <Sparkles size={16} className="mr-2" />
              AI Flashcards
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* AI Flashcards Creator Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Flashcards Generator</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mb-2">
            <label className="block font-medium">Deck</label>
            <select
              className="w-full border rounded-lg p-2"
              value={aiInput.deckId}
              onChange={e => setAIInput(a => ({ ...a, deckId: e.target.value }))}
            >
              <option value="">New Deck</option>
              {decks.map(deck =>
                <option key={deck.id} value={deck.id}>{deck.name}</option>
              )}
            </select>
            <Input
              value={aiInput.title}
              onChange={e => setAIInput(a => ({ ...a, title: e.target.value }))}
              placeholder="Deck name"
              className="rounded-xl mt-2"
              disabled={!!aiInput.deckId}
            />
            <Textarea
              value={aiInput.text}
              onChange={e => setAIInput(a => ({ ...a, text: e.target.value }))}
              placeholder="Paste lesson or notes here..."
              rows={6}
              className="rounded-xl"
            />
            <div className="text-xs text-gray-500 mt-1">
              Your API key is stored only on your device. 
              <br />
              <a
                className="underline"
                href="https://makersuite.google.com/app/apikey"
                rel="noopener noreferrer"
                target="_blank"
              >Get a Google Gemini API key</a>
            </div>
            {aiError && <div className="text-red-600 text-sm">{aiError}</div>}
          </div>
          <DialogFooter>
            <Button
              onClick={handleAIGenerate}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl"
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Flashcards"}
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => setShowAIDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Gemini API Key prompt dialog */}
      <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gemini API key required</DialogTitle>
          </DialogHeader>
          <div>
            <Input
              type="password"
              placeholder="Gemini API Key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="rounded-xl"
            />
            <div className="text-xs text-gray-500 mt-2">
              Paste your Gemini API key from <a href="https://makersuite.google.com/app/apikey" className="underline" target="_blank" rel="noopener noreferrer">Google AI Studio</a>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="bg-blue-600 hover:bg-blue-700 rounded-xl"
              onClick={handleSaveAPIKey}
            >Save API Key</Button>
            <Button variant="outline" className="rounded-xl" onClick={() => setShowApiDialog(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
