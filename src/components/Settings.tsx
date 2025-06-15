import React from "react";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Palette, X, Check, Trophy, RotateCcw, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import DataManagement from "./DataManagement";
import { useFontScale } from "@/contexts/FontScaleContext";

// Types for notification & display settings
type NotificationPrefs = {
  achievement: boolean;
  streak: boolean;
};

type DisplayPrefs = {
  darkModeScheduler: 'system' | 'manual' | 'schedule';
  schedule?: { from: string; to: string }; // e.g., from '20:00', to '07:00'
};

const NOTIF_LS_KEY = "studymate-notification-prefs";
const DISPLAY_LS_KEY = "studymate-display-prefs";

function getNotificationPrefs(): NotificationPrefs {
  try {
    return { achievement: true, streak: true, ...JSON.parse(localStorage.getItem(NOTIF_LS_KEY) ?? '{}') };
  } catch {
    return { achievement: true, streak: true };
  }
}
function getDisplayPrefs(): DisplayPrefs {
  try {
    return { darkModeScheduler: 'system', ...JSON.parse(localStorage.getItem(DISPLAY_LS_KEY) ?? '{}') };
  } catch {
    return { darkModeScheduler: 'system' };
  }
}

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const fontDesc = ["Small", "Medium", "Large", "Extra Large"];

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { currentTheme, themes, setTheme, getThemeColors, isDarkMode, toggleDarkMode } = useTheme();
  const { userStats, resetStats } = useGamification();
  const colors = getThemeColors();
  const { fontScale, setFontScale, scaleValue } = useFontScale();

  // Settings state (remove browser/session sound/reduce motion)
  const [notificationPrefs, setNotificationPrefs] = useState({
    achievement: true,
    streak: true,
  });

  const [displayPrefs, setDisplayPrefs] = useState({
    darkModeScheduler: 'system', // system/manual/schedule
    schedule: undefined,
  });

  // No more reduce motion for mobile!

  // Sync settings to localStorage
  useEffect(() => {
    // Only persist feature settings that are actually used for mobile!
    localStorage.setItem("studymate-notification-prefs", JSON.stringify(notificationPrefs));
    // fontScale now stored in its own context/provider
    localStorage.setItem("studymate-display-prefs", JSON.stringify(displayPrefs));
  }, [notificationPrefs, displayPrefs]);

  // Font size now handled by context, so root/apply at main entry
  // Remove: useEffect for --studymate-font-scale

  // Auto dark mode scheduler
  useEffect(() => {
    if (displayPrefs.darkModeScheduler === 'system') return;
    if (displayPrefs.darkModeScheduler === 'manual') return;
    // Schedule-based: from-to (e.g. 20:00 -> 07:00)
    if (displayPrefs.schedule && displayPrefs.darkModeScheduler === 'schedule') {
      const { from, to } = displayPrefs.schedule;
      const check = () => {
        const now = new Date();
        const start = new Date();
        const end = new Date();
        const [fromH, fromM] = from.split(':').map(Number);
        const [toH, toM] = to.split(':').map(Number);
        start.setHours(fromH, fromM || 0, 0, 0);
        end.setHours(toH, toM || 0, 0, 0);
        let darkActive = false;
        if (fromH < toH || (fromH === toH && fromM < toM)) {
          // same-day
          darkActive = now >= start && now < end;
        } else {
          // crosses midnight
          darkActive = now >= start || now < end;
        }
        if (darkActive !== isDarkMode)
          toggleDarkMode();
      };
      check();
      const timer = setInterval(check, 60 * 1000);
      return () => clearInterval(timer);
    }
  }, [displayPrefs.darkModeScheduler, displayPrefs.schedule, isDarkMode, toggleDarkMode]);

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
            
            {/* Notification Preferences (mobile only) */}
            <Card className={`shadow-lg border-0 ${isDarkMode ? 'bg-gray-800' : ''}`}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Notification Settings</CardTitle>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Enable reminders and notifications.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Removed browser notification and session sound */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Achievement Notifications</span>
                  <Switch
                    checked={notificationPrefs.achievement}
                    onCheckedChange={checked => setNotificationPrefs(s => ({ ...s, achievement: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Streak Reminders</span>
                  <Switch
                    checked={notificationPrefs.streak}
                    onCheckedChange={checked => setNotificationPrefs(s => ({ ...s, streak: checked }))}
                  />
                </div>
                {/* NOTE: To enable push notifications, integrate with a Capacitor plugin (see comment below) */}
              </CardContent>
            </Card>

            {/* Display & Interface Preferences */}
            <Card className={`shadow-lg border-0 ${isDarkMode ? 'bg-gray-800' : ''}`}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Display & Interface</CardTitle>
                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Adjust font size and dark mode
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <span className="text-sm font-medium mb-2">Font Size</span>
                  <div className="flex items-center space-x-4 mt-2">
                    <Slider
                      value={[fontScale]}
                      onValueChange={([v]) => setFontScale(v as 1 | 2 | 3 | 4)}
                      min={1}
                      max={4}
                      step={1}
                      className="w-40"
                    />
                    <span className="text-xs">{fontDesc[(fontScale ?? 2) - 1]}</span>
                  </div>
                </div>
                {/* No more reduce motion! */}
                <div>
                  <span className="text-sm font-medium">Auto Dark Mode</span>
                  <div className="flex items-center space-x-2 mt-2">
                    <select
                      className="rounded-md border px-2 py-1 bg-background text-xs"
                      value={displayPrefs.darkModeScheduler}
                      onChange={e => setDisplayPrefs(s => ({ ...s, darkModeScheduler: e.target.value as 'system' | 'manual' | 'schedule' }))}
                    >
                      <option value="system">System Default</option>
                      <option value="manual">Manual</option>
                      <option value="schedule">Schedule</option>
                    </select>
                    {displayPrefs.darkModeScheduler === 'schedule' && (
                      <>
                        <span className="pl-2 text-xs">From:</span>
                        <input
                          type="time"
                          value={displayPrefs.schedule?.from ?? '20:00'}
                          onChange={e =>
                            setDisplayPrefs(s => ({
                              ...s,
                              schedule: { ...(s.schedule ?? { from: '20:00', to: '07:00' }), from: e.target.value }
                            }))
                          }
                          className="bg-background border rounded px-1 text-xs"
                        />
                        <span className="pl-2 text-xs">To:</span>
                        <input
                          type="time"
                          value={displayPrefs.schedule?.to ?? '07:00'}
                          onChange={e =>
                            setDisplayPrefs(s => ({
                              ...s,
                              schedule: { ...(s.schedule ?? { from: '20:00', to: '07:00' }), to: e.target.value }
                            }))
                          }
                          className="bg-background border rounded px-1 text-xs"
                        />
                      </>
                    )}
                  </div>
                  {displayPrefs.darkModeScheduler === 'manual' && (
                    <Button
                      size="sm"
                      className="mt-2"
                      variant="outline"
                      onClick={toggleDarkMode}
                    >
                      Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

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
                <DataManagement />

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
