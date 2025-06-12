
interface WiktionaryResponse {
  query?: {
    pages?: {
      [key: string]: {
        extract?: string;
        title?: string;
      };
    };
  };
}

interface TagalogEntry {
  word: string;
  definition: string;
  type?: string;
  example?: string;
  pronunciation?: string;
  etymology?: string;
}

export const searchTagalogWord = async (word: string): Promise<TagalogEntry[]> => {
  try {
    console.log('Searching Wiktionary for:', word);
    
    // Use Wiktionary API for Filipino/Tagalog words
    const response = await fetch(
      `https://tl.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(word.trim())}&prop=extracts&format=json&origin=*&exintro=true&explaintext=true`
    );
    
    if (response.ok) {
      const data: WiktionaryResponse = await response.json();
      const pages = data.query?.pages;
      
      if (pages) {
        const results: TagalogEntry[] = [];
        
        Object.values(pages).forEach(page => {
          if (page.extract && page.title && !page.extract.includes('refer to:')) {
            // Parse the extract to get definition
            let definition = page.extract;
            
            // Clean up the definition
            definition = definition
              .replace(/\n+/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            
            // Limit definition length
            if (definition.length > 300) {
              definition = definition.substring(0, 300) + '...';
            }
            
            results.push({
              word: page.title,
              definition: definition || 'Definition found in Wiktionary',
              type: 'noun', // Default type
              pronunciation: extractPronunciation(definition),
              etymology: extractEtymology(definition)
            });
          }
        });
        
        if (results.length > 0) {
          return results;
        }
      }
    }
    
    // Fallback to local dictionary
    return searchLocalTagalog(word);
  } catch (error) {
    console.log('Wiktionary API error, using local dictionary:', error);
    return searchLocalTagalog(word);
  }
};

const extractPronunciation = (text: string): string | undefined => {
  const pronMatch = text.match(/\[(.*?)\]/);
  return pronMatch ? pronMatch[1] : undefined;
};

const extractEtymology = (text: string): string | undefined => {
  const etymMatch = text.match(/Etymology:?\s*([^.]+)/i);
  return etymMatch ? etymMatch[1].trim() : undefined;
};

const searchLocalTagalog = (word: string): TagalogEntry[] => {
  const localDatabase: { [key: string]: TagalogEntry } = {
    'kumusta': { 
      word: 'kumusta', 
      definition: 'how are you; hello; a greeting used to ask about someone\'s well-being', 
      type: 'greeting', 
      example: 'Kumusta ka na, kaibigan?',
      pronunciation: 'ku-mus-ta',
      etymology: 'Spanish: ¿cómo está?'
    },
    'salamat': { 
      word: 'salamat', 
      definition: 'thank you; expression of gratitude', 
      type: 'expression', 
      example: 'Salamat sa inyong tulong.',
      pronunciation: 'sa-la-mat',
      etymology: 'Arabic: salamat (peace, safety)'
    },
    'mahal': { 
      word: 'mahal', 
      definition: 'love; expensive; dear; precious', 
      type: 'noun/adjective', 
      example: 'Mahal kita. / Mahal ang presyo ng pagkain.',
      pronunciation: 'ma-hal',
      etymology: 'Sanskrit: mahal (palace, expensive)'
    },
    'pamilya': { 
      word: 'pamilya', 
      definition: 'family; group of related people living together', 
      type: 'noun', 
      example: 'Ang pamilya namin ay masaya at magkakapit.',
      pronunciation: 'pa-mil-ya',
      etymology: 'Spanish: familia'
    },
    'bahay': { 
      word: 'bahay', 
      definition: 'house; home; dwelling place; residence', 
      type: 'noun', 
      example: 'Ang bahay namin ay malapit sa dagat.',
      pronunciation: 'ba-hay'
    },
    'pagkain': { 
      word: 'pagkain', 
      definition: 'food; meal; something to eat', 
      type: 'noun', 
      example: 'Masarap ang pagkain sa restaurant na ito.',
      pronunciation: 'pag-ka-in'
    }
  };

  const searchKey = word.toLowerCase().trim();
  const foundWord = localDatabase[searchKey];
  
  if (foundWord) {
    return [foundWord];
  }

  // Partial matching
  const partialMatches = Object.values(localDatabase).filter(entry =>
    entry.word.toLowerCase().includes(searchKey) ||
    entry.definition.toLowerCase().includes(searchKey)
  );

  if (partialMatches.length > 0) {
    return partialMatches.slice(0, 5);
  }

  return [{
    word: word,
    definition: `Word not found. Try: ${Object.keys(localDatabase).slice(0, 5).join(', ')}`,
    type: 'suggestion'
  }];
};
