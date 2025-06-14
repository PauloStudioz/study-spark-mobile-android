
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Theme {
  id: string;
  name: string;
  gradient: string;
  cardGradient: string;
  headerGradient: string;
  textColor: string;
  darkGradient?: string;
  darkCardGradient?: string;
  darkHeaderGradient?: string;
  darkTextColor?: string;
}

const themes: Theme[] = [
  {
    id: 'blue',
    name: 'Ocean Blue',
    gradient: 'from-blue-400 to-blue-600',
    cardGradient: 'from-blue-50 to-white',
    headerGradient: 'from-blue-500 to-blue-700',
    textColor: 'blue-700',
    darkGradient: 'from-slate-900 to-blue-900',
    darkCardGradient: 'from-slate-800 to-blue-900',
    darkHeaderGradient: 'from-blue-600 to-blue-800',
    darkTextColor: 'blue-300'
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    gradient: 'from-purple-400 to-pink-400',
    cardGradient: 'from-purple-50 to-pink-50',
    headerGradient: 'from-purple-500 to-pink-500',
    textColor: 'purple-700',
    darkGradient: 'from-slate-900 to-purple-900',
    darkCardGradient: 'from-slate-800 to-purple-900',
    darkHeaderGradient: 'from-purple-600 to-pink-600',
    darkTextColor: 'purple-300'
  },
  {
    id: 'green',
    name: 'Forest Green',
    gradient: 'from-green-400 to-emerald-500',
    cardGradient: 'from-green-50 to-emerald-50',
    headerGradient: 'from-green-500 to-emerald-600',
    textColor: 'green-700',
    darkGradient: 'from-slate-900 to-green-900',
    darkCardGradient: 'from-slate-800 to-green-900',
    darkHeaderGradient: 'from-green-600 to-emerald-600',
    darkTextColor: 'green-300'
  },
  {
    id: 'orange',
    name: 'Sunset Orange',
    gradient: 'from-orange-400 to-red-400',
    cardGradient: 'from-orange-50 to-red-50',
    headerGradient: 'from-orange-500 to-red-500',
    textColor: 'orange-700',
    darkGradient: 'from-slate-900 to-orange-900',
    darkCardGradient: 'from-slate-800 to-orange-900',
    darkHeaderGradient: 'from-orange-600 to-red-600',
    darkTextColor: 'orange-300'
  },
  {
    id: 'teal',
    name: 'Tropical Teal',
    gradient: 'from-teal-400 to-cyan-400',
    cardGradient: 'from-teal-50 to-cyan-50',
    headerGradient: 'from-teal-500 to-cyan-500',
    textColor: 'teal-700',
    darkGradient: 'from-slate-900 to-teal-900',
    darkCardGradient: 'from-slate-800 to-teal-900',
    darkHeaderGradient: 'from-teal-600 to-cyan-600',
    darkTextColor: 'teal-300'
  }
];

interface ThemeContextType {
  currentTheme: Theme;
  themes: Theme[];
  isDarkMode: boolean;
  setTheme: (themeId: string) => void;
  toggleDarkMode: () => void;
  getThemeColors: () => {
    gradient: string;
    cardGradient: string;
    headerGradient: string;
    textColor: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('studymate-theme');
    const savedDarkMode = localStorage.getItem('studymate-dark-mode');
    
    if (savedTheme) {
      const theme = themes.find(t => t.id === savedTheme);
      if (theme) setCurrentTheme(theme);
    }
    
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
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
    localStorage.setItem('studymate-dark-mode', JSON.stringify(newDarkMode));
  };

  const getThemeColors = () => {
    if (isDarkMode) {
      return {
        gradient: currentTheme.darkGradient || currentTheme.gradient,
        cardGradient: currentTheme.darkCardGradient || currentTheme.cardGradient,
        headerGradient: currentTheme.darkHeaderGradient || currentTheme.headerGradient,
        textColor: currentTheme.darkTextColor || currentTheme.textColor
      };
    }
    
    return {
      gradient: currentTheme.gradient,
      cardGradient: currentTheme.cardGradient,
      headerGradient: currentTheme.headerGradient,
      textColor: currentTheme.textColor
    };
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      themes,
      isDarkMode,
      setTheme,
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
