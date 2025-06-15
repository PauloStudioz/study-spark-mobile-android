
import React, { useState, useEffect } from 'react';
import { RefreshCw, Quote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface QuoteData {
  text: string;
  author: string;
}

const fallbackQuotes: QuoteData[] = [
  // --- Original Quotes ---
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Study hard what interests you the most in the most undisciplined, irreverent and original manner possible.", author: "Richard Feynman" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Give me six hours to chop down a tree and I will spend the first four sharpening the axe.", author: "Abraham Lincoln" },
  { text: "Whether you think you can or think you can’t, you’re right.", author: "Henry Ford" },
  { text: "It always seems impossible until it’s done.", author: "Nelson Mandela" },
  { text: "Don’t wish it were easier; wish you were better.", author: "Jim Rohn" },
  { text: "You don’t have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Success is not in what you have, but who you are.", author: "Bo Bennett" },
  { text: "The mind is not a vessel to be filled but a fire to be kindled.", author: "Plutarch" },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent Van Gogh" },
  { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
  { text: "Optimism is the faith that leads to achievement. Nothing can be done without hope and confidence.", author: "Helen Keller" },
  { text: "All progress takes place outside the comfort zone.", author: "Michael John Bobak" },
  { text: "If you’re going through hell, keep going.", author: "Winston Churchill" },
  { text: "Vision without execution is just hallucination.", author: "Thomas Edison" },
  { text: "Believe you can and you’re halfway there.", author: "Theodore Roosevelt" },
  { text: "You miss 100% of the shots you don’t take.", author: "Wayne Gretzky" },
  { text: "Your mind is a powerful thing. When you fill it with positive thoughts, your life will start to change.", author: "Unknown" },
  { text: "Set your goals high, and don't stop till you get there.", author: "Bo Jackson" },
  { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen R. Covey" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Do not wait to strike till the iron is hot, but make it hot by striking.", author: "William Butler Yeats" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Never give up on a dream just because of the time it will take to accomplish it. The time will pass anyway.", author: "Earl Nightingale" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Sharpen your sword before the battle begins.", author: "Mindset Proverb" },
  { text: "Motivation gets you started. Habit keeps you going.", author: "Jim Ryun" },
  { text: "Strength and growth come only through continuous effort and struggle.", author: "Napoleon Hill" },
  // --- Extra Quotes Added ---
  { text: "The best way to predict your future is to create it.", author: "Abraham Lincoln" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Ambition is the path to success. Persistence is the vehicle you arrive in.", author: "Bill Bradley" },
  { text: "The harder you work for something, the greater you’ll feel when you achieve it.", author: "Unknown" },
  { text: "Don’t watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { text: "Perseverance is not a long race; it is many short races one after the other.", author: "Walter Elliot" },
  { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
  { text: "Don’t let what you cannot do interfere with what you can do.", author: "John Wooden" },
  { text: "Doubt kills more dreams than failure ever will.", author: "Suzy Kassem" },
  { text: "Little by little, a little becomes a lot.", author: "Tanzanian Proverb" },
  { text: "Work hard in silence, let your success make the noise.", author: "Frank Ocean" },
  { text: "There is no substitute for hard work.", author: "Thomas Edison" },
  { text: "Learning is a treasure that will follow its owner everywhere.", author: "Chinese Proverb" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Everything you can imagine is real.", author: "Pablo Picasso" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Just believe in yourself. Even if you don’t, pretend that you do and, at some point, you will.", author: "Venus Williams" },
  { text: "Mistakes are proof that you’re trying.", author: "Jennifer Lim" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Success doesn't come from what you do occasionally, it comes from what you do consistently.", author: "Marie Forleo" },
  { text: "If everything was perfect, you would never learn and you would never grow.", author: "Beyoncé" },
  { text: "Shoot for the moon. Even if you miss, you'll land among the stars.", author: "Norman Vincent Peale" },
  { text: "Strive for progress, not perfection.", author: "Unknown" },
  { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "William Butler Yeats" },
  { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
  { text: "Success doesn’t just find you. You have to go out and get it.", author: "Unknown" },
  { text: "Every accomplishment starts with the decision to try.", author: "John F. Kennedy" },
  { text: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca" },
  { text: "Perseverance is failing 19 times and succeeding the 20th.", author: "Julie Andrews" },
  { text: "Education is the key to unlocking the world, a passport to freedom.", author: "Oprah Winfrey" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "You don’t have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "Diligence is the mother of good luck.", author: "Benjamin Franklin" },
  { text: "A winner is a dreamer who never gives up.", author: "Nelson Mandela" },
  { text: "Study while others are sleeping; work while others are loafing; prepare while others are playing; and dream while others are wishing.", author: "William Arthur Ward" },
  { text: "Small deeds done are better than great deeds planned.", author: "Peter Marshall" },
  { text: "Knowing is not enough; we must apply. Being willing is not enough; we must do.", author: "Leonardo da Vinci" },
  { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
  { text: "Self-belief and hard work will always earn you success.", author: "Virat Kohli" },
  { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
  { text: "The secret to getting ahead is getting started.", author: "Mark Twain" },
  { text: "Doubt kills more dreams than failure ever will.", author: "Suzy Kassem" },
  { text: "You don’t need to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "Excellence is not a skill, it is an attitude.", author: "Ralph Marston" },
  { text: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon" },
  { text: "A little progress each day adds up to big results.", author: "Satya Nani" },
  { text: "Stay positive, work hard, make it happen.", author: "Unknown" },
  { text: "The key to success is to focus our conscious mind on things we desire not things we fear.", author: "Brian Tracy" },
  { text: "Don’t be pushed around by the fears in your mind. Be led by the dreams in your heart.", author: "Roy T. Bennett" },
  { text: "There are no shortcuts to any place worth going.", author: "Beverly Sills" },
  { text: "Try to be a rainbow in someone’s cloud.", author: "Maya Angelou" },
  { text: "Believe in yourself. You are braver than you think, more talented than you know, and capable of more than you imagine.", author: "Roy T. Bennett" },
  { text: "Do one thing every day that scares you.", author: "Eleanor Roosevelt" },
  { text: "Difficult roads often lead to beautiful destinations.", author: "Zig Ziglar" },
  { text: "If you believe in yourself anything is possible.", author: "Miley Cyrus" },
  { text: "Success is not just about making money. It’s about making a difference.", author: "Unknown" },
  { text: "Success isn’t overnight. It’s when every day you get a little better than the day before. It all adds up.", author: "Dwayne Johnson" },
  { text: "Today a reader, tomorrow a leader.", author: "Margaret Fuller" },
  { text: "Succeed in your studies, and let success follow everywhere.", author: "Unknown" },
];

const getRandomQuote = (excludeText: string): QuoteData => {
  let possible = fallbackQuotes.filter(q => q.text !== excludeText);
  if (possible.length === 0) possible = fallbackQuotes;
  return possible[Math.floor(Math.random() * possible.length)];
};

const QuoteOfDay = () => {
  const { isDarkMode } = useTheme();
  const [quote, setQuote] = useState<QuoteData>({ text: '', author: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [quoteDate, setQuoteDate] = useState<string>("");

  // Try to get a new API quote, fallback with fresh (non-repeating) fallback quote
  const fetchQuote = async (forceNew = false) => {
    setIsLoading(true);
    try {
      const today = new Date().toDateString();
      // Try cached for today, unless forcing new
      if (!forceNew) {
        const savedDate = localStorage.getItem('quote-date');
        const savedQuote = localStorage.getItem('daily-quote');
        if (savedDate === today && savedQuote) {
          setQuote(JSON.parse(savedQuote));
          setQuoteDate(savedDate);
          setIsLoading(false);
          return;
        }
      }
      // Try API:
      let gotApiQuote = false;
      try {
        const response = await fetch('https://zenquotes.io/api/today');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        if (Array.isArray(data) && data.length && data[0]?.q && data[0]?.a) {
          const apiQuote = { text: data[0].q, author: data[0].a };
          // Prevent repeating:
          if (apiQuote.text !== quote.text) {
            setQuote(apiQuote);
            setQuoteDate(today);
            localStorage.setItem('quote-date', today);
            localStorage.setItem('daily-quote', JSON.stringify(apiQuote));
            gotApiQuote = true;
          }
        }
      } catch (_err) {}
      // Fallback:
      if (!gotApiQuote) {
        const prevQuote = quote.text;
        const randomQuote = getRandomQuote(prevQuote);
        setQuote(randomQuote);
        setQuoteDate(today);
        localStorage.setItem('quote-date', today);
        localStorage.setItem('daily-quote', JSON.stringify(randomQuote));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote(false);
    // eslint-disable-next-line
  }, []);

  const refreshQuote = () => {
    fetchQuote(true);
  };

  return (
    <div className="flex flex-col justify-center w-full items-center">
      <Card className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/90 border-gray-200'} shadow-xl`}>
        <CardHeader className="text-center pb-2">
          <CardTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-gray-800'} flex items-center justify-center gap-2`}>
            <Quote size={24} className="text-blue-500" />
            Quote of the Day
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="min-h-[120px] flex flex-col justify-center w-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin">
                  <RefreshCw size={24} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                </div>
              </div>
            ) : (
              <>
                <blockquote className={`text-lg italic mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} leading-relaxed`}>
                  "{quote.text}"
                </blockquote>
                <cite className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  — {quote.author}
                </cite>
              </>
            )}
          </div>
          <div className="mt-6">
            <Button
              onClick={refreshQuote}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}
            >
              <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              New Quote
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteOfDay;

