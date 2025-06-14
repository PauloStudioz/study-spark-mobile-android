import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Timer, Calculator, StickyNote, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';

const FloatingWidgets = () => {
  const { getThemeColors, isDarkMode } = useTheme();
  const colors = getThemeColors();
  const { userStats } = useGamification();
  
  const [widgets, setWidgets] = useState({
    level: { visible: true, minimized: false, position: { x: 20, y: 20 } },
    quickTimer: { visible: false, minimized: false, position: { x: 200, y: 20 } },
    miniCalc: { visible: false, minimized: false, position: { x: 20, y: 200 } },
    quickNote: { visible: false, minimized: false, position: { x: 200, y: 200 } }
  });

  const [quickTimerTime, setQuickTimerTime] = useState(5);
  const [quickTimerActive, setQuickTimerActive] = useState(false);
  const [quickNote, setQuickNote] = useState('');
  const [calcResult, setCalcResult] = useState('0');
  const [calcInput, setCalcInput] = useState('');

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

  // Level Widget (always visible, better positioned)
  const LevelWidget = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-4 right-4 z-40"
    >
      <Card className={`bg-gradient-to-r ${colors.headerGradient} border-0 shadow-lg`}>
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Crown size={24} className="text-yellow-300" />
              <div className="absolute -top-1 -right-1 bg-yellow-400 text-xs font-bold text-gray-800 rounded-full w-5 h-5 flex items-center justify-center">
                {userStats.level}
              </div>
            </div>
            <div className="text-white">
              <div className="text-sm font-semibold">Level {userStats.level}</div>
              <div className="text-xs opacity-80">{userStats.totalPoints} XP</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

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
      <Card className={`w-48 bg-gradient-to-br ${colors.cardGradient} shadow-lg ${isDarkMode ? 'bg-opacity-90' : ''}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <Timer size={16} className={isDarkMode ? 'text-white' : `text-${colors.textColor}`} />
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
              <input
                type="number"
                value={quickTimerTime}
                onChange={(e) => setQuickTimerTime(parseInt(e.target.value) || 5)}
                className={`w-full text-center text-sm p-1 rounded ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                }`}
                min="1"
                max="60"
              />
              <Button
                onClick={() => setQuickTimerActive(!quickTimerActive)}
                size="sm"
                className={`w-full text-xs ${quickTimerActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
              >
                {quickTimerActive ? 'Stop' : 'Start'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  // Mini Calculator Widget
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
      <Card className={`w-40 bg-gradient-to-br ${colors.cardGradient} shadow-lg ${isDarkMode ? 'bg-opacity-90' : ''}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <Calculator size={16} className={isDarkMode ? 'text-white' : `text-${colors.textColor}`} />
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
              <div className={`text-right text-sm p-1 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}>
                {calcResult}
              </div>
              <input
                type="text"
                value={calcInput}
                onChange={(e) => setCalcInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    try {
                      const result = eval(calcInput);
                      setCalcResult(result.toString());
                    } catch {
                      setCalcResult('Error');
                    }
                  }
                }}
                className={`w-full text-sm p-1 rounded ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                }`}
                placeholder="Enter calculation..."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  // Quick Note Widget
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
      <Card className={`w-52 bg-gradient-to-br ${colors.cardGradient} shadow-lg ${isDarkMode ? 'bg-opacity-90' : ''}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <StickyNote size={16} className={isDarkMode ? 'text-white' : `text-${colors.textColor}`} />
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
            <textarea
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              className={`w-full h-20 text-xs p-2 rounded resize-none ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
              }`}
              placeholder="Quick note..."
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <>
      {/* Level Widget - Always visible */}
      <LevelWidget />
      
      {/* Other Widgets */}
      <AnimatePresence>
        {widgets.quickTimer.visible && <QuickTimerWidget />}
        {widgets.miniCalc.visible && <MiniCalcWidget />}
        {widgets.quickNote.visible && <QuickNoteWidget />}
      </AnimatePresence>

      {/* Widget Toggle Menu */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed left-4 top-1/2 transform -translate-y-1/2 z-30 space-y-2"
      >
        <Button
          onClick={() => toggleWidget('quickTimer')}
          variant="outline"
          size="sm"
          className={`rounded-full p-2 ${widgets.quickTimer.visible ? 'bg-blue-500 text-white' : ''}`}
        >
          <Timer size={16} />
        </Button>
        <Button
          onClick={() => toggleWidget('miniCalc')}
          variant="outline"
          size="sm"
          className={`rounded-full p-2 ${widgets.miniCalc.visible ? 'bg-blue-500 text-white' : ''}`}
        >
          <Calculator size={16} />
        </Button>
        <Button
          onClick={() => toggleWidget('quickNote')}
          variant="outline"
          size="sm"
          className={`rounded-full p-2 ${widgets.quickNote.visible ? 'bg-blue-500 text-white' : ''}`}
        >
          <StickyNote size={16} />
        </Button>
      </motion.div>
    </>
  );
};

export default FloatingWidgets;
