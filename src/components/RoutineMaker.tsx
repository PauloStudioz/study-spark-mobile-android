
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Clock, X, Play, Pause, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';

interface RoutineTask {
  id: string;
  title: string;
  duration: number; // in minutes
  completed: boolean;
  subject: string;
}

interface DailyRoutine {
  id: string;
  name: string;
  tasks: RoutineTask[];
  totalDuration: number;
  completedTasks: number;
  createdAt: Date;
}

const RoutineMaker = () => {
  const { getThemeColors, isDarkMode } = useTheme();
  const colors = getThemeColors();
  const { addPoints } = useGamification();
  const [routines, setRoutines] = useState<DailyRoutine[]>([]);
  const [showAddRoutine, setShowAddRoutine] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newTask, setNewTask] = useState({ title: '', duration: 25, subject: 'General' });
  const [currentTasks, setCurrentTasks] = useState<RoutineTask[]>([]);
  const [activeRoutine, setActiveRoutine] = useState<DailyRoutine | null>(null);

  const subjects = ['Math', 'Science', 'History', 'Language', 'Art', 'General'];

  useEffect(() => {
    const savedRoutines = localStorage.getItem('studymate-routines');
    if (savedRoutines) {
      const parsedRoutines = JSON.parse(savedRoutines).map((routine: any) => ({
        ...routine,
        createdAt: new Date(routine.createdAt)
      }));
      setRoutines(parsedRoutines);
    }
  }, []);

  const saveRoutines = (updatedRoutines: DailyRoutine[]) => {
    setRoutines(updatedRoutines);
    localStorage.setItem('studymate-routines', JSON.stringify(updatedRoutines));
  };

  const addTaskToRoutine = () => {
    if (!newTask.title.trim()) return;

    const task: RoutineTask = {
      id: Date.now().toString(),
      title: newTask.title,
      duration: newTask.duration,
      completed: false,
      subject: newTask.subject
    };

    setCurrentTasks([...currentTasks, task]);
    setNewTask({ title: '', duration: 25, subject: 'General' });
  };

  const createRoutine = () => {
    if (!newRoutineName.trim() || currentTasks.length === 0) return;

    const routine: DailyRoutine = {
      id: Date.now().toString(),
      name: newRoutineName,
      tasks: currentTasks,
      totalDuration: currentTasks.reduce((sum, task) => sum + task.duration, 0),
      completedTasks: 0,
      createdAt: new Date()
    };

    saveRoutines([...routines, routine]);
    setNewRoutineName('');
    setCurrentTasks([]);
    setShowAddRoutine(false);
  };

  const startRoutine = (routine: DailyRoutine) => {
    // Reset all tasks to uncompleted
    const resetRoutine = {
      ...routine,
      tasks: routine.tasks.map(task => ({ ...task, completed: false })),
      completedTasks: 0
    };
    setActiveRoutine(resetRoutine);
  };

  const completeTask = (taskId: string) => {
    if (!activeRoutine) return;

    const updatedTasks = activeRoutine.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    const completedCount = updatedTasks.filter(task => task.completed).length;
    
    setActiveRoutine({
      ...activeRoutine,
      tasks: updatedTasks,
      completedTasks: completedCount
    });

    // Award points for completing task
    const task = activeRoutine.tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      addPoints(10, `Completed routine task: ${task.title}`);
    }

    // Check if routine is complete
    if (completedCount === activeRoutine.tasks.length) {
      addPoints(50, `Completed routine: ${activeRoutine.name}`);
    }
  };

  const deleteRoutine = (routineId: string) => {
    saveRoutines(routines.filter(r => r.id !== routineId));
  };

  return (
    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : `bg-gradient-to-br ${colors.cardGradient} border-0`
        } shadow-lg`}>
          <CardHeader className="text-center pb-4">
            <CardTitle className={`flex items-center justify-center text-2xl ${
              isDarkMode ? 'text-white' : `text-${colors.textColor}`
            }`}>
              <Calendar className="mr-2" size={24} />
              Daily Routine Maker
            </CardTitle>
            <p className={`${
              isDarkMode ? 'text-gray-300' : `text-${colors.textColor}`
            } mt-2 opacity-80`}>
              Create and follow structured daily study routines
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setShowAddRoutine(true)}
              className={`w-full ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : `bg-gradient-to-r ${colors.headerGradient} hover:opacity-90`
              } rounded-xl`}
            >
              <Plus size={16} className="mr-2" />
              Create New Routine
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Routine Modal */}
      <AnimatePresence>
        {showAddRoutine && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={`${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white'
            } shadow-lg`}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Create New Routine
                </CardTitle>
                <Button
                  onClick={() => setShowAddRoutine(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X size={16} />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  placeholder="Routine name (e.g., Morning Study)"
                  className="rounded-xl"
                />

                <div className="space-y-3">
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Add Tasks
                  </h3>
                  <div className="flex space-x-2">
                    <Input
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Task name"
                      className="flex-1 rounded-xl"
                    />
                    <Input
                      type="number"
                      value={newTask.duration}
                      onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) || 25 })}
                      className="w-20 rounded-xl"
                      min="5"
                      max="120"
                    />
                    <select
                      value={newTask.subject}
                      onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                      className={`p-2 border rounded-xl ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                    <Button onClick={addTaskToRoutine} size="sm" className="rounded-xl">
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                {currentTasks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Tasks ({currentTasks.reduce((sum, task) => sum + task.duration, 0)} min total)
                    </h4>
                    {currentTasks.map(task => (
                      <div key={task.id} className={`flex items-center justify-between p-2 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {task.title} ({task.duration}m)
                        </span>
                        <Button
                          onClick={() => setCurrentTasks(currentTasks.filter(t => t.id !== task.id))}
                          variant="ghost"
                          size="sm"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={createRoutine}
                  disabled={!newRoutineName.trim() || currentTasks.length === 0}
                  className={`w-full ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : `bg-gradient-to-r ${colors.headerGradient} hover:opacity-90`
                  } rounded-xl`}
                >
                  Create Routine
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Routine */}
      {activeRoutine && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className={`${
            isDarkMode ? 'bg-green-900/30 border-green-600' : 'bg-green-50 border-green-200'
          } shadow-lg border-2`}>
            <CardHeader>
              <CardTitle className={`flex items-center justify-between text-lg ${
                isDarkMode ? 'text-green-400' : 'text-green-700'
              }`}>
                <span>Active: {activeRoutine.name}</span>
                <span className="text-sm font-normal">
                  {activeRoutine.completedTasks}/{activeRoutine.tasks.length} tasks
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeRoutine.tasks.map(task => (
                <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  task.completed 
                    ? isDarkMode ? 'bg-green-800/50' : 'bg-green-100'
                    : isDarkMode ? 'bg-gray-700' : 'bg-white'
                }`}>
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={() => completeTask(task.id)}
                      variant="outline"
                      size="sm"
                      className={`rounded-full p-2 ${
                        task.completed 
                          ? 'bg-green-500 text-white border-green-500' 
                          : ''
                      }`}
                    >
                      <Check size={16} />
                    </Button>
                    <div>
                      <h4 className={`font-medium ${
                        task.completed 
                          ? isDarkMode ? 'text-green-400 line-through' : 'text-green-600 line-through'
                          : isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {task.title}
                      </h4>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {task.duration} min • {task.subject}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {activeRoutine.completedTasks === activeRoutine.tasks.length && (
                <div className={`text-center p-4 rounded-lg ${
                  isDarkMode ? 'bg-green-800/50' : 'bg-green-100'
                }`}>
                  <p className={`font-bold text-lg ${
                    isDarkMode ? 'text-green-400' : 'text-green-700'
                  }`}>
                    🎉 Routine Complete! +50 XP
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Routine List */}
      <div className="grid gap-4">
        {routines.map((routine, index) => (
          <motion.div
            key={routine.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white'
            } shadow-lg hover:shadow-xl transition-shadow`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`font-semibold text-lg ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {routine.name}
                  </h3>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => startRoutine(routine)}
                      size="sm"
                      className={`${
                        isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-blue-500 hover:bg-blue-600'
                      } text-white rounded-xl`}
                    >
                      <Play size={14} className="mr-1" />
                      Start
                    </Button>
                    <Button
                      onClick={() => deleteRoutine(routine.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-500 rounded-xl"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className={`flex items-center ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Clock size={14} className="mr-1" />
                    {routine.totalDuration} minutes
                  </span>
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {routine.tasks.length} tasks
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {routines.length === 0 && !showAddRoutine && (
        <div className="text-center py-12">
          <Calendar size={48} className={`mx-auto ${
            isDarkMode ? 'text-gray-600' : 'text-gray-400'
          } mb-4`} />
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Create your first daily routine!
          </p>
        </div>
      )}
    </div>
  );
};

export default RoutineMaker;
