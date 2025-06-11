
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Volume2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
    }>;
  }>;
}

interface WordOfDay {
  word: string;
  definition: string;
  example?: string;
}

const Dictionary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<DictionaryEntry | null>(null);
  const [wordOfDay, setWordOfDay] = useState<WordOfDay | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWordOfDay();
  }, []);

  const fetchWordOfDay = async () => {
    try {
      // Since we can't access external APIs directly, we'll use a static word of the day
      const words = [
        {
          word: "Serendipity",
          definition: "The occurrence and development of events by chance in a happy or beneficial way",
          example: "A fortunate stroke of serendipity brought the two old friends together."
        },
        {
          word: "Ephemeral", 
          definition: "Lasting for a very short time",
          example: "The beauty of cherry blossoms is ephemeral, lasting only a few weeks."
        },
        {
          word: "Ubiquitous",
          definition: "Present, appearing, or found everywhere",
          example: "Smartphones have become ubiquitous in modern society."
        }
      ];
      
      const randomWord = words[Math.floor(Math.random() * words.length)];
      setWordOfDay(randomWord);
    } catch (err) {
      console.error('Error fetching word of day:', err);
    }
  };

  const searchWord = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Mock dictionary data since we can't access external APIs directly
      const mockData: DictionaryEntry = {
        word: searchTerm.toLowerCase(),
        phonetic: `/ˈsɜːrtʃ/`,
        meanings: [
          {
            partOfSpeech: "verb",
            definitions: [
              {
                definition: "Try to find something by looking or otherwise seeking carefully and thoroughly",
                example: `She searched for her keys everywhere.`,
                synonyms: ["seek", "look for", "hunt for", "explore"]
              }
            ]
          },
          {
            partOfSpeech: "noun", 
            definitions: [
              {
                definition: "An act of searching for someone or something",
                example: `The search for the missing hiker continued through the night.`,
                synonyms: ["quest", "hunt", "investigation"]
              }
            ]
          }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSearchResult(mockData);
    } catch (err) {
      setError('Error fetching word definition. Please try again.');
      console.error('Dictionary error:', err);
    } finally {
      setLoading(false);
    }
  };

  const playPronunciation = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center text-2xl text-green-700">
              <BookOpen className="mr-2" size={24} />
              Dictionary & Word Explorer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for a word..."
                className="text-lg h-12 rounded-xl border-2 focus:border-green-400"
                onKeyPress={(e) => e.key === 'Enter' && searchWord()}
              />
              <Button
                onClick={searchWord}
                disabled={loading}
                className="px-6 h-12 rounded-xl bg-green-600 hover:bg-green-700"
              >
                <Search size={20} />
              </Button>
            </div>

            {error && (
              <motion.p 
                className="text-red-500 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            )}

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Searching...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {wordOfDay && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-lg border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700">
                <Star className="mr-2 text-yellow-500" size={20} />
                Word of the Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <h3 className="text-2xl font-bold text-orange-800 capitalize">
                    {wordOfDay.word}
                  </h3>
                  <Button
                    onClick={() => playPronunciation(wordOfDay.word)}
                    variant="ghost"
                    size="sm"
                    className="text-orange-600"
                  >
                    <Volume2 size={16} />
                  </Button>
                </div>
                <p className="text-gray-700 leading-relaxed">{wordOfDay.definition}</p>
                {wordOfDay.example && (
                  <div className="bg-white/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 italic">"{wordOfDay.example}"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {searchResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="text-2xl font-bold capitalize text-green-800">
                    {searchResult.word}
                  </h3>
                  <Button
                    onClick={() => playPronunciation(searchResult.word)}
                    variant="ghost"
                    size="sm"
                    className="text-green-600"
                  >
                    <Volume2 size={16} />
                  </Button>
                </div>
                {searchResult.phonetic && (
                  <span className="text-sm text-gray-500 font-mono">
                    {searchResult.phonetic}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {searchResult.meanings.map((meaning, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-l-4 border-green-300 pl-4"
                >
                  <Badge variant="secondary" className="mb-3 bg-green-100 text-green-800">
                    {meaning.partOfSpeech}
                  </Badge>
                  
                  {meaning.definitions.map((def, defIndex) => (
                    <div key={defIndex} className="mb-4">
                      <p className="text-gray-800 leading-relaxed mb-2">
                        {defIndex + 1}. {def.definition}
                      </p>
                      
                      {def.example && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-2">
                          <p className="text-sm text-gray-600 italic">
                            Example: "{def.example}"
                          </p>
                        </div>
                      )}
                      
                      {def.synonyms && def.synonyms.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-sm text-gray-600 mr-2">Synonyms:</span>
                          {def.synonyms.slice(0, 4).map((synonym, synIndex) => (
                            <Badge 
                              key={synIndex} 
                              variant="outline"
                              className="text-xs text-blue-600 border-blue-200"
                            >
                              {synonym}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Dictionary;
