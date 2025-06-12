
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Volume2, Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface FilipinoEntry {
  word: string;
  definition: string;
  type?: string;
  example?: string;
  pronunciation?: string;
}

const Dictionary = () => {
  const { currentTheme } = useTheme();
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
    try {
      // Enhanced Filipino dictionary with more comprehensive word list
      const filipinoWordDatabase: { [key: string]: FilipinoEntry } = {
        // Greetings and Common Expressions
        'kumusta': { word: 'kumusta', definition: 'how are you; hello; a greeting used to ask about someone\'s well-being', type: 'greeting', example: 'Kumusta ka na?' },
        'salamat': { word: 'salamat', definition: 'thank you; expression of gratitude', type: 'expression', example: 'Salamat sa tulong mo.' },
        'walang anuman': { word: 'walang anuman', definition: 'you\'re welcome; no problem', type: 'expression', example: 'Walang anuman, kaibigan.' },
        'paalam': { word: 'paalam', definition: 'goodbye; farewell', type: 'greeting', example: 'Paalam na, hanggang bukas.' },
        'pasensya': { word: 'pasensya', definition: 'sorry; excuse me; patience', type: 'expression', example: 'Pasensya na sa abala.' },
        
        // Family and Relationships
        'pamilya': { word: 'pamilya', definition: 'family; relatives living together', type: 'noun', example: 'Ang pamilya namin ay masaya.' },
        'nanay': { word: 'nanay', definition: 'mother; mom', type: 'noun', example: 'Si nanay ay nagluluto.' },
        'tatay': { word: 'tatay', definition: 'father; dad', type: 'noun', example: 'Si tatay ay nasa trabaho.' },
        'anak': { word: 'anak', definition: 'child; son or daughter', type: 'noun', example: 'Anak, kumain ka na.' },
        'kapatid': { word: 'kapatid', definition: 'sibling; brother or sister', type: 'noun', example: 'Kapatid ko si Maria.' },
        'lolo': { word: 'lolo', definition: 'grandfather; grandpa', type: 'noun', example: 'Si lolo ay mabait.' },
        'lola': { word: 'lola', definition: 'grandmother; grandma', type: 'noun', example: 'Lola ko ay mahilig magluto.' },
        'kaibigan': { word: 'kaibigan', definition: 'friend; companion', type: 'noun', example: 'Matalik kong kaibigan si Juan.' },
        
        // Emotions and Descriptions
        'mahal': { word: 'mahal', definition: 'love; expensive; dear', type: 'adjective/noun/verb', example: 'Mahal kita. / Mahal ang presyo.' },
        'maganda': { word: 'maganda', definition: 'beautiful; good; nice', type: 'adjective', example: 'Maganda ang bulaklak.' },
        'gwapo': { word: 'gwapo', definition: 'handsome; good-looking (for males)', type: 'adjective', example: 'Gwapo ang binata.' },
        'masaya': { word: 'masaya', definition: 'happy; joyful; fun', type: 'adjective', example: 'Masaya ang party.' },
        'malungkot': { word: 'malungkot', definition: 'sad; gloomy', type: 'adjective', example: 'Malungkot siya ngayon.' },
        'galit': { word: 'galit', definition: 'angry; mad', type: 'adjective', example: 'Galit si mama.' },
        'takot': { word: 'takot', definition: 'afraid; scared', type: 'adjective', example: 'Takot ako sa dilim.' },
        
        // Home and Places
        'bahay': { word: 'bahay', definition: 'house; home; dwelling place', type: 'noun', example: 'Ang bahay namin ay malaki.' },
        'kwarto': { word: 'kwarto', definition: 'room; bedroom', type: 'noun', example: 'Nasa kwarto ang mga bata.' },
        'kusina': { word: 'kusina', definition: 'kitchen; place for cooking', type: 'noun', example: 'Nagluluto si mama sa kusina.' },
        'eskwela': { word: 'eskwela', definition: 'school; educational institution', type: 'noun', example: 'Pupunta ako sa eskwela.' },
        'ospital': { word: 'ospital', definition: 'hospital; medical facility', type: 'noun', example: 'Nasa ospital ang doktor.' },
        'palengke': { word: 'palengke', definition: 'market; place to buy goods', type: 'noun', example: 'Bibili kami sa palengke.' },
        
        // Food and Drink
        'pagkain': { word: 'pagkain', definition: 'food; meal; something to eat', type: 'noun', example: 'Masarap ang pagkain.' },
        'tubig': { word: 'tubig', definition: 'water; liquid for drinking', type: 'noun', example: 'Umiinom ako ng tubig.' },
        'kanin': { word: 'kanin', definition: 'rice; cooked rice', type: 'noun', example: 'Kumakain ng kanin ang pamilya.' },
        'adobo': { word: 'adobo', definition: 'Filipino dish with meat/chicken in soy sauce and vinegar', type: 'noun', example: 'Luto ni mama ang adobo.' },
        'sinigang': { word: 'sinigang', definition: 'Filipino sour soup', type: 'noun', example: 'Mainit ang sinigang.' },
        'kape': { word: 'kape', definition: 'coffee; hot beverage', type: 'noun', example: 'Umiinom siya ng kape.' },
        
        // Time and Weather
        'araw': { word: 'araw', definition: 'day; sun; 24-hour period', type: 'noun', example: 'Mainit ang araw ngayon.' },
        'gabi': { word: 'gabi', definition: 'night; evening; taro plant', type: 'noun', example: 'Madilim sa gabi.' },
        'umaga': { word: 'umaga', definition: 'morning; early part of the day', type: 'noun', example: 'Maaga ako nagiging umaga.' },
        'hapon': { word: 'hapon', definition: 'afternoon; late part of the day', type: 'noun', example: 'Mainit sa hapon.' },
        'ulan': { word: 'ulan', definition: 'rain; precipitation', type: 'noun', example: 'Malakas ang ulan.' },
        'hangin': { word: 'hangin', definition: 'wind; air in motion', type: 'noun', example: 'Malamig ang hangin.' },
        
        // Basic Verbs
        'kumain': { word: 'kumain', definition: 'to eat; to consume food', type: 'verb', example: 'Kumain na tayo.' },
        'uminom': { word: 'uminom', definition: 'to drink; to consume liquid', type: 'verb', example: 'Uminom ka ng tubig.' },
        'matulog': { word: 'matulog', definition: 'to sleep; to rest', type: 'verb', example: 'Matulog ka na.' },
        'magbasa': { word: 'magbasa', definition: 'to read; to study text', type: 'verb', example: 'Magbasa ka ng libro.' },
        'magsulat': { word: 'magsulat', definition: 'to write; to put words on paper', type: 'verb', example: 'Magsulat ka ng liham.' },
        'lumakad': { word: 'lumakad', definition: 'to walk; to go on foot', type: 'verb', example: 'Lumakad siya papuntang eskwela.' },
        'tumakbo': { word: 'tumakbo', definition: 'to run; to move quickly', type: 'verb', example: 'Tumakbo ang bata.' },
        
        // Objects and Things
        'libro': { word: 'libro', definition: 'book; reading material', type: 'noun', example: 'Binabasa ko ang libro.' },
        'lapis': { word: 'lapis', definition: 'pencil; writing instrument', type: 'noun', example: 'Nasaan ang lapis ko?' },
        'papel': { word: 'papel', definition: 'paper; writing material', type: 'noun', example: 'Puti ang papel.' },
        'mesa': { word: 'mesa', definition: 'table; furniture for eating or working', type: 'noun', example: 'Nasa mesa ang pagkain.' },
        'silya': { word: 'silya', definition: 'chair; seat with backrest', type: 'noun', example: 'Umupo ka sa silya.' },
        'bintana': { word: 'bintana', definition: 'window; opening in a wall', type: 'noun', example: 'Buksan mo ang bintana.' },
        'pinto': { word: 'pinto', definition: 'door; entrance or exit', type: 'noun', example: 'Isara mo ang pinto.' },
        
        // Colors
        'pula': { word: 'pula', definition: 'red; color of blood', type: 'adjective', example: 'Pula ang rosas.' },
        'asul': { word: 'asul', definition: 'blue; color of the sky', type: 'adjective', example: 'Asul ang dagat.' },
        'dilaw': { word: 'dilaw', definition: 'yellow; color of the sun', type: 'adjective', example: 'Dilaw ang araw.' },
        'berde': { word: 'berde', definition: 'green; color of grass', type: 'adjective', example: 'Berde ang dahon.' },
        'itim': { word: 'itim', definition: 'black; darkest color', type: 'adjective', example: 'Itim ang gabi.' },
        'puti': { word: 'puti', definition: 'white; lightest color', type: 'adjective', example: 'Puti ang niyebe.' },
        
        // Numbers (basic)
        'isa': { word: 'isa', definition: 'one; single unit', type: 'number', example: 'Isa lang ang gusto ko.' },
        'dalawa': { word: 'dalawa', definition: 'two; pair', type: 'number', example: 'Dalawa ang mata mo.' },
        'tatlo': { word: 'tatlo', definition: 'three; trio', type: 'number', example: 'Tatlo ang anak nila.' },
        'apat': { word: 'apat', definition: 'four; quartet', type: 'number', example: 'Apat ang gulong ng kotse.' },
        'lima': { word: 'lima', definition: 'five; hand count', type: 'number', example: 'Lima ang daliri sa kamay.' },
      };

      const searchKey = word.toLowerCase().trim();
      const foundWord = filipinoWordDatabase[searchKey];
      
      if (foundWord) {
        return [foundWord];
      }

      // If not found, try partial matching
      const partialMatches = Object.values(filipinoWordDatabase).filter(entry =>
        entry.word.toLowerCase().includes(searchKey) ||
        entry.definition.toLowerCase().includes(searchKey)
      );

      if (partialMatches.length > 0) {
        return partialMatches.slice(0, 5); // Return up to 5 matches
      }

      // If still no matches, suggest similar words
      const suggestions = Object.keys(filipinoWordDatabase).filter(key =>
        key.startsWith(searchKey.charAt(0))
      ).slice(0, 10);

      return [{
        word: word,
        definition: `Word not found. Did you mean: ${suggestions.join(', ')}? Or try common words like: kumusta, salamat, mahal, pamilya, bahay, pagkain, tubig, maganda, masaya, araw`,
        type: 'suggestion'
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
        <Card className={`bg-gradient-to-br ${currentTheme.cardGradient} border-0 shadow-lg`}>
          <CardHeader className="text-center pb-4">
            <CardTitle className={`flex items-center justify-center text-2xl text-${currentTheme.textColor}`}>
              <BookOpen className="mr-2" size={24} />
              Dictionary & Word Lookup
            </CardTitle>
            <p className={`text-${currentTheme.textColor} mt-2 opacity-80`}>Search English and Filipino words</p>
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
                      Filipino (Tagalog)
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
                  className={`bg-gradient-to-r ${currentTheme.headerGradient} hover:opacity-90 rounded-xl px-6`}
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
                    {entry.type && entry.type !== 'suggestion' && (
                      <Badge variant="secondary" className="mb-3">
                        {entry.type}
                      </Badge>
                    )}
                    {entry.pronunciation && (
                      <p className="text-gray-600 italic text-sm mb-2">
                        Pronunciation: {entry.pronunciation}
                      </p>
                    )}
                  </div>

                  <div className={`pl-4 border-l-2 ${entry.type === 'suggestion' ? 'border-amber-300' : 'border-green-200'}`}>
                    <p className={`text-gray-800 mb-1 ${entry.type === 'suggestion' ? 'text-amber-700' : ''}`}>
                      {entry.definition}
                    </p>
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
              Try words like: kumusta, salamat, mahal, pamilya, bahay, pagkain, maganda, masaya
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dictionary;
