
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Clock, StickyNote, Zap, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';

interface Widget {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  position: { x: number; y: number };
  isMinimized: boolean;
}

const FloatingWidgets = () => {
  const { getThemeColors } = useTheme();
  const colors = getThemeColors();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);

  const availableWidgets = [
    {
      id: 'calculator',
      title: 'Quick Calculator',
      icon: <Calculator size={16} />,
      component: <QuickCalculator />
    },
    {
      id: 'timer',
      title: 'Mini Timer',
      icon: <Clock size={16} />,
      component: <MiniTimer />
    },
    {
      id: 'note',
      title: 'Quick Note',
      icon: <StickyNote size={16} />,
      component: <QuickNote />
    }
  ];

  const addWidget = (widgetConfig: typeof availableWidgets[0]) => {
    const newWidget: Widget = {
      ...widgetConfig,
      position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
      isMinimized: false
    };
    setWidgets([...widgets, newWidget]);
    setShowWidgetMenu(false);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const toggleMinimize = (id: string) => {
    setWidgets(widgets.map(w => 
      w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
    ));
  };

  return (
    <>
      {/* Widget Menu Toggle */}
      <motion.div
        className="fixed bottom-20 right-4 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={() => setShowWidgetMenu(!showWidgetMenu)}
          className={`rounded-full w-12 h-12 bg-gradient-to-r ${colors.headerGradient} shadow-lg`}
        >
          <Zap size={20} />
        </Button>
      </motion.div>

      {/* Widget Menu */}
      <AnimatePresence>
        {showWidgetMenu && (
          <motion.div
            className="fixed bottom-36 right-4 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="shadow-xl border-0">
              <CardContent className="p-3 space-y-2">
                {availableWidgets.map(widget => (
                  <Button
                    key={widget.id}
                    onClick={() => addWidget(widget)}
                    variant="ghost"
                    className="w-full justify-start"
                    disabled={widgets.some(w => w.id === widget.id)}
                  >
                    {widget.icon}
                    <span className="ml-2">{widget.title}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Widgets */}
      <AnimatePresence>
        {widgets.map(widget => (
          <motion.div
            key={widget.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            drag
            dragMomentum={false}
            className="fixed z-40"
            style={{ 
              left: widget.position.x, 
              top: widget.position.y,
              width: widget.isMinimized ? 'auto' : '250px'
            }}
          >
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
              <div className={`flex items-center justify-between p-2 bg-gradient-to-r ${colors.headerGradient} text-white rounded-t-lg`}>
                <div className="flex items-center space-x-2">
                  {widget.icon}
                  {!widget.isMinimized && <span className="text-sm font-medium">{widget.title}</span>}
                </div>
                <div className="flex space-x-1">
                  <Button
                    onClick={() => toggleMinimize(widget.id)}
                    variant="ghost"
                    size="sm"
                    className="p-1 text-white hover:bg-white/20"
                  >
                    <Minimize2 size={12} />
                  </Button>
                  <Button
                    onClick={() => removeWidget(widget.id)}
                    variant="ghost"
                    size="sm"
                    className="p-1 text-white hover:bg-white/20"
                  >
                    <X size={12} />
                  </Button>
                </div>
              </div>
              {!widget.isMinimized && (
                <CardContent className="p-3">
                  {widget.component}
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
};

// Quick Calculator Widget
const QuickCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [operation, setOperation] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState<number | null>(null);

  const inputNumber = (num: string) => {
    setDisplay(display === '0' ? num : display + num);
  };

  const inputOperation = (op: string) => {
    setPrevValue(parseFloat(display));
    setOperation(op);
    setDisplay('0');
  };

  const calculate = () => {
    if (operation && prevValue !== null) {
      const current = parseFloat(display);
      let result = 0;
      switch (operation) {
        case '+': result = prevValue + current; break;
        case '-': result = prevValue - current; break;
        case '*': result = prevValue * current; break;
        case '/': result = prevValue / current; break;
      }
      setDisplay(result.toString());
      setOperation(null);
      setPrevValue(null);
    }
  };

  const clear = () => {
    setDisplay('0');
    setOperation(null);
    setPrevValue(null);
  };

  return (
    <div className="space-y-2">
      <div className="bg-gray-100 p-2 rounded text-right font-mono text-sm">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1 text-xs">
        <Button onClick={clear} variant="outline" size="sm">C</Button>
        <Button onClick={() => inputOperation('/')} variant="outline" size="sm">÷</Button>
        <Button onClick={() => inputOperation('*')} variant="outline" size="sm">×</Button>
        <Button onClick={() => inputOperation('-')} variant="outline" size="sm">-</Button>
        <Button onClick={() => inputNumber('7')} variant="outline" size="sm">7</Button>
        <Button onClick={() => inputNumber('8')} variant="outline" size="sm">8</Button>
        <Button onClick={() => inputNumber('9')} variant="outline" size="sm">9</Button>
        <Button onClick={() => inputOperation('+')} variant="outline" size="sm">+</Button>
        <Button onClick={() => inputNumber('4')} variant="outline" size="sm">4</Button>
        <Button onClick={() => inputNumber('5')} variant="outline" size="sm">5</Button>
        <Button onClick={() => inputNumber('6')} variant="outline" size="sm">6</Button>
        <Button onClick={calculate} variant="default" size="sm" className="row-span-2">=</Button>
        <Button onClick={() => inputNumber('1')} variant="outline" size="sm">1</Button>
        <Button onClick={() => inputNumber('2')} variant="outline" size="sm">2</Button>
        <Button onClick={() => inputNumber('3')} variant="outline" size="sm">3</Button>
        <Button onClick={() => inputNumber('0')} variant="outline" size="sm" className="col-span-2">0</Button>
        <Button onClick={() => inputNumber('.')} variant="outline" size="sm">.</Button>
      </div>
    </div>
  );
};

// Mini Timer Widget
const MiniTimer = () => {
  const [time, setTime] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center space-y-3">
      <div className="text-2xl font-mono font-bold">
        {formatTime(time)}
      </div>
      <div className="flex space-x-2">
        <Button
          onClick={() => setIsRunning(!isRunning)}
          size="sm"
          className="flex-1"
        >
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button
          onClick={() => {
            setTime(25 * 60);
            setIsRunning(false);
          }}
          variant="outline"
          size="sm"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

// Quick Note Widget
const QuickNote = () => {
  const [note, setNote] = useState('');

  const saveNote = () => {
    if (note.trim()) {
      const savedNotes = JSON.parse(localStorage.getItem('studymate-quick-notes') || '[]');
      savedNotes.push({
        id: Date.now(),
        content: note,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('studymate-quick-notes', JSON.stringify(savedNotes));
      setNote('');
    }
  };

  return (
    <div className="space-y-3">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Quick note..."
        className="w-full h-20 p-2 text-sm border rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <Button onClick={saveNote} size="sm" className="w-full">
        Save Note
      </Button>
    </div>
  );
};

export default FloatingWidgets;
