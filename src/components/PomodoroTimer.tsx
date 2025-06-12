
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTheme } from '@/contexts/ThemeContext';

const PomodoroTimer = () => {
  const { currentTheme } = useTheme();
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [settings, setSettings] = useState({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [sessions, setSessions] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const initialTime = mode === 'focus' 
    ? settings.focusTime * 60 
    : (sessions % 4 === 3 ? settings.longBreak : settings.shortBreak) * 60;

  const progress = ((initialTime - time) / initialTime) * 100;

  useEffect(() => {
    if (isActive && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      // Timer finished
      setIsActive(false);
      playAlarm();
      
      if (mode === 'focus') {
        setSessions(prev => prev + 1);
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
  }, [isActive, time, mode, sessions, settings]);

  const playAlarm = () => {
    // Create a simple beep sound
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
    // Allow empty string for editing, otherwise parse to number
    const numValue = value === '' ? 1 : Math.max(1, Math.min(99, parseInt(value) || 1));
    setSettings({
      ...settings,
      [field]: numValue
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`bg-gradient-to-br ${currentTheme.cardGradient} border-0 shadow-lg`}>
          <CardContent className="p-8 text-center">
            <div className="relative mb-6">
              <motion.div
                className={`w-48 h-48 mx-auto rounded-full bg-gradient-to-br ${currentTheme.headerGradient} flex items-center justify-center shadow-2xl`}
                animate={{
                  scale: isActive ? [1, 1.02, 1] : 1,
                }}
                transition={{
                  duration: 1,
                  repeat: isActive ? Infinity : 0,
                  repeatType: "reverse"
                }}
              >
                <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-800">
                    {formatTime(time)}
                  </span>
                </div>
              </motion.div>
              
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
                <Progress 
                  value={progress} 
                  className="w-32 h-2 bg-white/50"
                />
              </div>
            </div>

            <motion.h2 
              className={`text-2xl font-bold mb-2 text-${currentTheme.textColor}`}
            >
              {mode === 'focus' ? 'Focus Time' : 'Break Time'}
            </motion.h2>
            
            <p className="text-gray-600 mb-6">
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

      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br ${currentTheme.cardGradient} rounded-2xl p-6 shadow-lg border-0`}
        >
          <h3 className={`text-lg font-semibold mb-4 text-${currentTheme.textColor}`}>Timer Settings</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700">Focus Time (minutes)</label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.focusTime}
                  onChange={(e) => handleInputChange('focusTime', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl text-center text-lg font-semibold focus:border-blue-500 focus:outline-none transition-colors"
                  min="1"
                  max="99"
                  placeholder="25"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                  min
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700">Short Break (minutes)</label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.shortBreak}
                  onChange={(e) => handleInputChange('shortBreak', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl text-center text-lg font-semibold focus:border-blue-500 focus:outline-none transition-colors"
                  min="1"
                  max="30"
                  placeholder="5"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                  min
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700">Long Break (minutes)</label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.longBreak}
                  onChange={(e) => handleInputChange('longBreak', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl text-center text-lg font-semibold focus:border-blue-500 focus:outline-none transition-colors"
                  min="1"
                  max="60"
                  placeholder="15"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                  min
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={() => updateSettings(settings)}
                className={`flex-1 bg-gradient-to-r ${currentTheme.headerGradient} hover:opacity-90 rounded-xl py-3`}
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
    </div>
  );
};

export default PomodoroTimer;
