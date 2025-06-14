
import React, { useState, useEffect } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';

interface Habit {
  id: string;
  name: string;
  completedDates: string[];
}

const HabitTracker = () => {
  const { isDarkMode } = useTheme();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');

  const today = new Date().toDateString();

  useEffect(() => {
    const savedHabits = localStorage.getItem('study-habits');
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    } else {
      // Initialize with some default study habits
      const defaultHabits: Habit[] = [
        { id: '1', name: 'Read for 30 minutes', completedDates: [] },
        { id: '2', name: 'Review notes', completedDates: [] },
        { id: '3', name: 'Practice problems', completedDates: [] },
        { id: '4', name: 'Meditate 10 minutes', completedDates: [] },
      ];
      setHabits(defaultHabits);
      localStorage.setItem('study-habits', JSON.stringify(defaultHabits));
    }
  }, []);

  const saveHabits = (updatedHabits: Habit[]) => {
    setHabits(updatedHabits);
    localStorage.setItem('study-habits', JSON.stringify(updatedHabits));
  };

  const toggleHabitCompletion = (habitId: string) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = habit.completedDates.includes(today);
        const completedDates = isCompleted
          ? habit.completedDates.filter(date => date !== today)
          : [...habit.completedDates, today];
        return { ...habit, completedDates };
      }
      return habit;
    });
    saveHabits(updatedHabits);
  };

  const addHabit = () => {
    if (newHabitName.trim()) {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: newHabitName.trim(),
        completedDates: []
      };
      saveHabits([...habits, newHabit]);
      setNewHabitName('');
    }
  };

  const removeHabit = (habitId: string) => {
    const updatedHabits = habits.filter(habit => habit.id !== habitId);
    saveHabits(updatedHabits);
  };

  const getCompletedToday = () => {
    return habits.filter(habit => habit.completedDates.includes(today)).length;
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} rounded-2xl p-6 h-full`}>
      <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/90 border-gray-200'} shadow-xl mb-6`}>
        <CardHeader className="text-center">
          <CardTitle className={`text-2xl ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Daily Habits
          </CardTitle>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {getCompletedToday()} of {habits.length} completed today
          </p>
        </CardHeader>
      </Card>

      <div className="space-y-4 mb-6">
        {habits.map(habit => {
          const isCompleted = habit.completedDates.includes(today);
          return (
            <Card key={habit.id} className={`${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white/80 border-gray-200'} shadow-lg`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <Button
                      onClick={() => toggleHabitCompletion(habit.id)}
                      variant="outline"
                      size="sm"
                      className={`p-2 rounded-full ${
                        isCompleted
                          ? 'bg-green-500 text-white border-green-500 hover:bg-green-600'
                          : isDarkMode
                            ? 'border-gray-600 hover:bg-gray-700'
                            : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      <Check size={16} />
                    </Button>
                    <span className={`${
                      isCompleted 
                        ? 'line-through text-gray-500' 
                        : isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {habit.name}
                    </span>
                  </div>
                  <Button
                    onClick={() => removeHabit(habit.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className={`${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white/80 border-gray-200'} shadow-lg`}>
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Add new habit..."
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addHabit()}
              className={`flex-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            />
            <Button onClick={addHabit} className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus size={20} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitTracker;
