
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImmersivePomodoroTimer from '../components/ImmersivePomodoroTimer';
import AdvancedMathSolver from '../components/AdvancedMathSolver';
import Dictionary from '../components/Dictionary';
import Flashcards from '../components/Flashcards';
import TodoList from '../components/TodoList';
import QuizMaker from '../components/QuizMaker';
import Navigation from '../components/Navigation';
import Settings from '../components/Settings';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

const AppContent = () => {
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('timer');
  const [showSettings, setShowSettings] = useState(false);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'timer':
        return <ImmersivePomodoroTimer />;
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
      default:
        return <ImmersivePomodoroTimer />;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.gradient}`}>
      <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen relative">
        <header className={`bg-gradient-to-r ${currentTheme.headerGradient} text-white p-4 rounded-b-3xl shadow-lg relative`}>
          <motion.h1 
            className="text-2xl font-bold text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            StudyMate Pro
          </motion.h1>
          <p className="text-center text-white/80 mt-1">Enhanced Study Companion</p>
          
          <Button
            onClick={() => setShowSettings(true)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2"
          >
            <SettingsIcon size={20} />
          </Button>
        </header>

        <main className="p-4 pb-20">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderActiveComponent()}
          </motion.div>
        </main>

        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default Index;
