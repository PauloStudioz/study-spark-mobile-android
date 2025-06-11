import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Plus, RotateCcw, ChevronLeft, ChevronRight, Trash2, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateFlashcardsFromText } from '@/utils/geminiApi';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: number; // 0-5 for spaced repetition
  nextReview: Date;
  reviewCount: number;
}

interface Deck {
  id: string;
  name: string;
  cards: Flashcard[];
}

const Flashcards = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [showAIGenerate, setShowAIGenerate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [newCard, setNewCard] = useState({ front: '', back: '' });
  const [newDeckName, setNewDeckName] = useState('');
  const [aiText, setAiText] = useState('');

  useEffect(() => {
    loadDecks();
    loadApiKey();
  }, []);

  const loadApiKey = () => {
    const savedKey = localStorage.getItem('studymate-gemini-key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('studymate-gemini-key', apiKey);
    setShowSettings(false);
  };

  const loadDecks = () => {
    const savedDecks = localStorage.getItem('studymate-decks');
    if (savedDecks) {
      const parsed = JSON.parse(savedDecks);
      // Convert date strings back to Date objects
      const decksWithDates = parsed.map((deck: Deck) => ({
        ...deck,
        cards: deck.cards.map(card => ({
          ...card,
          nextReview: new Date(card.nextReview)
        }))
      }));
      setDecks(decksWithDates);
    } else {
      // Create a sample deck
      const sampleDeck: Deck = {
        id: '1',
        name: 'Sample Deck',
        cards: [
          {
            id: '1',
            front: 'What is the capital of France?',
            back: 'Paris',
            difficulty: 0,
            nextReview: new Date(),
            reviewCount: 0
          },
          {
            id: '2', 
            front: 'What is 2 + 2?',
            back: '4',
            difficulty: 0,
            nextReview: new Date(),
            reviewCount: 0
          }
        ]
      };
      setDecks([sampleDeck]);
      saveDecks([sampleDeck]);
    }
  };

  const saveDecks = (updatedDecks: Deck[]) => {
    localStorage.setItem('studymate-decks', JSON.stringify(updatedDecks));
  };

  const generateAIFlashcards = async () => {
    if (!aiText.trim()) {
      alert('Please provide text content to generate flashcards');
      return;
    }

    if (!apiKey.trim()) {
      alert('Please set your Gemini API key in settings first');
      setShowSettings(true);
      return;
    }

    if (!currentDeck) {
      alert('Please select a deck first');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedCards = await generateFlashcardsFromText(aiText, apiKey);
      
      const newCards = generatedCards.map((card: any, index: number) => ({
        id: `${Date.now()}_${index}`,
        front: card.front,
        back: card.back,
        difficulty: 0,
        nextReview: new Date(),
        reviewCount: 0
      }));

      const updatedDeck = {
        ...currentDeck,
        cards: [...currentDeck.cards, ...newCards]
      };

      const updatedDecks = decks.map(deck => 
        deck.id === currentDeck.id ? updatedDeck : deck
      );

      setDecks(updatedDecks);
      setCurrentDeck(updatedDeck);
      saveDecks(updatedDecks);
      
      setAiText('');
      setShowAIGenerate(false);
      alert(`Generated ${newCards.length} flashcards successfully!`);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('Failed to generate flashcards. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const createDeck = () => {
    if (!newDeckName.trim()) return;

    const newDeck: Deck = {
      id: Date.now().toString(),
      name: newDeckName,
      cards: []
    };

    const updatedDecks = [...decks, newDeck];
    setDecks(updatedDecks);
    saveDecks(updatedDecks);
    setNewDeckName('');
    setShowCreateDeck(false);
  };

  const createCard = () => {
    if (!newCard.front.trim() || !newCard.back.trim() || !currentDeck) return;

    const card: Flashcard = {
      id: Date.now().toString(),
      front: newCard.front,
      back: newCard.back,
      difficulty: 0,
      nextReview: new Date(),
      reviewCount: 0
    };

    const updatedDeck = {
      ...currentDeck,
      cards: [...currentDeck.cards, card]
    };

    const updatedDecks = decks.map(deck => 
      deck.id === currentDeck.id ? updatedDeck : deck
    );

    setDecks(updatedDecks);
    setCurrentDeck(updatedDeck);
    saveDecks(updatedDecks);
    setNewCard({ front: '', back: '' });
    setShowCreateCard(false);
  };

  const deleteDeck = (deckId: string) => {
    const updatedDecks = decks.filter(deck => deck.id !== deckId);
    setDecks(updatedDecks);
    saveDecks(updatedDecks);
    if (currentDeck?.id === deckId) {
      setCurrentDeck(null);
      setStudyMode(false);
    }
  };

  const startStudying = (deck: Deck) => {
    setCurrentDeck(deck);
    setCurrentCardIndex(0);
    setShowBack(false);
    setStudyMode(true);
  };

  const nextCard = () => {
    if (!currentDeck) return;
    
    setShowBack(false);
    setCurrentCardIndex((prev) => 
      prev < currentDeck.cards.length - 1 ? prev + 1 : 0
    );
  };

  const prevCard = () => {
    if (!currentDeck) return;
    
    setShowBack(false);
    setCurrentCardIndex((prev) => 
      prev > 0 ? prev - 1 : currentDeck.cards.length - 1
    );
  };

  const markDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!currentDeck) return;

    const card = currentDeck.cards[currentCardIndex];
    let difficultyScore = 0;
    let interval = 1;

    switch (difficulty) {
      case 'easy':
        difficultyScore = Math.min(card.difficulty + 1, 5);
        interval = Math.pow(2, difficultyScore) * 2;
        break;
      case 'medium':
        difficultyScore = card.difficulty;
        interval = Math.pow(2, difficultyScore);
        break;
      case 'hard':
        difficultyScore = Math.max(card.difficulty - 1, 0);
        interval = 1;
        break;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    const updatedCard = {
      ...card,
      difficulty: difficultyScore,
      nextReview,
      reviewCount: card.reviewCount + 1
    };

    const updatedDeck = {
      ...currentDeck,
      cards: currentDeck.cards.map((c, index) => 
        index === currentCardIndex ? updatedCard : c
      )
    };

    const updatedDecks = decks.map(deck => 
      deck.id === currentDeck.id ? updatedDeck : deck
    );

    setDecks(updatedDecks);
    setCurrentDeck(updatedDeck);
    saveDecks(updatedDecks);
    
    // Auto advance to next card
    setTimeout(() => {
      nextCard();
    }, 500);
  };

  if (studyMode && currentDeck && currentDeck.cards.length > 0) {
    const currentCard = currentDeck.cards[currentCardIndex];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setStudyMode(false)}
            variant="outline"
            className="rounded-xl"
          >
            <ChevronLeft size={16} />
            Back to Decks
          </Button>
          <Badge variant="secondary" className="px-3 py-1">
            {currentCardIndex + 1} / {currentDeck.cards.length}
          </Badge>
        </div>

        <motion.div
          key={currentCardIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card 
            className="h-96 cursor-pointer shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50 border-0"
            onClick={() => setShowBack(!showBack)}
          >
            <CardContent className="h-full flex items-center justify-center p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={showBack ? 'back' : 'front'}
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center w-full"
                >
                  <div className="mb-4">
                    <Badge variant={showBack ? "secondary" : "default"} className="mb-4">
                      {showBack ? 'Answer' : 'Question'}
                    </Badge>
                  </div>
                  <p className="text-lg leading-relaxed text-gray-800">
                    {showBack ? currentCard.back : currentCard.front}
                  </p>
                  {!showBack && (
                    <p className="text-sm text-gray-500 mt-6">Tap to reveal answer</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {showBack && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-center text-gray-600">How difficult was this card?</p>
            <div className="flex justify-center space-x-3">
              <Button
                onClick={() => markDifficulty('easy')}
                className="bg-green-500 hover:bg-green-600 rounded-xl px-6"
              >
                Easy
              </Button>
              <Button
                onClick={() => markDifficulty('medium')}
                className="bg-yellow-500 hover:bg-yellow-600 rounded-xl px-6"
              >
                Medium
              </Button>
              <Button
                onClick={() => markDifficulty('hard')}
                className="bg-red-500 hover:bg-red-600 rounded-xl px-6"
              >
                Hard
              </Button>
            </div>
          </motion.div>
        )}

        <div className="flex justify-between">
          <Button
            onClick={prevCard}
            variant="outline"
            className="rounded-xl px-6"
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          <Button
            onClick={nextCard}
            variant="outline"
            className="rounded-xl px-6"
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center text-2xl text-purple-700">
              <Brain className="mr-2" size={24} />
              Flashcards & Spaced Repetition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-x-3 flex-wrap gap-2">
              <Button
                onClick={() => setShowCreateDeck(true)}
                className="bg-purple-600 hover:bg-purple-700 rounded-xl"
              >
                <Plus size={16} className="mr-2" />
                New Deck
              </Button>
              {currentDeck && (
                <>
                  <Button
                    onClick={() => setShowCreateCard(true)}
                    variant="outline"
                    className="rounded-xl"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Card
                  </Button>
                  <Button
                    onClick={() => setShowAIGenerate(true)}
                    variant="outline"
                    className="rounded-xl"
                  >
                    <Sparkles size={16} className="mr-2" />
                    AI Generate
                  </Button>
                </>
              )}
              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                className="rounded-xl"
              >
                <Settings size={16} className="mr-2" />
                API Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {!apiKey && (
        <Alert>
          <AlertDescription>
            Please set your Gemini API key in settings to generate AI-powered flashcards.
          </AlertDescription>
        </Alert>
      )}

      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border"
        >
          <h3 className="text-lg font-semibold mb-4">Gemini API Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Gemini API Key
              </label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key..."
                className="rounded-xl"
              />
              <p className="text-sm text-gray-500 mt-1">
                Get your API key from Google AI Studio: https://makersuite.google.com/app/apikey
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={saveApiKey}
                className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-xl"
              >
                Save API Key
              </Button>
              <Button
                onClick={() => setShowSettings(false)}
                variant="outline"
                className="rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {showAIGenerate && currentDeck && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border"
        >
          <h3 className="text-lg font-semibold mb-4">Generate AI Flashcards</h3>
          <div className="space-y-4">
            <Textarea
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder="Paste your study material here to generate flashcards..."
              className="rounded-xl min-h-32"
              rows={6}
            />
            <div className="flex space-x-3">
              <Button
                onClick={generateAIFlashcards}
                disabled={isGenerating}
                className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-xl"
              >
                {isGenerating ? 'Generating...' : 'Generate Flashcards'}
              </Button>
              <Button
                onClick={() => setShowAIGenerate(false)}
                variant="outline"
                className="rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {showCreateDeck && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border"
        >
          <h3 className="text-lg font-semibold mb-4">Create New Deck</h3>
          <div className="space-y-4">
            <Input
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              placeholder="Deck name..."
              className="rounded-xl"
            />
            <div className="flex space-x-3">
              <Button
                onClick={createDeck}
                className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-xl"
              >
                Create Deck
              </Button>
              <Button
                onClick={() => setShowCreateDeck(false)}
                variant="outline"
                className="rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {showCreateCard && currentDeck && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border"
        >
          <h3 className="text-lg font-semibold mb-4">Add New Card</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Front (Question)</label>
              <Textarea
                value={newCard.front}
                onChange={(e) => setNewCard({...newCard, front: e.target.value})}
                placeholder="Enter question or prompt..."
                className="rounded-xl"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Back (Answer)</label>
              <Textarea
                value={newCard.back}
                onChange={(e) => setNewCard({...newCard, back: e.target.value})}
                placeholder="Enter answer or explanation..."
                className="rounded-xl"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={createCard}
                className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-xl"
              >
                Add Card
              </Button>
              <Button
                onClick={() => setShowCreateCard(false)}
                variant="outline"
                className="rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {decks.map((deck, index) => (
          <motion.div
            key={deck.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {deck.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{deck.cards.length} cards</span>
                      <Badge variant="outline" className="text-xs">
                        Due: {deck.cards.filter(card => card.nextReview <= new Date()).length}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => startStudying(deck)}
                      disabled={deck.cards.length === 0}
                      className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                    >
                      Study
                    </Button>
                    <Button
                      onClick={() => setCurrentDeck(deck)}
                      variant="outline"
                      className="rounded-xl"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => deleteDeck(deck.id)}
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
          </motion.div>
        ))}
      </div>

      {decks.length === 0 && (
        <div className="text-center py-12">
          <Brain size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No flashcard decks yet</p>
          <Button
            onClick={() => setShowCreateDeck(true)}
            className="bg-purple-600 hover:bg-purple-700 rounded-xl"
          >
            Create Your First Deck
          </Button>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
