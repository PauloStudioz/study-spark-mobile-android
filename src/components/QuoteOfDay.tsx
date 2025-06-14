
import React, { useState, useEffect } from 'react';
import { RefreshCw, Quote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface QuoteData {
  text: string;
  author: string;
}

const QuoteOfDay = () => {
  const { isDarkMode } = useTheme();
  const [quote, setQuote] = useState<QuoteData>({ text: '', author: '' });
  const [isLoading, setIsLoading] = useState(true);

  const fallbackQuotes = [
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
    { text: "Study hard what interests you the most in the most undisciplined, irreverent and original manner possible.", author: "Richard Feynman" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" }
  ];

  const fetchQuote = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.quotable.io/random?tags=education|inspirational');
      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }
      const data = await response.json();
      setQuote({
        text: data.content,
        author: data.author
      });
    } catch (err) {
      const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      setQuote(randomQuote);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('quote-date');
    const savedQuote = localStorage.getItem('daily-quote');

    if (savedDate === today && savedQuote) {
      setQuote(JSON.parse(savedQuote));
      setIsLoading(false);
    } else {
      fetchQuote();
    }
  }, []);

  useEffect(() => {
    if (quote.text && !isLoading) {
      const today = new Date().toDateString();
      localStorage.setItem('quote-date', today);
      localStorage.setItem('daily-quote', JSON.stringify(quote));
    }
  }, [quote, isLoading]);

  const refreshQuote = () => {
    fetchQuote();
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
