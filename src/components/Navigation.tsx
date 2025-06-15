
import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Define main and secondary tabs
const mainTabs = [
  { id: "timer", icon: Timer, label: "Timer" },
  { id: "todo", icon: CheckSquare, label: "Todo" },
  { id: "math", icon: Calculator, label: "Math" },
  { id: "quiz", icon: HelpCircle, label: "Quiz" },
  { id: "more", icon: MoreHorizontal, label: "More" },
];

const secondaryTabs = [
  { id: "back", icon: ChevronLeft, label: "Back" },
  { id: "flashcards", icon: Brain, label: "Cards" },
  { id: "notes", icon: StickyNote, label: "Notes" },
  { id: "grades", icon: GraduationCap, label: "Grades" },
  { id: "schedule", icon: Calendar, label: "Schedule" },
  { id: "analytics", icon: BarChart3, label: "Stats" },
  { id: "dictionary", icon: BookOpen, label: "Dict" },
  { id: "quote", icon: MessageCircle, label: "Quote" },
];

const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  const { getThemeColors, isDarkMode } = useTheme();
  const colors = getThemeColors();

  // Shows if "More" is open
  const [showMoreTabs, setShowMoreTabs] = useState(false);

  // NEW: track which tab is active in the MORE menu
  const [activeSecondaryTab, setActiveSecondaryTab] = useState<string | null>(null);

  // Tabs to render
  const navTabs = showMoreTabs ? secondaryTabs : mainTabs;

  // Effect: if switching to main, reset activeSecondaryTab
  useEffect(() => {
    if (!showMoreTabs) setActiveSecondaryTab(null);
  }, [showMoreTabs]);

  // Function: get which tab is "active" for coloring/highlighting
  const isTabActive = (item: typeof mainTabs[number] | typeof secondaryTabs[number]) => {
    if (!showMoreTabs) {
      return activeTab === item.id;
    } else {
      // Secondary tabs: highlight whichever secondary is selected
      return activeSecondaryTab === item.id;
    }
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0
        ${isDarkMode ? 'bg-gray-800/95 border-t border-gray-700'
        : `bg-gradient-to-r ${colors.headerGradient}`}
        p-2 shadow-lg rounded-t-2xl max-w-md mx-auto
        backdrop-blur-sm z-50 flex flex-col items-center gap-1`
      }
    >
      {/* Main or More-tabbed row */}
      <div
        className={`flex flex-row gap-1 w-full justify-center`}
      >
        {navTabs.map((item) => {
          const Icon = item.icon;
          const isActive = isTabActive(item);
          const isSpecial =
            (!showMoreTabs && item.id === "more") ||
            (showMoreTabs && item.id === "back");

          return (
            <Button
              key={item.id}
              onClick={() => {
                if (!showMoreTabs && item.id === "more") {
                  setShowMoreTabs(true);
                } else if (showMoreTabs && item.id === "back") {
                  setShowMoreTabs(false);
                } else if (!isSpecial) {
                  if (!showMoreTabs) {
                    setActiveTab(item.id);
                  } else {
                    setActiveTab(item.id); // Set this secondary tab as the active content
                    setActiveSecondaryTab(item.id); // Mark it as active in nav bar
                  }
                  // Don't close the "More" menu after clicking a secondary tab - keep it open
                }
              }}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center justify-center p-2 min-w-0 relative h-14 transition-all duration-200 flex-1
                ${isActive
                  ? isDarkMode
                    ? 'text-blue-400 bg-blue-900/30'
                    : 'text-white bg-white/20'
                  : isDarkMode
                    ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-700/50'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }
                ${isSpecial ? "font-semibold" : ""}
              `}
              style={{ minWidth: 0, flex: "1 1 0%" }}
            >
              {isActive && !isSpecial && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute inset-0 ${isDarkMode ? 'bg-blue-500/20' : 'bg-white/20'} rounded-lg`}
                  initial={false}
                  transition={{ duration: 0.2 }}
                />
              )}
              <Icon size={20} className="relative z-10 mb-1" />
              <span className="text-xs font-medium relative z-10 truncate leading-tight">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;

