import React from 'react';
import { motion } from 'framer-motion';
import {
  Timer,
  Calculator,
  BookOpen,
  Brain,
  CheckSquare,
  HelpCircle,
  BarChart3,
  StickyNote,
  Calendar,
  GraduationCap,
  MessageCircle,
  CirclePlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import FloatingRadialMenu from "./FloatingRadialMenu";
import { useState } from "react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const mainTabs = [
  { id: "timer", icon: Timer, label: "Timer" },
  { id: "todo", icon: CheckSquare, label: "Todo" },
  { id: "math", icon: Calculator, label: "Math" },
  { id: "quiz", icon: HelpCircle, label: "Quiz" },
];

const secondaryTabs = [
  { id: "flashcards", icon: Brain, label: "Cards" },
  { id: "notes", icon: StickyNote, label: "Notes" },
  { id: "grades", icon: GraduationCap, label: "Grades" },
  // Center: Plus button here (not in this array)
  { id: "schedule", icon: Calendar, label: "Schedule" },
  { id: "analytics", icon: BarChart3, label: "Stats" },
  { id: "dictionary", icon: BookOpen, label: "Dict" },
  { id: "quote", icon: MessageCircle, label: "Quote" },
];
// For 7 items: left (3), center (plus), right (3)
const leftTabs = secondaryTabs.slice(0, 3);
const rightTabs = secondaryTabs.slice(3);

const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  const { getThemeColors, isDarkMode } = useTheme();
  const colors = getThemeColors();

  // Plus menu state
  const [radialOpen, setRadialOpen] = useState(false);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0
        ${isDarkMode ? 'bg-gray-800/95 border-t border-gray-700'
        : `bg-gradient-to-r ${colors.headerGradient}`}
        p-2 shadow-lg rounded-t-2xl max-w-md mx-auto
        backdrop-blur-sm z-50 flex flex-col items-center gap-1`
      }
    >
      {/* Top row: Main tools only */}
      <div className="grid grid-cols-4 gap-1 w-full">
        {mainTabs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center justify-center p-2 min-w-0 relative h-14 transition-all duration-200
                ${isActive
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
                  className={`absolute inset-0 ${isDarkMode ? 'bg-blue-500/20' : 'bg-white/20'} rounded-lg`}
                  initial={false}
                  transition={{ duration: 0.2 }}
                />
              )}
              <Icon size={18} className="relative z-10 mb-1" />
              <span className="text-xs font-medium relative z-10 truncate leading-tight">{item.label}</span>
            </Button>
          );
        })}
      </div>
      {/* Plus button in center */}
      <div className="flex justify-center w-full mt-2 relative z-30">
        <Button
          variant="ghost"
          size="icon"
          className={`
            !rounded-full !h-14 !w-14 border-2 transition-all duration-200
            ${isDarkMode
              ? 'border-blue-400 bg-blue-500/20 text-blue-400 hover:bg-blue-800/40'
              : 'border-blue-400 bg-white/80 text-blue-600 hover:bg-blue-100'
            }
            shadow-xl z-30
          `}
          style={{
            boxShadow: isDarkMode
              ? '0 2px 8px 0 rgba(34, 139, 230, 0.14)'
              : '0 2px 8px 0 rgba(28, 100, 242, 0.13)',
          }}
          aria-label="More features"
          onClick={() => setRadialOpen(true)}
        >
          <CirclePlus size={32} />
        </Button>
      </div>
      <FloatingRadialMenu
        isOpen={radialOpen}
        onClose={() => setRadialOpen(false)}
        setActiveTab={setActiveTab}
      />
    </nav>
  );
};

export default Navigation;
