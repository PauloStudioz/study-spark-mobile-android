
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Palette, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { currentTheme, themes, setTheme } = useTheme();

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
            <div className={`h-full flex flex-col bg-gradient-to-br ${currentTheme.gradient}`}>
              <div className={`bg-gradient-to-r ${currentTheme.headerGradient} text-white p-6 rounded-t-3xl`}>
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
                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <Palette className="mr-2" size={20} />
                      App Themes
                    </CardTitle>
                    <p className="text-sm text-gray-600">Choose your favorite color scheme</p>
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
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setTheme(theme.id)}
                        >
                          <div className={`h-16 rounded-xl bg-gradient-to-r ${theme.headerGradient} mb-3 relative overflow-hidden`}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-20`} />
                            {currentTheme.id === theme.id && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check size={24} className="text-white drop-shadow-lg" />
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800">{theme.name}</h3>
                            <div className="flex space-x-1">
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${theme.headerGradient}`} />
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${theme.cardGradient}`} />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">About StudyMate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>Version 1.0.0</p>
                      <p>Your ultimate study companion with AI-powered features</p>
                      <div className="pt-2">
                        <h4 className="font-medium text-gray-800 mb-2">Features:</h4>
                        <ul className="space-y-1 text-xs">
                          <li>• Pomodoro Timer for focused study sessions</li>
                          <li>• AI Quiz Generator with Gemini API</li>
                          <li>• Math Solver with advanced calculations</li>
                          <li>• English & Filipino Dictionary</li>
                          <li>• Interactive Flashcards</li>
                          <li>• Todo List for task management</li>
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
