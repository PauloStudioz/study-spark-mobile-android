import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Timer, Calculator, StickyNote, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';

const FloatingWidgets = () => {
  const { getThemeColors, isDarkMode } = useTheme();
  const colors = getThemeColors();
  
  const [widgets, setWidgets] = useState({
    quickTimer: { visible: false, minimized: false, position: { x: 200, y: 20 } },
    miniCalc: { visible: false, minimized: false, position: { x: 20, y: 200 } },
    quickNote: { visible: false, minimized: false, position: { x: 200, y: 200 } }
  });

  const [quickTimerTime, setQuickTimerTime] = useState(5);
  const [quickTimerActive, setQuickTimerActive] = useState(false);
  const [quickNote, setQuickNote] = useState('');
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcExpression, setCalcExpression] = useState('');
  const [newNumber, setNewNumber] = useState(true);

  const toggleWidget = (widgetId: keyof typeof widgets) => {
    setWidgets(prev => ({
      ...prev,
      [widgetId]: { ...prev[widgetId], visible: !prev[widgetId].visible }
    }));
  };

  const minimizeWidget = (widgetId: keyof typeof widgets) => {
    setWidgets(prev => ({
      ...prev,
      [widgetId]: { ...prev[widgetId], minimized: !prev[widgetId].minimized }
    }));
  };

  const closeWidget = (widgetId: keyof typeof widgets) => {
    setWidgets(prev => ({
      ...prev,
      [widgetId]: { ...prev[widgetId], visible: false }
    }));
  };

  // Calculator functions
  const inputNumber = (num: string) => {
    if (newNumber) {
      setCalcDisplay(num);
      setNewNumber(false);
    } else {
      setCalcDisplay(calcDisplay === '0' ? num : calcDisplay + num);
    }
  };

  const inputOperator = (op: string) => {
    setCalcExpression(calcDisplay + ' ' + op + ' ');
    setNewNumber(true);
  };

  const calculate = () => {
    try {
      const result = eval(calcExpression + calcDisplay);
      setCalcDisplay(result.toString());
      setCalcExpression('');
      setNewNumber(true);
    } catch {
      setCalcDisplay('Error');
      setCalcExpression('');
      setNewNumber(true);
    }
  };

  const clearCalc = () => {
    setCalcDisplay('0');
    setCalcExpression('');
    setNewNumber(true);
  };

  // Quick Timer Widget
  const QuickTimerWidget = () => (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed z-40"
      style={{ x: widgets.quickTimer.position.x, y: widgets.quickTimer.position.y }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <Card className={`w-48 ${isDarkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90'} shadow-lg backdrop-blur-sm`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <Timer size={16} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
            <div className="flex space-x-1">
              <Button
                onClick={() => minimizeWidget('quickTimer')}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                {widgets.quickTimer.minimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
              </Button>
              <Button
                onClick={() => closeWidget('quickTimer')}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <X size={12} />
              </Button>
            </div>
          </div>
          
          {!widgets.quickTimer.minimized && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={quickTimerTime}
                  onChange={(e) => setQuickTimerTime(parseInt(e.target.value) || 1)}
                  className={`w-16 text-center text-sm p-1 rounded ${
                    isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 border-gray-300'
                  } border`}
                  min="1"
                  max="60"
                />
                <span className="text-xs">min</span>
              </div>
              <Button
                onClick={() => setQuickTimerActive(!quickTimerActive)}
                size="sm"
                className={`w-full text-xs ${quickTimerActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
              >
                {quickTimerActive ? 'Stop Timer' : 'Start Timer'}
              </Button>
              {quickTimerActive && (
                <div className="text-center text-lg font-mono">
                  {String(Math.floor(quickTimerTime)).padStart(2, '0')}:00
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  // Mini Calculator Widget (restored to calculator look)
  const MiniCalcWidget = () => (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed z-40"
      style={{ x: widgets.miniCalc.position.x, y: widgets.miniCalc.position.y }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <Card className={`w-56 ${isDarkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90'} shadow-lg backdrop-blur-sm`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <Calculator size={16} className={isDarkMode ? 'text-green-400' : 'text-green-600'} />
            <div className="flex space-x-1">
              <Button
                onClick={() => minimizeWidget('miniCalc')}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                {widgets.miniCalc.minimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
              </Button>
              <Button
                onClick={() => closeWidget('miniCalc')}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <X size={12} />
              </Button>
            </div>
          </div>
          
          {!widgets.miniCalc.minimized && (
            <div className="space-y-2">
              <div className={`text-right text-lg p-2 rounded min-h-[40px] ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} font-mono border-2 border-gray-300`}>
                <div className="text-xs text-gray-500">{calcExpression}</div>
                <div>{calcDisplay}</div>
              </div>
              
              <div className="grid grid-cols-4 gap-1">
                <Button onClick={clearCalc} variant="outline" size="sm" className="text-xs bg-red-100 hover:bg-red-200">C</Button>
                <Button onClick={() => inputOperator('/')} variant="outline" size="sm" className="text-xs">÷</Button>
                <Button onClick={() => inputOperator('*')} variant="outline" size="sm" className="text-xs">×</Button>
                <Button onClick={() => setCalcDisplay(calcDisplay.slice(0, -1) || '0')} variant="outline" size="sm" className="text-xs">⌫</Button>
                
                <Button onClick={() => inputNumber('7')} variant="outline" size="sm" className="text-xs">7</Button>
                <Button onClick={() => inputNumber('8')} variant="outline" size="sm" className="text-xs">8</Button>
                <Button onClick={() => inputNumber('9')} variant="outline" size="sm" className="text-xs">9</Button>
                <Button onClick={() => inputOperator('-')} variant="outline" size="sm" className="text-xs">-</Button>
                
                <Button onClick={() => inputNumber('4')} variant="outline" size="sm" className="text-xs">4</Button>
                <Button onClick={() => inputNumber('5')} variant="outline" size="sm" className="text-xs">5</Button>
                <Button onClick={() => inputNumber('6')} variant="outline" size="sm" className="text-xs">6</Button>
                <Button onClick={() => inputOperator('+')} variant="outline" size="sm" className="text-xs">+</Button>
                
                <Button onClick={() => inputNumber('1')} variant="outline" size="sm" className="text-xs">1</Button>
                <Button onClick={() => inputNumber('2')} variant="outline" size="sm" className="text-xs">2</Button>
                <Button onClick={() => inputNumber('3')} variant="outline" size="sm" className="text-xs">3</Button>
                <Button onClick={calculate} variant="default" size="sm" className="text-xs bg-blue-500 hover:bg-blue-600 row-span-2">=</Button>
                
                <Button onClick={() => inputNumber('0')} variant="outline" size="sm" className="text-xs col-span-2">0</Button>
                <Button onClick={() => inputNumber('.')} variant="outline" size="sm" className="text-xs">.</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  // Quick Note Widget (restored to note look)
  const QuickNoteWidget = () => (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed z-40"
      style={{ x: widgets.quickNote.position.x, y: widgets.quickNote.position.y }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <Card className={`w-64 ${isDarkMode ? 'bg-yellow-900/90 text-yellow-100' : 'bg-yellow-100/90'} shadow-lg backdrop-blur-sm border-yellow-300`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <StickyNote size={16} className={isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} />
            <div className="flex space-x-1">
              <Button
                onClick={() => minimizeWidget('quickNote')}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                {widgets.quickNote.minimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
              </Button>
              <Button
                onClick={() => closeWidget('quickNote')}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <X size={12} />
              </Button>
            </div>
          </div>
          
          {!widgets.quickNote.minimized && (
            <div>
              <textarea
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                className={`w-full h-32 text-sm p-2 rounded resize-none border-none outline-none ${
                  isDarkMode ? 'bg-yellow-800/50 text-yellow-100 placeholder-yellow-400' : 'bg-yellow-50 text-yellow-900 placeholder-yellow-600'
                }`}
                placeholder="Quick note..."
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <>
      {/* Other Widgets */}
      <AnimatePresence>
        {widgets.quickTimer.visible && <QuickTimerWidget />}
        {widgets.miniCalc.visible && <MiniCalcWidget />}
        {widgets.quickNote.visible && <QuickNoteWidget />}
      </AnimatePresence>

      {/* Widget Toggle Menu - Positioned in middle of tabs */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2"
      >
        <Button
          onClick={() => toggleWidget('quickTimer')}
          variant="outline"
          size="sm"
          className={`rounded-full p-2 ${widgets.quickTimer.visible ? 'bg-blue-500 text-white' : isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} shadow-lg`}
        >
          <Timer size={16} />
        </Button>
        <Button
          onClick={() => toggleWidget('miniCalc')}
          variant="outline"
          size="sm"
          className={`rounded-full p-2 ${widgets.miniCalc.visible ? 'bg-green-500 text-white' : isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} shadow-lg`}
        >
          <Calculator size={16} />
        </Button>
        <Button
          onClick={() => toggleWidget('quickNote')}
          variant="outline"
          size="sm"
          className={`rounded-full p-2 ${widgets.quickNote.visible ? 'bg-yellow-500 text-white' : isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} shadow-lg`}
        >
          <StickyNote size={16} />
        </Button>
      </motion.div>
    </>
  );
};

export default FloatingWidgets;
