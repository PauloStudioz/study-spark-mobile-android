import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import PomodoroTimer from '../components/PomodoroTimer';
import AdvancedMathSolver from '../components/AdvancedMathSolver';
import Dictionary from '../components/Dictionary';
import Flashcards from '../components/Flashcards';
import TodoList from '../components/TodoList';
import QuizMaker from '../components/QuizMaker';
import StudyAnalytics from '../components/StudyAnalytics';
import QuickNotes from '../components/QuickNotes';
import RoutineMaker from '../components/RoutineMaker';
import ScheduleMaker from '../components/ScheduleMaker';
import HabitTracker from '../components/HabitTracker';
import GradeCalculator from '../components/GradeCalculator';
import QuoteOfDay from '../components/QuoteOfDay';
import Navigation from '../components/Navigation';
import Settings from '../components/Settings';
import NotificationCenter from '../components/NotificationCenter';
import PWAInstaller from '../components/PWAInstaller';
import FloatingWidgets from '../components/FloatingWidgets';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { GamificationProvider } from '../contexts/GamificationContext';

const AppContent = () => {
  const { getThemeColors, isDarkMode, toggleDarkMode } = useTheme();
  const colors = getThemeColors();
  const [activeTab, setActiveTab] = useState('timer');
  const [showSettings, setShowSettings] = useState(false);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'timer':
        return <PomodoroTimer />;
      case 'quiz':
        return <QuizMaker />;
      case 'math':
        return <AdvancedMathSolver />;
      case 'dictionary':
        return <Dictionary />;
      case 'flashcards':
        return <Flashcards />;
      case 'todo':
        return <TodoList />;
      case 'analytics':
        return <StudyAnalytics />;
      case 'notes':
        return <QuickNotes />;
      case 'schedule':
        return <ScheduleMaker />;
      case 'grades':
        return <GradeCalculator />;
      case 'quote':
        return <QuoteOfDay />;
      default:
        return <PomodoroTimer />;
    }
  };

  return (
    <div className={`h-screen flex flex-col transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : `bg-gradient-to-br ${colors.gradient}`
    }`}>
      <div className={`max-w-md mx-auto shadow-2xl h-full flex flex-col relative transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-800/80 backdrop-blur-sm' 
          : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <header className={`flex-shrink-0 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600' 
            : `bg-gradient-to-r ${colors.headerGradient}`
        } text-white p-4 rounded-b-3xl shadow-lg relative`}>
          <motion.h1 
            className="text-2xl font-bold text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            StudyMate Pro
          </motion.h1>
          <p className="text-center text-white/80 mt-1">Enhanced Study Companion</p>
          
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button
              onClick={toggleDarkMode}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-full p-2"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            <NotificationCenter />
            <Button
              onClick={() => setShowSettings(true)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-full p-2"
            >
              <SettingsIcon size={20} />
            </Button>
          </div>
        </header>

        <main className={`flex-1 overflow-hidden ${isDarkMode ? 'text-white' : ''}`}>
          <ScrollArea className="h-full">
            <div className="p-4 pb-32">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderActiveComponent()}
              </motion.div>
            </div>
          </ScrollArea>
        </main>

        <div className="flex-shrink-0">
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        
        <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
        <PWAInstaller />
        <FloatingWidgets />
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <ThemeProvider>
      <GamificationProvider>
        <AppContent />
      </GamificationProvider>
    </ThemeProvider>
  );
};

export default Index;
