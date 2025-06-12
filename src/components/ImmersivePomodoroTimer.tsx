import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings as SettingsIcon, Maximize, X, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useTheme } from '@/contexts/ThemeContext';

const ImmersivePomodoroTimer = () => {
  const { currentTheme } = useTheme();
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [settings, setSettings] = useState({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ambientSound, setAmbientSound] = useState<string>('none');
  const [soundVolume, setSoundVolume] = useState([50]);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const initialTime = mode === 'focus' 
    ? settings.focusTime * 60 
    : (sessions % 4 === 3 ? settings.longBreak : settings.shortBreak) * 60;

  const progress = ((initialTime - time) / initialTime) * 100;

  const ambientSounds = [
    { value: 'none', label: 'None' },
    { value: 'rain', label: '🌧️ Rain' },
    { value: 'forest', label: '🌲 Forest' },
    { value: 'ocean', label: '🌊 Ocean' },
    { value: 'coffee', label: '☕ Coffee Shop' },
    { value: 'fireplace', label: '🔥 Fireplace' }
  ];

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

  useEffect(() => {
    // Handle ambient sound
    if (ambientSound !== 'none' && isSoundEnabled) {
      // In a real app, you'd load actual audio files
      // For demo, we'll just create a placeholder
      console.log(`Playing ambient sound: ${ambientSound} at volume ${soundVolume[0]}`);
    }
  }, [ambientSound, soundVolume, isSoundEnabled]);

  const playAlarm = () => {
    if (!isSoundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = mode === 'focus' ? 800 : 600;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3 * (soundVolume[0] / 100), audioContext.currentTime);
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleInputChange = (field: keyof typeof settings, value: string) => {
    const numValue = value === '' ? 1 : Math.max(1, Math.min(99, parseInt(value) || 1));
    setSettings({
      ...settings,
      [field]: numValue
    });
  };

  const updateSettings = () => {
    if (!isActive) {
      const newTime = mode === 'focus' 
        ? settings.focusTime * 60 
        : (sessions % 4 === 3 ? settings.longBreak : settings.shortBreak) * 60;
      setTime(newTime);
    }
    setShowSettings(false);
  };

  const getMotivationalMessage = () => {
    if (mode === 'focus') {
      if (time > initialTime * 0.8) return "Let's get started! 💪";
      if (time > initialTime * 0.5) return "You're doing great! 🎯";
      if (time > initialTime * 0.2) return "Almost there! 🔥";
      return "Final push! 🚀";
    } else {
      return "Time to relax and recharge! 😌";
    }
  };

  if (isFullscreen) {
    return (
      <div className={`fixed inset-0 z-50 bg-gradient-to-br ${currentTheme.gradient} flex items-center justify-center`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-8 p-8"
        >
          <Button
            onClick={toggleFullscreen}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </Button>

          <motion.div
            className={`w-80 h-80 mx-auto rounded-full bg-gradient-to-br ${currentTheme.headerGradient} flex items-center justify-center shadow-2xl`}
            animate={{
              scale: isActive ? [1, 1.05, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: isActive ? Infinity : 0,
              repeatType: "reverse"
            }}
          >
            <div className="w-72 h-72 bg-white rounded-full flex items-center justify-center">
              <span className="text-6xl font-bold text-gray-800">
                {formatTime(time)}
              </span>
            </div>
          </motion.div>

          <div className="space-y-4">
            <h1 className={`text-4xl font-bold text-${currentTheme.textColor}`}>
              {mode === 'focus' ? 'Focus Time' : 'Break Time'}
            </h1>
            <p className="text-xl text-gray-600">
              {getMotivationalMessage()}
            </p>
            <div className="w-96 mx-auto">
              <Progress value={progress} className="h-3 bg-white/50" />
            </div>
          </div>

          <div className="flex justify-center space-x-6">
            <Button
              onClick={toggleTimer}
              size="lg"
              className={`rounded-full px-8 py-4 text-xl ${
                isActive 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isActive ? <Pause size={24} /> : <Play size={24} />}
              <span className="ml-2">{isActive ? 'Pause' : 'Start'}</span>
            </Button>
            
            <Button
              onClick={resetTimer}
              variant="outline"
              size="lg"
              className="rounded-full px-6 py-4"
            >
              <RotateCcw size={24} />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

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
            
            <p className="text-gray-600 mb-2">
              Session {sessions + 1} • {getMotivationalMessage()}
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              {sessions} sessions completed today
            </p>

            <div className="flex justify-center space-x-4 mb-6">
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
                onClick={toggleFullscreen}
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

            {/* Ambient Sound Controls */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Button
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                variant="ghost"
                size="sm"
              >
                {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </Button>
              
              <Select value={ambientSound} onValueChange={setAmbientSound}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ambientSounds.map(sound => (
                    <SelectItem key={sound.value} value={sound.value}>
                      {sound.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="w-24">
                <Slider
                  value={soundVolume}
                  onValueChange={setSoundVolume}
                  max={100}
                  step={10}
                  disabled={!isSoundEnabled}
                />
              </div>
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
                  onClick={updateSettings}
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
      </AnimatePresence>
    </div>
  );
};

export default ImmersivePomodoroTimer;
