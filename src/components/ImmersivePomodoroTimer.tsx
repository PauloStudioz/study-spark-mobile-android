
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, Settings, Coffee, Focus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTheme } from '@/contexts/ThemeContext';

const ImmersivePomodoroTimer = () => {
  const { currentTheme } = useTheme();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    
    if (!isBreak) {
      setSessions(prev => prev + 1);
      setIsBreak(true);
      setTimeLeft(breakDuration * 60);
    } else {
      setIsBreak(false);
      setTimeLeft(workDuration * 60);
    }

    // Simple notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(
        isBreak ? 'Break Time!' : 'Work Session Complete!',
        {
          body: isBreak ? 'Time for a break' : 'Great job! Take a break.',
          icon: '/favicon.ico'
        }
      );
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(workDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = isBreak ? breakDuration * 60 : workDuration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const FullscreenView = () => (
    <div className={`fixed inset-0 z-50 bg-gradient-to-br ${currentTheme.gradient} flex items-center justify-center`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center text-white"
      >
        <div className="mb-8">
          {isBreak ? (
            <Coffee size={80} className="mx-auto mb-4 text-orange-300" />
          ) : (
            <Focus size={80} className="mx-auto mb-4 text-blue-300" />
          )}
          <h1 className="text-4xl font-bold mb-2">
            {isBreak ? 'Break Time' : 'Focus Time'}
          </h1>
          <p className="text-xl opacity-80">Session {sessions + 1}</p>
        </div>

        <div className="mb-8">
          <div className="text-8xl font-mono font-bold mb-4">
            {formatTime(timeLeft)}
          </div>
          <Progress value={progress} className="w-80 h-4 mx-auto bg-white/20" />
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            onClick={toggleTimer}
            size="lg"
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-4"
          >
            {isActive ? <Pause size={32} /> : <Play size={32} />}
          </Button>
          <Button
            onClick={resetTimer}
            size="lg"
            variant="outline"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-full p-4"
          >
            <RotateCcw size={32} />
          </Button>
          <Button
            onClick={() => setIsFullscreen(false)}
            size="lg"
            variant="outline"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-full p-4"
          >
            <X size={32} />
          </Button>
        </div>
      </motion.div>
    </div>
  );

  if (isFullscreen) {
    return <FullscreenView />;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`bg-gradient-to-br ${currentTheme.cardGradient} border-0 shadow-lg`}>
          <CardHeader className="text-center pb-4">
            <CardTitle className={`flex items-center justify-between text-2xl text-${currentTheme.textColor}`}>
              <span className="flex items-center">
                {isBreak ? <Coffee className="mr-2" size={24} /> : <Focus className="mr-2" size={24} />}
                {isBreak ? 'Break Time' : 'Focus Session'}
              </span>
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="ghost"
                size="sm"
                className="rounded-full"
              >
                <Settings size={20} />
              </Button>
            </CardTitle>
            <p className={`text-${currentTheme.textColor} mt-2 opacity-80`}>
              Session {sessions + 1} • {isBreak ? 'Take a break' : 'Stay focused'}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-mono font-bold mb-4 text-gray-800">
                {formatTime(timeLeft)}
              </div>
              <Progress value={progress} className="w-full h-3 mb-6" />
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                onClick={toggleTimer}
                size="lg"
                className={`bg-gradient-to-r ${currentTheme.headerGradient} hover:opacity-90 rounded-xl px-8`}
              >
                {isActive ? <Pause className="mr-2" size={20} /> : <Play className="mr-2" size={20} />}
                {isActive ? 'Pause' : 'Start'}
              </Button>
              <Button
                onClick={resetTimer}
                variant="outline"
                size="lg"
                className="rounded-xl px-6"
              >
                <RotateCcw className="mr-2" size={20} />
                Reset
              </Button>
              <Button
                onClick={() => setIsFullscreen(true)}
                variant="outline"
                size="lg"
                className="rounded-xl px-6"
              >
                Fullscreen
              </Button>
            </div>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-50 rounded-xl p-4 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Work Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={workDuration}
                        onChange={(e) => setWorkDuration(Number(e.target.value))}
                        className="w-full p-2 border rounded-lg"
                        min="1"
                        max="60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Break Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={breakDuration}
                        onChange={(e) => setBreakDuration(Number(e.target.value))}
                        className="w-full p-2 border rounded-lg"
                        min="1"
                        max="30"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Sessions completed today: {sessions}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ImmersivePomodoroTimer;
