
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
    { id: 'analytics', icon: BarChart3, label: 'Stats' },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r ${currentTheme.headerGradient} p-2 shadow-lg rounded-t-3xl max-w-md mx-auto`}>
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 p-2 min-w-0 relative ${
                isActive ? 'text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/20 rounded-lg"
                  initial={false}
                  transition={{ duration: 0.2 }}
                />
              )}
              <Icon size={18} className="relative z-10" />
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
