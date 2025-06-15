import React, { useState, useEffect } from 'react';
import { RefreshCw, Quote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { fallbackQuotes, QuoteData } from './quotesList';

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
