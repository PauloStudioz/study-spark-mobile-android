import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Calculator, StickyNote, Timer, X, Minus, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';

const FloatingWidgets = () => {
  const { isDarkMode } = useTheme();
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showMiniTimer, setShowMiniTimer] = useState(false);
  
  // Calculator state
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [expression, setExpression] = useState('');

  // Notes state
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('studymate-quick-notes');
    return saved || '';
  });

  useEffect(() => {
    localStorage.setItem('studymate-quick-notes', notes);
  }, [notes]);

  // Mini timer state
  const [miniTimerMinutes, setMiniTimerMinutes] = useState(5);
  const [miniTimerSeconds, setMiniTimerSeconds] = useState(0);
  const [miniTimerActive, setMiniTimerActive] = useState(false);
  const [miniTimerTime, setMiniTimerTime] = useState(0);
  const timerInterval = useRef<number | null>(null);

  // Calculator functions
  const handleNumberClick = (number: string) => {
    if (waitingForOperand) {
      setDisplay(number);
      setExpression(prev => prev + number);
      setWaitingForOperand(false);
    } else {
      const newDisplay = display === '0' ? number : display + number;
      setDisplay(newDisplay);
      if (expression === '0') {
        setExpression(number);
      } else {
        setExpression(prev => prev + number);
      }
    }
  };

  const handleOperationClick = (op: string) => {
    if (previousValue === null) {
      setPreviousValue(parseFloat(display));
    } else if (operation) {
      const result = performCalculation();
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(op);
    setExpression(prev => prev + ` ${op} `);
  };

  const handleEqualsClick = () => {
    if (operation) {
      const result = performCalculation();
      setDisplay(String(result));
      setExpression(prev => prev + ` = ${result}`);
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(false);
    }
  };

  const handleClearClick = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setExpression('');
  };

  const handleDecimalClick = () => {
    if (!display.includes('.')) {
      const newDisplay = display + '.';
      setDisplay(newDisplay);
      setExpression(prev => prev + '.');
    }
  };

  const performCalculation = (): number => {
    const current = parseFloat(display);
    let result = Number(previousValue);

    switch (operation) {
      case '+':
        result += current;
        break;
      case '-':
        result -= current;
        break;
      case '*':
        result *= current;
        break;
      case '/':
        if (current === 0) return 0;
        result /= current;
        break;
      default:
        return current;
    }

    return result;
  };

  // Notes functions
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  // Timer functions
  useEffect(() => {
    if (miniTimerActive && !timerInterval.current) {
      timerInterval.current = window.setInterval(() => {
        setMiniTimerTime((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(timerInterval.current!);
            timerInterval.current = null;
            setMiniTimerActive(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!miniTimerActive && timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [miniTimerActive]);

  useEffect(() => {
    setMiniTimerTime(miniTimerMinutes * 60 + miniTimerSeconds);
  }, [miniTimerMinutes, miniTimerSeconds]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const startMiniTimer = () => {
    setMiniTimerActive(true);
  };

  const pauseMiniTimer = () => {
    setMiniTimerActive(false);
  };

  const resetMiniTimer = () => {
    setMiniTimerActive(false);
    setMiniTimerMinutes(5);
    setMiniTimerSeconds(0);
    setMiniTimerTime(5 * 60);
  };

  return (
    <>
      {/* Main Quick Access Button - Positioned above navigation */}
      <motion.div
        className="fixed bottom-44 left-1/2 transform -translate-x-1/2 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={() => setShowQuickAccess(!showQuickAccess)}
          className={`w-12 h-12 rounded-full shadow-xl border-2 ${
            isDarkMode
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-400 hover:from-blue-700 hover:to-purple-700'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-300 hover:from-blue-600 hover:to-purple-600'
          } transition-all duration-300`}
        >
          <Zap size={20} className="text-white relative z-10" />
          {/* Pulsing effect */}
          <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping" />
        </Button>
      </motion.div>

      {/* Quick Access Menu */}
      <AnimatePresence>
        {showQuickAccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-60 left-1/2 transform -translate-x-1/2 z-40"
          >
            <Card className={`${
              isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
            } backdrop-blur-sm shadow-2xl`}>
              <CardContent className="p-4">
                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      setShowCalculator(true);
                      setShowQuickAccess(false);
                    }}
                    variant="ghost"
                    className={`flex flex-col items-center space-y-1 p-3 ${
                      isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Calculator size={20} />
                    <span className="text-xs">Calc</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setShowNotes(true);
                      setShowQuickAccess(false);
                    }}
                    variant="ghost"
                    className={`flex flex-col items-center space-y-1 p-3 ${
                      isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    <StickyNote size={20} />
                    <span className="text-xs">Notes</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setShowMiniTimer(true);
                      setShowQuickAccess(false);
                    }}
                    variant="ghost"
                    className={`flex flex-col items-center space-y-1 p-3 ${
                      isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Timer size={20} />
                    <span className="text-xs">Timer</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calculator Widget */}
      <AnimatePresence>
        {showCalculator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-32 left-4 z-50"
          >
            <Card className={`${
              isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
            } backdrop-blur-sm shadow-2xl w-72`}>
              <CardContent className="p-4">
                <div className="mb-3">
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 h-6 overflow-hidden`}>
                    {expression || ''}
                  </div>
                  <div className={`text-right text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {display}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Button onClick={handleClearClick} variant="outline" className="bg-red-100 hover:bg-red-200">
                    C
                  </Button>
                  <Button onClick={() => handleOperationClick('/')} variant="outline">
                    ÷
                  </Button>
                  <Button onClick={() => handleOperationClick('*')} variant="outline">
                    ×
                  </Button>
                  <Button
                    onClick={() => setShowCalculator(false)}
                    variant="ghost"
                    className="text-red-500 hover:bg-red-100"
                  >
                    <X size={20} />
                  </Button>
                  <Button onClick={() => handleNumberClick('7')} variant="ghost">
                    7
                  </Button>
                  <Button onClick={() => handleNumberClick('8')} variant="ghost">
                    8
                  </Button>
                  <Button onClick={() => handleNumberClick('9')} variant="ghost">
                    9
                  </Button>
                  <Button onClick={() => handleOperationClick('-')} variant="outline">
                    -
                  </Button>
                  <Button onClick={() => handleNumberClick('4')} variant="ghost">
                    4
                  </Button>
                  <Button onClick={() => handleNumberClick('5')} variant="ghost">
                    5
                  </Button>
                  <Button onClick={() => handleNumberClick('6')} variant="ghost">
                    6
                  </Button>
                  <Button onClick={() => handleOperationClick('+')} variant="outline">
                    +
                  </Button>
                  <Button onClick={() => handleNumberClick('1')} variant="ghost">
                    1
                  </Button>
                  <Button onClick={() => handleNumberClick('2')} variant="ghost">
                    2
                  </Button>
                  <Button onClick={() => handleNumberClick('3')} variant="ghost">
                    3
                  </Button>
                  <Button onClick={handleEqualsClick} variant="outline" className="row-span-2 bg-blue-100 hover:bg-blue-200">
                    =
                  </Button>
                  <Button onClick={() => handleNumberClick('0')} variant="ghost" className="col-span-2">
                    0
                  </Button>
                  <Button onClick={handleDecimalClick} variant="ghost">
                    .
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Widget */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-4 -translate-y-1/2 z-50"
          >
            <Card className={`${
              isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
            } backdrop-blur-sm shadow-2xl`}>
              <CardContent className="p-4 w-80">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Quick Notes</h3>
                  <Button
                    onClick={() => setShowNotes(false)}
                    variant="ghost"
                    className="text-red-500 hover:bg-red-100"
                  >
                    <X size={20} />
                  </Button>
                </div>
                <textarea
                  placeholder="Write your notes here..."
                  className={`w-full h-48 p-3 rounded-md border resize-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  value={notes}
                  onChange={handleNotesChange}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Timer Widget */}
      <AnimatePresence>
        {showMiniTimer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-32 right-4 z-50"
          >
            <Card className={`${
              isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
            } backdrop-blur-sm shadow-2xl`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Mini Timer</h3>
                  <Button
                    onClick={() => setShowMiniTimer(false)}
                    variant="ghost"
                    className="text-red-500 hover:bg-red-100"
                  >
                    <X size={20} />
                  </Button>
                </div>
                <div className="text-4xl font-bold text-center mb-2">
                  {formatTime(miniTimerTime)}
                </div>
                <div className="flex space-x-2 justify-center mb-3">
                  <Button
                    onClick={startMiniTimer}
                    disabled={miniTimerActive}
                    className="bg-green-500 hover:bg-green-600 rounded-full"
                  >
                    <Plus size={16} />
                  </Button>
                  <Button
                    onClick={pauseMiniTimer}
                    disabled={!miniTimerActive}
                    className="bg-yellow-500 hover:bg-yellow-600 rounded-full"
                  >
                    <Minus size={16} />
                  </Button>
                  <Button
                    onClick={resetMiniTimer}
                    className="bg-red-500 hover:bg-red-600 rounded-full"
                  >
                    <RotateCcw size={16} />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm">Minutes:</label>
                  <Input
                    type="number"
                    value={miniTimerMinutes}
                    onChange={(e) => setMiniTimerMinutes(parseInt(e.target.value) || 0)}
                    className="w-16 text-sm rounded-md"
                    min="0"
                    max="60"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingWidgets;
