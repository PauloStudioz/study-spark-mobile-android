
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings as SettingsIcon, Maximize, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';

const PomodoroTimer = () => {
  const { getThemeColors, isDarkMode } = useTheme();
  const colors = getThemeColors();
  const { completeSession, addStudyTime } = useGamification();
  
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [settings, setSettings] = useState({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessions, setSessions] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const initialTime = mode === 'focus' 
    ? settings.focusTime * 60 
    : (sessions % 4 === 3 ? settings.longBreak : settings.shortBreak) * 60;

  const progress = ((initialTime - time) / initialTime) * 100;
  const circumference = 2 * Math.PI * 120; // radius of 120
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (isActive && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      playAlarm();
      
      if (mode === 'focus') {
        setSessions(prev => prev + 1);
        completeSession();
        addStudyTime(settings.focusTime);
        setMode('break');
        const nextBreakTime = (sessions + 1) % 4 === 0 ? settings.longBreak : settings.shortBreak;
        setTime(nextBreakTime * 60);
      } else {
        setMode('focus');
        setTime(settings.focusTime * 60);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, time, mode, sessions, settings, completeSession, addStudyTime]);

  const playAlarm = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    } catch (error) {
      console.log('Audio not available');
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(initialTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    if (!isActive) {
      const newTime = mode === 'focus' 
        ? newSettings.focusTime * 60 
        : (sessions % 4 === 3 ? newSettings.longBreak : newSettings.shortBreak) * 60;
      setTime(newTime);
    }
    setShowSettings(false);
  };

  const handleInputChange = (field: keyof typeof settings, value: string) => {
    const numValue = value === '' ? 1 : Math.max(1, Math.min(99, parseInt(value) || 1));
    setSettings({
      ...settings,
      [field]: numValue
    });
  };

  // Fullscreen Mode
  if (isFullscreen) {
    return (
      <div className={`fixed inset-0 z-50 bg-gradient-to-br ${colors.gradient} flex items-center justify-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="relative mb-8">
            <svg className="w-80 h-80 transform -rotate-90" viewBox="0 0 250 250">
              <circle
                cx="125"
                cy="125"
                r="120"
                stroke="white"
                strokeOpacity="0.2"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="125"
                cy="125"
                r="120"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2 text-white">
                  {formatTime(time)}
                </div>
                <p className="text-xl text-white/80">
                  {mode === 'focus' ? 'Focus Time' : 'Break Time'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-6">
            <Button
              onClick={toggleTimer}
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-6"
            >
              {isActive ? <Pause size={32} /> : <Play size={32} />}
            </Button>
            <Button
              onClick={resetTimer}
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-6"
            >
              <RotateCcw size={32} />
            </Button>
            <Button
              onClick={() => setIsFullscreen(false)}
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-6"
            >
              <X size={32} />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`bg-gradient-to-br ${colors.cardGradient} border-0 shadow-lg ${isDarkMode ? 'bg-opacity-90' : ''}`}>
          <CardContent className="p-8 text-center">
            <div className="relative mb-6">
              {/* Circular Progress Timer */}
              <svg className="w-64 h-64 mx-auto transform -rotate-90" viewBox="0 0 250 250">
                <circle
                  cx="125"
                  cy="125"
                  r="120"
                  stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="125"
                  cy="125"
                  r="120"
                  stroke="url(#gradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" className="text-blue-500" stopColor="currentColor" />
                    <stop offset="100%" className="text-purple-500" stopColor="currentColor" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {formatTime(time)}
                  </span>
                </div>
              </div>
            </div>

            <motion.h2 
              className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : `text-${colors.textColor}`}`}
            >
              {mode === 'focus' ? 'Focus Time' : 'Break Time'}
            </motion.h2>
            
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Session {sessions + 1} • {mode === 'focus' ? 'Stay focused!' : 'Take a rest!'}
            </p>

            <div className="flex justify-center space-x-4">
              <Button
                onClick={toggleTimer}
                size="lg"
                className={`rounded-full px-8 ${
                  isActive 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isActive ? <Pause size={20} /> : <Play size={20} />}
                <span className="ml-2">{isActive ? 'Pause' : 'Start'}</span>
              </Button>
              
              <Button
                onClick={resetTimer}
                variant="outline"
                size="lg"
                className="rounded-full px-6"
              >
                <RotateCcw size={20} />
              </Button>
              
              <Button
                onClick={() => setIsFullscreen(true)}
                variant="outline"
                size="lg"
                className="rounded-full px-6"
              >
                <Maximize size={20} />
              </Button>
              
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                size="lg"
                className="rounded-full px-6"
              >
                <SettingsIcon size={20} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`bg-gradient-to-br ${colors.cardGradient} rounded-2xl p-6 shadow-lg border-0 ${isDarkMode ? 'bg-opacity-90' : ''}`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : `text-${colors.textColor}`}`}>Timer Settings</h3>
            
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Focus Time (minutes)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={settings.focusTime}
                    onChange={(e) => handleInputChange('focusTime', e.target.value)}
                    className={`w-full p-4 border-2 rounded-xl text-center text-lg font-semibold focus:outline-none transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-400' 
                        : 'bg-white border-gray-200 text-gray-800 focus:border-blue-500'
                    }`}
                    min="1"
                    max="99"
                    placeholder="25"
                  />
                  <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                    min
                  </div>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Short Break (minutes)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={settings.shortBreak}
                    onChange={(e) => handleInputChange('shortBreak', e.target.value)}
                    className={`w-full p-4 border-2 rounded-xl text-center text-lg font-semibold focus:outline-none transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-400' 
                        : 'bg-white border-gray-200 text-gray-800 focus:border-blue-500'
                    }`}
                    min="1"
                    max="30"
                    placeholder="5"
                  />
                  <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                    min
                  </div>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Long Break (minutes)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={settings.longBreak}
                    onChange={(e) => handleInputChange('longBreak', e.target.value)}
                    className={`w-full p-4 border-2 rounded-xl text-center text-lg font-semibold focus:outline-none transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-400' 
                        : 'bg-white border-gray-200 text-gray-800 focus:border-blue-500'
                    }`}
                    min="1"
                    max="60"
                    placeholder="15"
                  />
                  <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                    min
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => updateSettings(settings)}
                  className={`flex-1 bg-gradient-to-r ${colors.headerGradient} hover:opacity-90 rounded-xl py-3`}
                >
                  Save Settings
                </Button>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="outline"
                  className="px-6 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PomodoroTimer;
