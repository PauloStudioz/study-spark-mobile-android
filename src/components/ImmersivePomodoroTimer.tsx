
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings as SettingsIcon, Maximize, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useTheme } from '@/contexts/ThemeContext';
import { audioManager, AmbientSound } from '@/utils/audioManager';

const ImmersivePomodoroTimer = () => {
  const { currentTheme } = useTheme();
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settings, setSettings] = useState({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [currentSound, setCurrentSound] = useState<AmbientSound>('none');
  const [soundVolume, setSoundVolume] = useState(50);
  
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
      console.log('Audio context error:', error);
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSoundChange = (sound: AmbientSound) => {
    setCurrentSound(sound);
    if (sound === 'none') {
      audioManager.stopCurrentSound();
    } else {
      audioManager.playAmbientSound(sound, soundVolume / 100);
    }
  };

  const handleVolumeChange = (volume: number[]) => {
    const newVolume = volume[0];
    setSoundVolume(newVolume);
    audioManager.setVolume(newVolume / 100);
  };

  const TimerContent = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
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
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            size="lg"
            className="rounded-full px-6"
          >
            <SettingsIcon size={20} />
          </Button>

          {!isFullscreen && (
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="lg"
              className="rounded-full px-6"
            >
              <Maximize size={20} />
            </Button>
          )}
        </div>

        {/* Ambient Sound Controls */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-4">
          <h3 className="text-lg font-semibold text-white">Ambient Sounds</h3>
          
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'none', label: 'None', icon: '🔇' },
              { value: 'rain', label: 'Rain', icon: '🌧️' },
              { value: 'forest', label: 'Forest', icon: '🌲' },
              { value: 'ocean', label: 'Ocean', icon: '🌊' },
              { value: 'coffee', label: 'Café', icon: '☕' },
              { value: 'fire', label: 'Fire', icon: '🔥' },
            ] as const).map((sound) => (
              <Button
                key={sound.value}
                onClick={() => handleSoundChange(sound.value)}
                variant={currentSound === sound.value ? 'default' : 'outline'}
                size="sm"
                className="rounded-lg bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <span className="mr-1">{sound.icon}</span>
                {sound.label}
              </Button>
            ))}
          </div>

          {currentSound !== 'none' && (
            <div className="flex items-center space-x-3">
              <VolumeX size={16} className="text-white" />
              <Slider
                value={[soundVolume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={10}
                className="flex-1"
              />
              <Volume2 size={16} className="text-white" />
              <span className="text-white text-sm w-8">{soundVolume}%</span>
            </div>
          )}
        </div>
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
              <input
                type="number"
                value={settings.focusTime}
                onChange={(e) => setSettings({...settings, focusTime: parseInt(e.target.value) || 25})}
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-center text-lg font-semibold focus:border-blue-500 focus:outline-none transition-colors"
                min="1"
                max="99"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700">Short Break (minutes)</label>
              <input
                type="number"
                value={settings.shortBreak}
                onChange={(e) => setSettings({...settings, shortBreak: parseInt(e.target.value) || 5})}
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-center text-lg font-semibold focus:border-blue-500 focus:outline-none transition-colors"
                min="1"
                max="30"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700">Long Break (minutes)</label>
              <input
                type="number"
                value={settings.longBreak}
                onChange={(e) => setSettings({...settings, longBreak: parseInt(e.target.value) || 15})}
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-center text-lg font-semibold focus:border-blue-500 focus:outline-none transition-colors"
                min="1"
                max="60"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={() => {
                  setShowSettings(false);
                  if (!isActive) {
                    const newTime = mode === 'focus' ? settings.focusTime * 60 : (sessions % 4 === 3 ? settings.longBreak : settings.shortBreak) * 60;
                    setTime(newTime);
                  }
                }}
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

  if (isFullscreen) {
    return (
      <div className={`fixed inset-0 z-50 bg-gradient-to-br ${currentTheme.gradient} flex items-center justify-center p-4`}>
        <div className="w-full max-w-2xl">
          <div className="absolute top-4 right-4">
            <Button
              onClick={toggleFullscreen}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-full"
            >
              ✕
            </Button>
          </div>
          <TimerContent />
        </div>
      </div>
    );
  }

  return (
    <Card className={`bg-gradient-to-br ${currentTheme.cardGradient} border-0 shadow-lg`}>
      <CardContent className="p-8">
        <TimerContent />
      </CardContent>
    </Card>
  );
};

export default ImmersivePomodoroTimer;
