
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Clock, CheckSquare, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';

interface RoutineTask {
  id: string;
  title: string;
  duration: number; // in minutes
  type: 'study' | 'break' | 'exercise' | 'review';
  completed: boolean;
}

interface Routine {
  id: string;
  name: string;
  tasks: RoutineTask[];
  totalDuration: number;
  completedToday: boolean;
  createdAt: Date;
}

const RoutineMaker = () => {
  const { getThemeColors, isDarkMode } = useTheme();
  const colors = getThemeColors();
  const { completeRoutine } = useGamification();
  
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [showCreateRoutine, setShowCreateRoutine] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [newRoutine, setNewRoutine] = useState({
    name: '',
    tasks: [] as Omit<RoutineTask, 'id' | 'completed'>[]
  });
  const [newTask, setNewTask] = useState({
    title: '',
    duration: 25,
    type: 'study' as const
  });

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = () => {
    const saved = localStorage.getItem('studymate-routines');
    if (saved) {
      const parsed = JSON.parse(saved);
      const routinesWithDates = parsed.map((routine: any) => ({
        ...routine,
        createdAt: new Date(routine.createdAt)
      }));
      setRoutines(routinesWithDates);
    }
  };

  const saveRoutines = (updatedRoutines: Routine[]) => {
    localStorage.setItem('studymate-routines', JSON.stringify(updatedRoutines));
    setRoutines(updatedRoutines);
  };

  const addTaskToNewRoutine = () => {
    if (!newTask.title.trim()) return;
    
    setNewRoutine(prev => ({
      ...prev,
      tasks: [...prev.tasks, { ...newTask }]
    }));
    
    setNewTask({
      title: '',
      duration: 25,
      type: 'study'
    });
  };

  const createRoutine = () => {
    if (!newRoutine.name.trim() || newRoutine.tasks.length === 0) return;
    
    const routine: Routine = {
      id: Date.now().toString(),
      name: newRoutine.name,
      tasks: newRoutine.tasks.map((task, index) => ({
        ...task,
        id: `${Date.now()}_${index}`,
        completed: false
      })),
      totalDuration: newRoutine.tasks.reduce((sum, task) => sum + task.duration, 0),
      completedToday: false,
      createdAt: new Date()
    };
    
    const updated = [...routines, routine];
    saveRoutines(updated);
    
    setNewRoutine({ name: '', tasks: [] });
    setShowCreateRoutine(false);
  };

  const startRoutine = (routine: Routine) => {
    const resetRoutine = {
      ...routine,
      tasks: routine.tasks.map(task => ({ ...task, completed: false }))
    };
    setActiveRoutine(resetRoutine);
  };

  const completeTask = (taskId: string) => {
    if (!activeRoutine) return;
    
    const updatedTasks = activeRoutine.tasks.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    );
    
    const updatedRoutine = { ...activeRoutine, tasks: updatedTasks };
    setActiveRoutine(updatedRoutine);
    
    // Check if all tasks are completed
    if (updatedTasks.every(task => task.completed)) {
      completeRoutine();
      
      // Mark routine as completed today
      const updatedRoutines = routines.map(r => 
        r.id === activeRoutine.id ? { ...r, completedToday: true } : r
      );
      saveRoutines(updatedRoutines);
      
      setTimeout(() => {
        setActiveRoutine(null);
      }, 2000);
    }
  };

  const deleteRoutine = (routineId: string) => {
    const updated = routines.filter(r => r.id !== routineId);
    saveRoutines(updated);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'study': return 'bg-blue-100 text-blue-800';
      case 'break': return 'bg-green-100 text-green-800';
      case 'exercise': return 'bg-orange-100 text-orange-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (activeRoutine) {
    const progress = (activeRoutine.tasks.filter(t => t.completed).length / activeRoutine.tasks.length) * 100;
    const isCompleted = activeRoutine.tasks.every(task => task.completed);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setActiveRoutine(null)}
            variant="outline"
            className="rounded-xl"
          >
            Back to Routines
          </Button>
          <Badge variant="secondary" className="px-3 py-1">
            {Math.round(progress)}% Complete
          </Badge>
        </div>

        <Card className={`bg-gradient-to-br ${colors.cardGradient} border-0 shadow-lg ${isDarkMode ? 'bg-opacity-90' : ''}`}>
          <CardHeader className="text-center">
            <CardTitle className={`text-2xl ${isDarkMode ? 'text-white' : `text-${colors.textColor}`}`}>
              {activeRoutine.name}
            </CardTitle>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
              <div 
                className={`bg-gradient-to-r ${colors.headerGradient} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardHeader>
        </Card>

        {isCompleted && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Routine Completed!
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Great job completing your daily routine!
            </p>
          </motion.div>
        )}

        <div className="space-y-4">
          {activeRoutine.tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`shadow-lg transition-all ${task.completed ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => completeTask(task.id)}
                        disabled={task.completed}
                        variant={task.completed ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                      >
                        <CheckSquare size={16} />
                      </Button>
                      <div>
                        <h3 className={`font-semibold ${task.completed ? 'line-through' : ''} ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getTypeColor(task.type)} variant="secondary">
                            {task.type}
                          </Badge>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {task.duration}m
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`bg-gradient-to-br ${colors.cardGradient} border-0 shadow-lg ${isDarkMode ? 'bg-opacity-90' : ''}`}>
          <CardHeader className="text-center">
            <CardTitle className={`flex items-center justify-center text-2xl ${isDarkMode ? 'text-white' : `text-${colors.textColor}`}`}>
              <Calendar className="mr-2" size={24} />
              Daily Routines
            </CardTitle>
            <p className={`mt-2 opacity-80 ${isDarkMode ? 'text-gray-300' : `text-${colors.textColor}`}`}>
              Create and follow structured study routines
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Button
                onClick={() => setShowCreateRoutine(true)}
                className={`bg-gradient-to-r ${colors.headerGradient} hover:opacity-90 rounded-xl`}
              >
                <Plus size={16} className="mr-2" />
                Create Routine
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {showCreateRoutine && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br ${colors.cardGradient} rounded-2xl p-6 shadow-lg border-0 ${isDarkMode ? 'bg-opacity-90' : ''}`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : `text-${colors.textColor}`}`}>Create New Routine</h3>
          
          <div className="space-y-4">
            <Input
              value={newRoutine.name}
              onChange={(e) => setNewRoutine({...newRoutine, name: e.target.value})}
              placeholder="Routine name..."
              className="rounded-xl"
            />
            
            <div className="space-y-3">
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Add Tasks</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Task title..."
                  className="rounded-xl"
                />
                <Input
                  type="number"
                  value={newTask.duration}
                  onChange={(e) => setNewTask({...newTask, duration: parseInt(e.target.value) || 25})}
                  placeholder="Duration (min)"
                  className="rounded-xl"
                  min="1"
                />
                <select
                  value={newTask.type}
                  onChange={(e) => setNewTask({...newTask, type: e.target.value as any})}
                  className={`rounded-xl p-2 border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="study">Study</option>
                  <option value="break">Break</option>
                  <option value="exercise">Exercise</option>
                  <option value="review">Review</option>
                </select>
                <Button
                  onClick={addTaskToNewRoutine}
                  variant="outline"
                  className="rounded-xl"
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            
            {newRoutine.tasks.length > 0 && (
              <div className="space-y-2">
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Tasks</h4>
                {newRoutine.tasks.map((task, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center space-x-2">
                      <span className={isDarkMode ? 'text-white' : 'text-gray-800'}>{task.title}</span>
                      <Badge className={getTypeColor(task.type)} variant="secondary">
                        {task.type}
                      </Badge>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {task.duration}m
                      </span>
                    </div>
                    <Button
                      onClick={() => setNewRoutine(prev => ({
                        ...prev,
                        tasks: prev.tasks.filter((_, i) => i !== index)
                      }))}
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={createRoutine}
                disabled={!newRoutine.name.trim() || newRoutine.tasks.length === 0}
                className={`flex-1 bg-gradient-to-r ${colors.headerGradient} hover:opacity-90 rounded-xl`}
              >
                Create Routine
              </Button>
              <Button
                onClick={() => setShowCreateRoutine(false)}
                variant="outline"
                className="rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {routines.map((routine, index) => (
          <motion.div
            key={routine.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {routine.name}
                      </h3>
                      {routine.completedToday && (
                        <Badge className="bg-green-100 text-green-800">
                          ✓ Completed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Clock size={14} className="mr-1" />
                        {routine.totalDuration}m total
                      </span>
                      <span className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <CheckSquare size={14} className="mr-1" />
                        {routine.tasks.length} tasks
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => startRoutine(routine)}
                      className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                    >
                      <Play size={16} className="mr-2" />
                      Start
                    </Button>
                    <Button
                      onClick={() => deleteRoutine(routine.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700 rounded-xl"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {routines.length === 0 && !showCreateRoutine && (
        <div className="text-center py-12">
          <Calendar size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No routines created yet</p>
          <Button
            onClick={() => setShowCreateRoutine(true)}
            className={`bg-gradient-to-r ${colors.headerGradient} hover:opacity-90 rounded-xl`}
          >
            Create Your First Routine
          </Button>
        </div>
      )}
    </div>
  );
};

export default RoutineMaker;
