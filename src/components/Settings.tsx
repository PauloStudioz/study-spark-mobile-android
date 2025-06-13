
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Palette, X, Check, Trophy, RotateCcw, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { currentTheme, themes, setTheme, getThemeColors, isDarkMode } = useTheme();
  const { userStats, resetStats } = useGamification();
  const colors = getThemeColors();

  const exportData = () => {
    const data = {
      theme: currentTheme.id,
      darkMode: isDarkMode,
      stats: userStats,
      notes: JSON.parse(localStorage.getItem('studymate-notes') || '[]'),
      achievements: JSON.parse(localStorage.getItem('studymate-achievements') || '[]'),
      sessions: JSON.parse(localStorage.getItem('studymate-sessions') || '[]'),
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studymate-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            
            // Restore data
            if (data.theme) setTheme(data.theme);
            if (data.notes) localStorage.setItem('studymate-notes', JSON.stringify(data.notes));
            if (data.achievements) localStorage.setItem('studymate-achievements', JSON.stringify(data.achievements));
            if (data.sessions) localStorage.setItem('studymate-sessions', JSON.stringify(data.sessions));
            if (data.stats) localStorage.setItem('studymate-stats', JSON.stringify(data.stats));
            
            alert('Data imported successfully! Please refresh the page.');
          } catch (err) {
            alert('Error importing data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-20 bottom-20 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className={`h-full flex flex-col bg-gradient-to-br ${colors.gradient} ${isDarkMode ? 'text-white' : ''}`}>
              <div className={`bg-gradient-to-r ${colors.headerGradient} text-white p-6 rounded-t-3xl`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SettingsIcon size={24} className="mr-3" />
                    <h2 className="text-xl font-bold">Settings</h2>
                  </div>
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 rounded-full p-2"
                  >
                    <X size={20} />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Theme Settings */}
                <Card className={`shadow-lg border-0 ${isDarkMode ? 'bg-gray-800' : ''}`}>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <Palette className="mr-2" size={20} />
                      App Themes
                    </CardTitle>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Choose your favorite color scheme
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {themes.map((theme) => (
                        <motion.div
                          key={theme.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            currentTheme.id === theme.id
                              ? 'border-blue-500 ring-2 ring-blue-200'
                              : `border-gray-200 hover:border-gray-300 ${isDarkMode ? 'border-gray-600' : ''}`
                          }`}
                          onClick={() => setTheme(theme.id)}
                        >
                          <div className={`h-16 rounded-xl bg-gradient-to-r ${theme.headerGradient} mb-3 relative overflow-hidden`}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? theme.darkGradient : theme.gradient} opacity-20`} />
                            {currentTheme.id === theme.id && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check size={24} className="text-white drop-shadow-lg" />
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{theme.name}</h3>
                            <div className="flex space-x-1">
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${theme.headerGradient}`} />
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${isDarkMode ? theme.darkCardGradient : theme.cardGradient}`} />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Gamification Stats */}
                <Card className={`shadow-lg border-0 ${isDarkMode ? 'bg-gray-800' : ''}`}>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <Trophy className="mr-2" size={20} />
                      Your Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <p className="text-2xl font-bold text-blue-600">{userStats.level}</p>
                        <p className="text-sm text-gray-600">Level</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <p className="text-2xl font-bold text-green-600">{userStats.totalPoints}</p>
                        <p className="text-sm text-gray-600">Points</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-xl">
                        <p className="text-2xl font-bold text-purple-600">{userStats.sessionsCompleted}</p>
                        <p className="text-sm text-gray-600">Sessions</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-xl">
                        <p className="text-2xl font-bold text-orange-600">{userStats.streak}</p>
                        <p className="text-sm text-gray-600">Streak</p>
                      </div>
                    </div>
                    <Button
                      onClick={resetStats}
                      variant="outline"
                      className="w-full"
                    >
                      <RotateCcw className="mr-2" size={16} />
                      Reset All Progress
                    </Button>
                  </CardContent>
                </Card>

                {/* Data Management */}
                <Card className={`shadow-lg border-0 ${isDarkMode ? 'bg-gray-800' : ''}`}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Data Management</CardTitle>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Backup and restore your data
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={exportData} variant="outline" className="w-full">
                      <Download className="mr-2" size={16} />
                      Export Data
                    </Button>
                    <Button onClick={importData} variant="outline" className="w-full">
                      <Upload className="mr-2" size={16} />
                      Import Data
                    </Button>
                  </CardContent>
                </Card>

                {/* About Section */}
                <Card className={`shadow-lg border-0 ${isDarkMode ? 'bg-gray-800' : ''}`}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">About StudyMate Pro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`space-y-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p>Version 2.0.0</p>
                      <p>Your ultimate study companion with gamification and AI-powered features</p>
                      <div className="pt-2">
                        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>New Features:</h4>
                        <ul className="space-y-1 text-xs">
                          <li>• Dark mode support with beautiful themes</li>
                          <li>• Gamification system with points and achievements</li>
                          <li>• Quick note-taking with subject categorization</li>
                          <li>• Floating widgets for quick access</li>
                          <li>• Advanced analytics without progress bars</li>
                          <li>• Data export/import functionality</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Settings;
