import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Volume2, Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Definition {
  definition: string;
  example?: string;
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms?: string[];
  antonyms?: string[];
}

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics?: Array<{
    text?: string;
    audio?: string;
  }>;
  meanings: Meaning[];
}

interface FilipinoEntry {
  word: string;
  definition: string;
  type?: string;
  example?: string;
}

const Dictionary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<DictionaryEntry[]>([]);
  const [filipinoResults, setFilipinoResults] = useState<FilipinoEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('english');

  const searchEnglishWord = async (word: string) => {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.trim()}`);
    
    if (!response.ok) {
      throw new Error('Word not found');
    }

    return await response.json();
  };

  const searchFilipinoWord = async (word: string) => {
    // Using a simple approach since bansa.org API might not be directly accessible
    // This is a fallback implementation - you might need to use a different Filipino dictionary API
    try {
      // First try searching for common Filipino words
      const commonWords: { [key: string]: FilipinoEntry } = {
        'kumusta': { word: 'kumusta', definition: 'how are you; hello', type: 'greeting' },
        'salamat': { word: 'salamat', definition: 'thank you', type: 'expression' },
        'mahal': { word: 'mahal', definition: 'love; expensive', type: 'adjective/noun' },
        'pamilya': { word: 'pamilya', definition: 'family', type: 'noun' },
        'bahay': { word: 'bahay', definition: 'house; home', type: 'noun' },
        'tubig': { word: 'tubig', definition: 'water', type: 'noun' },
        'pagkain': { word: 'pagkain', definition: 'food', type: 'noun' },
        'araw': { word: 'araw', definition: 'day; sun', type: 'noun' },
        'gabi': { word: 'gabi', definition: 'night; taro', type: 'noun' },
        'maganda': { word: 'maganda', definition: 'beautiful; good', type: 'adjective' },
      };

      const foundWord = commonWords[word.toLowerCase()];
      if (foundWord) {
        return [foundWord];
      }

      // For words not in our basic dictionary, return a message
      return [{
        word: word,
        definition: 'Definition not found in our Filipino dictionary. Try searching for common Filipino words like: kumusta, salamat, mahal, pamilya, bahay, tubig, pagkain, araw, gabi, maganda',
        type: 'notice'
      }];
    } catch (err) {
      throw new Error('Filipino dictionary search failed');
    }
  };

  const searchWord = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);
    setFilipinoResults([]);

    try {
      if (language === 'english') {
        const data = await searchEnglishWord(searchTerm);
        setResults(data);
      } else {
        const data = await searchFilipinoWord(searchTerm);
        setFilipinoResults(data);
      }
    } catch (err) {
      setError(`Word not found in ${language} dictionary. Please try another word.`);
      console.error('Dictionary API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(err => console.error('Error playing audio:', err));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchWord();
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center text-2xl text-green-700">
              <BookOpen className="mr-2" size={24} />
              Dictionary & Word Lookup
            </CardTitle>
            <p className="text-green-600 mt-2">Search English and Filipino words</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">
                    <div className="flex items-center">
                      <Globe size={16} className="mr-2" />
                      English
                    </div>
                  </SelectItem>
                  <SelectItem value="filipino">
                    <div className="flex items-center">
                      <Globe size={16} className="mr-2" />
                      Filipino
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex space-x-3">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Enter ${language} word to search...`}
                  className="rounded-xl"
                />
                <Button
                  onClick={searchWord}
                  disabled={loading || !searchTerm.trim()}
                  className="bg-green-600 hover:bg-green-700 rounded-xl px-6"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Search size={16} />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4"
        >
          <p className="text-red-700 text-center">{error}</p>
        </motion.div>
      )}

      {/* English Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-bold text-gray-800 capitalize">
                        {entry.word}
                      </h2>
                      {entry.phonetics && entry.phonetics.some(p => p.audio) && (
                        <Button
                          onClick={() => {
                            const audioPhonetic = entry.phonetics?.find(p => p.audio);
                            if (audioPhonetic?.audio) {
                              playAudio(audioPhonetic.audio);
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                        >
                          <Volume2 size={16} />
                        </Button>
                      )}
                    </div>
                    {entry.phonetic && (
                      <p className="text-gray-600 italic">{entry.phonetic}</p>
                    )}
                  </div>

                  {entry.meanings.map((meaning, meaningIndex) => (
                    <div key={meaningIndex} className="mb-6">
                      <Badge variant="secondary" className="mb-3">
                        {meaning.partOfSpeech}
                      </Badge>
                      
                      <div className="space-y-3">
                        {meaning.definitions.slice(0, 3).map((def, defIndex) => (
                          <div key={defIndex} className="pl-4 border-l-2 border-green-200">
                            <p className="text-gray-800 mb-1">{def.definition}</p>
                            {def.example && (
                              <p className="text-gray-600 italic text-sm">
                                Example: "{def.example}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {meaning.synonyms && meaning.synonyms.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Synonyms:</p>
                          <div className="flex flex-wrap gap-2">
                            {meaning.synonyms.slice(0, 5).map((synonym, synIndex) => (
                              <Badge key={synIndex} variant="outline" className="text-xs">
                                {synonym}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {meaning.antonyms && meaning.antonyms.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Antonyms:</p>
                          <div className="flex flex-wrap gap-2">
                            {meaning.antonyms.slice(0, 5).map((antonym, antIndex) => (
                              <Badge key={antIndex} variant="outline" className="text-xs">
                                {antonym}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filipino Results */}
      {filipinoResults.length > 0 && (
        <div className="space-y-4">
          {filipinoResults.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize mb-2">
                      {entry.word}
                    </h2>
                    {entry.type && (
                      <Badge variant="secondary" className="mb-3">
                        {entry.type}
                      </Badge>
                    )}
                  </div>

                  <div className="pl-4 border-l-2 border-green-200">
                    <p className="text-gray-800 mb-1">{entry.definition}</p>
                    {entry.example && (
                      <p className="text-gray-600 italic text-sm">
                        Example: "{entry.example}"
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && !error && results.length === 0 && filipinoResults.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Search for a word to see its definition</p>
          {language === 'filipino' && (
            <p className="text-sm text-gray-500 mt-2">
              Try words like: kumusta, salamat, mahal, pamilya, bahay
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dictionary;
