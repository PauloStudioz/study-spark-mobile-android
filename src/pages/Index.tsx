
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PomodoroTimer from '../components/PomodoroTimer';
import AdvancedMathSolver from '../components/AdvancedMathSolver';
import Dictionary from '../components/Dictionary';
import Flashcards from '../components/Flashcards';
import TodoList from '../components/TodoList';
import QuizMaker from '../components/QuizMaker';
import StudyAnalytics from '../components/StudyAnalytics';
import QuickNotes from '../components/QuickNotes';
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
      default:
        return <PomodoroTimer />;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.gradient} ${isDarkMode ? 'text-white' : ''}`}>
      <div className={`max-w-md mx-auto ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-2xl min-h-screen relative`}>
        <header className={`bg-gradient-to-r ${colors.headerGradient} text-white p-4 rounded-b-3xl shadow-lg relative`}>
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

        <main className="p-4 pb-28 overflow-hidden">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderActiveComponent()}
          </motion.div>
        </main>

        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
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
