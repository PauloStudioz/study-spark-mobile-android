
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';

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

const Dictionary = () => {
  const { currentTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchWord = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchTerm.trim()}`);
      
      if (!response.ok) {
        throw new Error('Word not found');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Word not found. Please try another word.');
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
    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`bg-gradient-to-br ${currentTheme.cardGradient} border-0 shadow-lg`}>
          <CardHeader className="text-center pb-4">
            <CardTitle className={`flex items-center justify-center text-2xl text-${currentTheme.textColor}`}>
              <BookOpen className="mr-2" size={24} />
              Dictionary
            </CardTitle>
            <p className={`text-${currentTheme.textColor} mt-2 opacity-80`}>
              Search English words with pronunciation
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-3">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter word to search..."
                className="rounded-xl"
              />
              <Button
                onClick={searchWord}
                disabled={loading || !searchTerm.trim()}
                className={`bg-gradient-to-r ${currentTheme.headerGradient} hover:opacity-90 rounded-xl px-6`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Search size={16} />
                )}
              </Button>
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
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && !error && results.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Search for a word to see its definition</p>
        </div>
      )}
    </div>
  );
};

export default Dictionary;
