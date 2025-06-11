
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calculator, BookOpen, Brain, CheckSquare } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  const tabs = [
    { id: 'timer', icon: Clock, label: 'Timer' },
    { id: 'math', icon: Calculator, label: 'Math' },
    { id: 'dictionary', icon: BookOpen, label: 'Dictionary' },
    { id: 'flashcards', icon: Brain, label: 'Cards' },
    { id: 'todo', icon: CheckSquare, label: 'Tasks' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-4 py-2 rounded-t-3xl shadow-lg">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className={`p-2 rounded-xl ${isActive ? 'bg-blue-100' : ''}`}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isActive ? '#dbeafe' : 'transparent'
                }}
                transition={{ duration: 0.2 }}
              >
                <Icon size={20} />
              </motion.div>
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
