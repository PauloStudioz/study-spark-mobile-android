import React from 'react';
import { motion } from 'framer-motion';
import { Timer, Calculator, BookOpen, Brain, CheckSquare, HelpCircle, BarChart3, StickyNote, Calendar, GraduationCap, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  const { getThemeColors, isDarkMode } = useTheme();
  const colors = getThemeColors();

  // Organized into logical groups
  const navItems = [
    // Core Study
    { id: 'timer', icon: Timer, label: 'Timer' },
    { id: 'todo', icon: CheckSquare, label: 'Todo' },
    { id: 'quiz', icon: HelpCircle, label: 'Quiz' },
    { id: 'math', icon: Calculator, label: 'Math' },
    // Productivity
    { id: 'grades', icon: GraduationCap, label: 'Grades' },
    { id: 'schedule', icon: Calendar, label: 'Schedule' },
    { id: 'analytics', icon: BarChart3, label: 'Stats' },
    // Learning Tools
    { id: 'flashcards', icon: Brain, label: 'Cards' },
    { id: 'dictionary', icon: BookOpen, label: 'Dict' },
    // Other/Extras
    { id: 'notes', icon: StickyNote, label: 'Notes' },
    { id: 'quote', icon: MessageCircle, label: 'Quote' },
  ];

  // Only display the most relevant tabs; move less common options to the end or consider hiding if user requests
  // Here, keep 9 tabs, but easy to restore if needed
  const mainTabs = navItems.slice(0, 9);
  const moreTabs = navItems.slice(9);

  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${
      isDarkMode 
        ? 'bg-gray-800/95 border-t border-gray-700' 
        : `bg-gradient-to-r ${colors.headerGradient}`
    } p-2 shadow-lg rounded-t-2xl max-w-md mx-auto backdrop-blur-sm`}>
      {/* Organized single row - main tabs */}
      <div className="grid grid-cols-9 gap-1">
        {mainTabs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center justify-center p-2 min-w-0 relative h-14 transition-all duration-200 ${
                isActive 
                  ? isDarkMode 
                    ? 'text-blue-400 bg-blue-900/30' 
                    : 'text-white bg-white/20'
                  : isDarkMode 
                    ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-700/50' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute inset-0 ${
                    isDarkMode ? 'bg-blue-500/20' : 'bg-white/20'
                  } rounded-lg`}
                  initial={false}
                  transition={{ duration: 0.2 }}
                />
              )}
              <Icon size={18} className="relative z-10 mb-1" />
              <span className="text-xs font-medium relative z-10 truncate leading-tight">
                {item.label}
              </span>
            </Button>
          );
        })}
        {/* If you want to display more/hideable tabs, add them below or in a "More" menu */}
      </div>
      {/* Optional: add moreTabs using a dropdown in the future if needed */}
    </nav>
  );
};

export default Navigation;
