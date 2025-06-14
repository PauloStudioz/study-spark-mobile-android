
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Calendar, BarChart3, StickyNote, Brain, GraduationCap, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type RadialFeature = {
  id: string;
  icon: React.ElementType;
  label: string;
};

const features: RadialFeature[] = [
  { id: "flashcards", icon: Brain, label: "Cards" },
  { id: "notes", icon: StickyNote, label: "Notes" },
  { id: "grades", icon: GraduationCap, label: "Grades" },
  { id: "schedule", icon: Calendar, label: "Schedule" },
  { id: "analytics", icon: BarChart3, label: "Stats" },
  { id: "dictionary", icon: BookOpen, label: "Dict" },
  { id: "quote", icon: MessageCircle, label: "Quote" },
];

interface FloatingRadialMenuProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
}

const RADIUS = 90; // px, spacing from center for radial effect

const FloatingRadialMenu: React.FC<FloatingRadialMenuProps> = ({ isOpen, onClose, setActiveTab }) => {
  // Show the menu items in a circle
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Semi-transparent fullscreen overlay */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Radial menu center */}
          <div className="fixed bottom-24 left-1/2 z-50" style={{ transform: "translateX(-50%)" }}>
            {features.map((item, i) => {
              const angle = (i / features.length) * 2 * Math.PI - Math.PI / 2;
              const x = Math.cos(angle) * RADIUS;
              const y = Math.sin(angle) * RADIUS;
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  initial={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
                  animate={{ x, y, scale: 1, opacity: 1 }}
                  exit={{ x: 0, y: 0, scale: 0.1, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 480, damping: 30, delay: i * 0.045 }}
                  className="absolute flex flex-col items-center justify-center bg-white dark:bg-gray-800 text-blue-500 hover:scale-110 shadow-lg rounded-full w-14 h-14 border-2 border-blue-400 focus:outline-none transition-transform z-50"
                  style={{ left: "50%", top: "50%", marginLeft: -28, marginTop: -28 }}
                  onClick={e => {
                    e.stopPropagation();
                    setActiveTab(item.id);
                    onClose();
                  }}
                  type="button"
                  tabIndex={0}
                  aria-label={item.label}
                >
                  <Icon size={22} className="mx-auto mb-0.5" />
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FloatingRadialMenu;
