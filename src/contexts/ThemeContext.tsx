
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Theme {
  id: string;
  name: string;
  gradient: string;
  headerGradient: string;
  cardGradient: string;
  accentColor: string;
  textColor: string;
}

const themes: Theme[] = [
  {
    id: 'blue-purple',
    name: 'Ocean Breeze',
    gradient: 'from-blue-50 via-indigo-50 to-purple-50',
    headerGradient: 'from-blue-600 to-purple-600',
    cardGradient: 'from-blue-50 to-indigo-100',
    accentColor: 'blue-600',
    textColor: 'blue-700'
  },
  {
    id: 'pink-orange',
    name: 'Sunset Glow',
    gradient: 'from-pink-50 via-orange-50 to-red-50',
    headerGradient: 'from-pink-500 to-orange-500',
    cardGradient: 'from-pink-50 to-orange-100',
    accentColor: 'pink-600',
    textColor: 'pink-700'
  },
  {
    id: 'green-teal',
    name: 'Forest Mint',
    gradient: 'from-green-50 via-emerald-50 to-teal-50',
    headerGradient: 'from-green-600 to-teal-600',
    cardGradient: 'from-green-50 to-emerald-100',
    accentColor: 'green-600',
    textColor: 'green-700'
  },
  {
    id: 'purple-indigo',
    name: 'Cosmic Purple',
    gradient: 'from-purple-50 via-violet-50 to-indigo-50',
    headerGradient: 'from-purple-600 to-indigo-600',
    cardGradient: 'from-purple-50 to-violet-100',
    accentColor: 'purple-600',
    textColor: 'purple-700'
  },
  {
    id: 'amber-yellow',
    name: 'Golden Hour',
    gradient: 'from-amber-50 via-yellow-50 to-orange-50',
    headerGradient: 'from-amber-500 to-yellow-500',
    cardGradient: 'from-amber-50 to-yellow-100',
    accentColor: 'amber-600',
    textColor: 'amber-700'
  }
];

interface ThemeContextType {
  currentTheme: Theme;
  themes: Theme[];
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  useEffect(() => {
    const savedThemeId = localStorage.getItem('studymate-theme');
    if (savedThemeId) {
      const savedTheme = themes.find(t => t.id === savedThemeId);
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      }
    }
  }, []);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem('studymate-theme', themeId);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themes, setTheme }}>
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
