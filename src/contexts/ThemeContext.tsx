
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Theme {
  id: string;
  name: string;
  gradient: string;
  headerGradient: string;
  cardGradient: string;
  accentColor: string;
  textColor: string;
  darkGradient: string;
  darkHeaderGradient: string;
  darkCardGradient: string;
  darkAccentColor: string;
  darkTextColor: string;
}

const themes: Theme[] = [
  {
    id: 'blue-purple',
    name: 'Ocean Breeze',
    gradient: 'from-blue-50 via-indigo-50 to-purple-50',
    headerGradient: 'from-blue-600 to-purple-600',
    cardGradient: 'from-blue-50 to-indigo-100',
    accentColor: 'blue-600',
    textColor: 'blue-700',
    darkGradient: 'from-blue-900 via-indigo-900 to-purple-900',
    darkHeaderGradient: 'from-blue-700 to-purple-700',
    darkCardGradient: 'from-blue-800 to-indigo-800',
    darkAccentColor: 'blue-400',
    darkTextColor: 'blue-300'
  },
  {
    id: 'pink-orange',
    name: 'Sunset Glow',
    gradient: 'from-pink-50 via-orange-50 to-red-50',
    headerGradient: 'from-pink-500 to-orange-500',
    cardGradient: 'from-pink-50 to-orange-100',
    accentColor: 'pink-600',
    textColor: 'pink-700',
    darkGradient: 'from-pink-900 via-orange-900 to-red-900',
    darkHeaderGradient: 'from-pink-600 to-orange-600',
    darkCardGradient: 'from-pink-800 to-orange-800',
    darkAccentColor: 'pink-400',
    darkTextColor: 'pink-300'
  },
  {
    id: 'green-teal',
    name: 'Forest Mint',
    gradient: 'from-green-50 via-emerald-50 to-teal-50',
    headerGradient: 'from-green-600 to-teal-600',
    cardGradient: 'from-green-50 to-emerald-100',
    accentColor: 'green-600',
    textColor: 'green-700',
    darkGradient: 'from-green-900 via-emerald-900 to-teal-900',
    darkHeaderGradient: 'from-green-700 to-teal-700',
    darkCardGradient: 'from-green-800 to-emerald-800',
    darkAccentColor: 'green-400',
    darkTextColor: 'green-300'
  },
  {
    id: 'purple-indigo',
    name: 'Cosmic Purple',
    gradient: 'from-purple-50 via-violet-50 to-indigo-50',
    headerGradient: 'from-purple-600 to-indigo-600',
    cardGradient: 'from-purple-50 to-violet-100',
    accentColor: 'purple-600',
    textColor: 'purple-700',
    darkGradient: 'from-purple-900 via-violet-900 to-indigo-900',
    darkHeaderGradient: 'from-purple-700 to-indigo-700',
    darkCardGradient: 'from-purple-800 to-violet-800',
    darkAccentColor: 'purple-400',
    darkTextColor: 'purple-300'
  },
  {
    id: 'amber-yellow',
    name: 'Golden Hour',
    gradient: 'from-amber-50 via-yellow-50 to-orange-50',
    headerGradient: 'from-amber-500 to-yellow-500',
    cardGradient: 'from-amber-50 to-yellow-100',
    accentColor: 'amber-600',
    textColor: 'amber-700',
    darkGradient: 'from-amber-900 via-yellow-900 to-orange-900',
    darkHeaderGradient: 'from-amber-600 to-yellow-600',
    darkCardGradient: 'from-amber-800 to-yellow-800',
    darkAccentColor: 'amber-400',
    darkTextColor: 'amber-300'
  }
];

interface ThemeContextType {
  currentTheme: Theme;
  themes: Theme[];
  setTheme: (themeId: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  getThemeColors: () => {
    gradient: string;
    headerGradient: string;
    cardGradient: string;
    accentColor: string;
    textColor: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedThemeId = localStorage.getItem('studymate-theme');
    const savedDarkMode = localStorage.getItem('studymate-dark-mode') === 'true';
    
    if (savedThemeId) {
      const savedTheme = themes.find(t => t.id === savedThemeId);
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      }
    }
    setIsDarkMode(savedDarkMode);
  }, []);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem('studymate-theme', themeId);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('studymate-dark-mode', newDarkMode.toString());
  };

  const getThemeColors = () => ({
    gradient: isDarkMode ? currentTheme.darkGradient : currentTheme.gradient,
    headerGradient: isDarkMode ? currentTheme.darkHeaderGradient : currentTheme.headerGradient,
    cardGradient: isDarkMode ? currentTheme.darkCardGradient : currentTheme.cardGradient,
    accentColor: isDarkMode ? currentTheme.darkAccentColor : currentTheme.accentColor,
    textColor: isDarkMode ? currentTheme.darkTextColor : currentTheme.textColor,
  });

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      themes, 
      setTheme, 
      isDarkMode, 
      toggleDarkMode, 
      getThemeColors 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
