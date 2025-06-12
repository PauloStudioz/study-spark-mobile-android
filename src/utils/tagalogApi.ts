
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
    // Using a free Filipino dictionary API - Diksiyonaryong Filipino
    const response = await fetch(`https://api.diksiyonaryongfilipino.ph/word/${encodeURIComponent(word.trim())}`);
    
    if (response.ok) {
      const data = await response.json();
      return data.results || [];
    }
    
    // Fallback to our enhanced local dictionary
    return searchLocalTagalog(word);
  } catch (error) {
    console.log('API unavailable, using local dictionary:', error);
    return searchLocalTagalog(word);
  }
};

const searchLocalTagalog = (word: string): TagalogEntry[] => {
  const enhancedDatabase: { [key: string]: TagalogEntry } = {
    // Basic greetings and expressions
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
    'walang anuman': { 
      word: 'walang anuman', 
      definition: 'you\'re welcome; no problem; don\'t mention it', 
      type: 'expression', 
      example: 'Walang anuman, handang tumulong.',
      pronunciation: 'wa-lang a-nu-man'
    },
    'mahal': { 
      word: 'mahal', 
      definition: 'love; expensive; dear; precious', 
      type: 'noun/adjective', 
      example: 'Mahal kita. / Mahal ang presyo ng pagkain.',
      pronunciation: 'ma-hal',
      etymology: 'Sanskrit: mahal (palace, expensive)'
    },
    
    // Family terms
    'pamilya': { 
      word: 'pamilya', 
      definition: 'family; group of related people living together', 
      type: 'noun', 
      example: 'Ang pamilya namin ay masaya at magkakapit.',
      pronunciation: 'pa-mil-ya',
      etymology: 'Spanish: familia'
    },
    'nanay': { 
      word: 'nanay', 
      definition: 'mother; mom; female parent', 
      type: 'noun', 
      example: 'Si nanay ay nagluluto ng masarap na pagkain.',
      pronunciation: 'na-nay'
    },
    'tatay': { 
      word: 'tatay', 
      definition: 'father; dad; male parent', 
      type: 'noun', 
      example: 'Si tatay ay nagtatrabaho sa opisina.',
      pronunciation: 'ta-tay'
    },
    'anak': { 
      word: 'anak', 
      definition: 'child; son or daughter; offspring', 
      type: 'noun', 
      example: 'Ang anak nila ay matalino.',
      pronunciation: 'a-nak'
    },
    'kapatid': { 
      word: 'kapatid', 
      definition: 'sibling; brother or sister', 
      type: 'noun', 
      example: 'Kapatid ko si Maria sa pagkakaibigan.',
      pronunciation: 'ka-pa-tid'
    },
    
    // Emotions and descriptions  
    'maganda': { 
      word: 'maganda', 
      definition: 'beautiful; pretty; good; nice', 
      type: 'adjective', 
      example: 'Maganda ang bulaklak sa hardin.',
      pronunciation: 'ma-gan-da'
    },
    'masaya': { 
      word: 'masaya', 
      definition: 'happy; joyful; fun; cheerful', 
      type: 'adjective', 
      example: 'Masaya ang pagdiriwang ngayong gabi.',
      pronunciation: 'ma-sa-ya'
    },
    'malungkot': { 
      word: 'malungkot', 
      definition: 'sad; sorrowful; melancholy', 
      type: 'adjective', 
      example: 'Malungkot siya dahil umalis ang kaibigan.',
      pronunciation: 'ma-lung-kot'
    },
    
    // Home and places
    'bahay': { 
      word: 'bahay', 
      definition: 'house; home; dwelling place; residence', 
      type: 'noun', 
      example: 'Ang bahay namin ay malapit sa dagat.',
      pronunciation: 'ba-hay'
    },
    'eskwela': { 
      word: 'eskwela', 
      definition: 'school; educational institution', 
      type: 'noun', 
      example: 'Pupunta ako sa eskwela bukas.',
      pronunciation: 'es-kwe-la',
      etymology: 'Spanish: escuela'
    },
    'simbahan': { 
      word: 'simbahan', 
      definition: 'church; place of Christian worship', 
      type: 'noun', 
      example: 'Pumupunta kami sa simbahan tuwing Linggo.',
      pronunciation: 'sim-ba-han'
    },
    
    // Food and drink
    'pagkain': { 
      word: 'pagkain', 
      definition: 'food; meal; something to eat', 
      type: 'noun', 
      example: 'Masarap ang pagkain sa restaurant na ito.',
      pronunciation: 'pag-ka-in'
    },
    'tubig': { 
      word: 'tubig', 
      definition: 'water; clear liquid essential for life', 
      type: 'noun', 
      example: 'Umiinom ako ng maraming tubig araw-araw.',
      pronunciation: 'tu-big'
    },
    'kanin': { 
      word: 'kanin', 
      definition: 'rice; cooked rice; staple food', 
      type: 'noun', 
      example: 'Kumakain kami ng kanin sa tanghalian.',
      pronunciation: 'ka-nin'
    },
    'adobo': { 
      word: 'adobo', 
      definition: 'Filipino dish with meat/chicken cooked in soy sauce, vinegar, and garlic', 
      type: 'noun', 
      example: 'Ang adobo ni lola ay pinakamasarap.',
      pronunciation: 'a-do-bo',
      etymology: 'Spanish: adobar (to marinate)'
    },
    
    // Time and weather
    'araw': { 
      word: 'araw', 
      definition: 'day; sun; 24-hour period', 
      type: 'noun', 
      example: 'Mainit ang araw ngayong tag-init.',
      pronunciation: 'a-raw'
    },
    'gabi': { 
      word: 'gabi', 
      definition: 'night; evening; nighttime', 
      type: 'noun', 
      example: 'Tahimik sa gabi sa aming lugar.',
      pronunciation: 'ga-bi'
    },
    'ulan': { 
      word: 'ulan', 
      definition: 'rain; precipitation from clouds', 
      type: 'noun', 
      example: 'Malakas ang ulan ngayong tag-ulan.',
      pronunciation: 'u-lan'
    },
    
    // Basic verbs
    'kumain': { 
      word: 'kumain', 
      definition: 'to eat; to consume food', 
      type: 'verb', 
      example: 'Kumain na tayo ng hapunan.',
      pronunciation: 'ku-ma-in'
    },
    'matulog': { 
      word: 'matulog', 
      definition: 'to sleep; to rest; to go to bed', 
      type: 'verb', 
      example: 'Matulog ka na, huli na ang gabi.',
      pronunciation: 'ma-tu-log'
    },
    'magbasa': { 
      word: 'magbasa', 
      definition: 'to read; to study text; to comprehend written material', 
      type: 'verb', 
      example: 'Magbasa ka ng libro para matuto.',
      pronunciation: 'mag-ba-sa'
    },
    
    // Colors
    'pula': { 
      word: 'pula', 
      definition: 'red; color of blood and fire', 
      type: 'adjective', 
      example: 'Pula ang kulay ng rosas.',
      pronunciation: 'pu-la'
    },
    'asul': { 
      word: 'asul', 
      definition: 'blue; color of the sky and ocean', 
      type: 'adjective', 
      example: 'Asul ang kulay ng dagat.',
      pronunciation: 'a-sul',
      etymology: 'Spanish: azul'
    },
    'dilaw': { 
      word: 'dilaw', 
      definition: 'yellow; color of the sun and gold', 
      type: 'adjective', 
      example: 'Dilaw ang araw sa umaga.',
      pronunciation: 'di-law'
    },
    
    // Numbers
    'isa': { 
      word: 'isa', 
      definition: 'one; single unit; first number', 
      type: 'number', 
      example: 'Isa lang ang gusto kong hingin.',
      pronunciation: 'i-sa'
    },
    'dalawa': { 
      word: 'dalawa', 
      definition: 'two; pair; second number', 
      type: 'number', 
      example: 'Dalawa ang mata at dalawa ang kamay.',
      pronunciation: 'da-la-wa'
    },
    'tatlo': { 
      word: 'tatlo', 
      definition: 'three; trio; third number', 
      type: 'number', 
      example: 'Tatlo ang anak nila.',
      pronunciation: 'tat-lo'
    },
    
    // Advanced vocabulary
    'kalikasan': { 
      word: 'kalikasan', 
      definition: 'nature; environment; natural world', 
      type: 'noun', 
      example: 'Kailangan nating alagaan ang kalikasan.',
      pronunciation: 'ka-li-ka-san'
    },
    'kultura': { 
      word: 'kultura', 
      definition: 'culture; traditions and customs of a people', 
      type: 'noun', 
      example: 'Mayaman ang kultura ng Pilipinas.',
      pronunciation: 'kul-tu-ra',
      etymology: 'Spanish: cultura'
    },
    'kapayapaan': { 
      word: 'kapayapaan', 
      definition: 'peace; harmony; absence of conflict', 
      type: 'noun', 
      example: 'Hinahangad namin ang kapayapaan sa mundo.',
      pronunciation: 'ka-pa-ya-pa-an'
    },
    'edukasyon': { 
      word: 'edukasyon', 
      definition: 'education; learning; schooling', 
      type: 'noun', 
      example: 'Mahalaga ang edukasyon sa kinabukasan.',
      pronunciation: 'e-du-kas-yon',
      etymology: 'Spanish: educación'
    }
  };

  const searchKey = word.toLowerCase().trim();
  const foundWord = enhancedDatabase[searchKey];
  
  if (foundWord) {
    return [foundWord];
  }

  // Partial matching
  const partialMatches = Object.values(enhancedDatabase).filter(entry =>
    entry.word.toLowerCase().includes(searchKey) ||
    entry.definition.toLowerCase().includes(searchKey)
  );

  if (partialMatches.length > 0) {
    return partialMatches.slice(0, 5);
  }

  // Suggestions
  const suggestions = Object.keys(enhancedDatabase)
    .filter(key => key.startsWith(searchKey.charAt(0)))
    .slice(0, 10);

  return [{
    word: word,
    definition: `Word not found. Try: ${suggestions.join(', ')} or common words like: kumusta, salamat, mahal, pamilya, bahay, pagkain`,
    type: 'suggestion'
  }];
};
