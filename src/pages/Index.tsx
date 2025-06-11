
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Calculator, Brain, CheckSquare, Book, FileText } from 'lucide-react';
import PomodoroTimer from '../components/PomodoroTimer';
import MathSolver from '../components/MathSolver';
import Dictionary from '../components/Dictionary';
import Flashcards from '../components/Flashcards';
import TodoList from '../components/TodoList';
import QuizMaker from '../components/QuizMaker';
import Navigation from '../components/Navigation';

const Index = () => {
  const [activeTab, setActiveTab] = useState('timer');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'timer':
        return <PomodoroTimer />;
      case 'quiz':
        return <QuizMaker />;
      case 'math':
        return <MathSolver />;
      case 'dictionary':
        return <Dictionary />;
      case 'flashcards':
        return <Flashcards />;
      case 'todo':
        return <TodoList />;
      default:
        return <PomodoroTimer />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen relative">
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-b-3xl shadow-lg">
          <motion.h1 
            className="text-2xl font-bold text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            StudyMate
          </motion.h1>
          <p className="text-center text-blue-100 mt-1">Your Ultimate Study Companion</p>
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
      </div>
    </div>
  );
};

export default Index;
