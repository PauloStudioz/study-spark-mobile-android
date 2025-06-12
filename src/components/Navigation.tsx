
import React from 'react';
import { motion } from 'framer-motion';
import { Timer, Calculator, BookOpen, Brain, CheckSquare, HelpCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  const { currentTheme } = useTheme();

  const navItems = [
    { id: 'timer', icon: Timer, label: 'Timer' },
    { id: 'quiz', icon: HelpCircle, label: 'Quiz' },
    { id: 'math', icon: Calculator, label: 'Math' },
    { id: 'dictionary', icon: BookOpen, label: 'Dictionary' },
    { id: 'flashcards', icon: Brain, label: 'Cards' },
    { id: 'todo', icon: CheckSquare, label: 'Todo' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r ${currentTheme.headerGradient} p-3 shadow-lg rounded-t-3xl max-w-md mx-auto`}>
      <div className="grid grid-cols-4 gap-2">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              variant="ghost"
              size="lg"
              className={`flex flex-col items-center space-y-1 p-3 min-w-0 relative h-auto ${
                isActive ? 'text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/20 rounded-xl"
                  initial={false}
                  transition={{ duration: 0.2 }}
                />
              )}
              <Icon size={24} className="relative z-10" />
              <span className="text-xs font-medium relative z-10 truncate">
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-2">
        {navItems.slice(4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              variant="ghost"
              size="lg"
              className={`flex flex-col items-center space-y-1 p-3 min-w-0 relative h-auto ${
                isActive ? 'text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab2"
                  className="absolute inset-0 bg-white/20 rounded-xl"
                  initial={false}
                  transition={{ duration: 0.2 }}
                />
              )}
              <Icon size={24} className="relative z-10" />
              <span className="text-xs font-medium relative z-10 truncate">
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
