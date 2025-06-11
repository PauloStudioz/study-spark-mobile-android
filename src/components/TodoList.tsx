
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Plus, Clock, Bell, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  reminderTime?: Date;
  priority: 'low' | 'medium' | 'high';
  category: 'study' | 'assignment' | 'exam' | 'general';
  createdAt: Date;
}

const TodoList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    reminderTime: '',
    priority: 'medium' as Task['priority'],
    category: 'study' as Task['category']
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    loadTasks();
    checkReminders();
    
    // Set up reminder checking interval
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const loadTasks = () => {
    const savedTasks = localStorage.getItem('studymate-tasks');
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks);
      const tasksWithDates = parsed.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        reminderTime: task.reminderTime ? new Date(task.reminderTime) : undefined,
        createdAt: new Date(task.createdAt)
      }));
      setTasks(tasksWithDates);
    }
  };

  const saveTasks = (updatedTasks: Task[]) => {
    localStorage.setItem('studymate-tasks', JSON.stringify(updatedTasks));
  };

  const checkReminders = () => {
    const now = new Date();
    tasks.forEach(task => {
      if (task.reminderTime && 
          !task.completed && 
          task.reminderTime <= now && 
          task.reminderTime > new Date(now.getTime() - 60000)) {
        showNotification(task);
      }
    });
  };

  const showNotification = (task: Task) => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`Study Reminder: ${task.title}`, {
          body: task.description || 'Time to work on this task!',
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(`Study Reminder: ${task.title}`, {
              body: task.description || 'Time to work on this task!',
              icon: '/favicon.ico'
            });
          }
        });
      }
    }
    
    // Also play a simple sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const createTask = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description || undefined,
      completed: false,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      reminderTime: newTask.reminderTime ? new Date(newTask.reminderTime) : undefined,
      priority: newTask.priority,
      category: newTask.category,
      createdAt: new Date()
    };

    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      reminderTime: '',
      priority: 'medium',
      category: 'study'
    });
    setShowCreateTask(false);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const toggleTask = (taskId: string) => {
    updateTask(taskId, { 
      completed: !tasks.find(t => t.id === taskId)?.completed 
    });
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getCategoryColor = (category: Task['category']) => {
    switch (category) {
      case 'study': return 'bg-blue-100 text-blue-800';
      case 'assignment': return 'bg-purple-100 text-purple-800';
      case 'exam': return 'bg-orange-100 text-orange-800';
      case 'general': return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending': return !task.completed;
      case 'completed': return task.completed;
      default: return true;
    }
  }).sort((a, b) => {
    // Sort by completion status, then by priority, then by due date
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center text-2xl text-indigo-700">
              <CheckSquare className="mr-2" size={24} />
              Study Tasks & Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center space-x-3">
              <Button
                onClick={() => setShowCreateTask(true)}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                <Plus size={16} className="mr-2" />
                New Task
              </Button>
            </div>
            
            <div className="flex justify-center space-x-2">
              {(['all', 'pending', 'completed'] as const).map((filterType) => (
                <Button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  variant={filter === filterType ? "default" : "outline"}
                  size="sm"
                  className="rounded-xl capitalize"
                >
                  {filterType}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {showCreateTask && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border"
        >
          <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
          <div className="space-y-4">
            <Input
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              placeholder="Task title..."
              className="rounded-xl"
            />
            
            <Textarea
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              placeholder="Description (optional)..."
              className="rounded-xl"
              rows={3}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value as Task['priority']})}
                  className="w-full p-2 border rounded-xl"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({...newTask, category: e.target.value as Task['category']})}
                  className="w-full p-2 border rounded-xl"
                >
                  <option value="study">Study</option>
                  <option value="assignment">Assignment</option>
                  <option value="exam">Exam</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="w-full p-2 border rounded-xl"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Reminder</label>
                <input
                  type="datetime-local"
                  value={newTask.reminderTime}
                  onChange={(e) => setNewTask({...newTask, reminderTime: e.target.value})}
                  className="w-full p-2 border rounded-xl"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={createTask}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                Create Task
              </Button>
              <Button
                onClick={() => setShowCreateTask(false)}
                variant="outline"
                className="rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`shadow-md hover:shadow-lg transition-shadow ${
                task.completed ? 'opacity-60' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-semibold text-gray-800 ${
                          task.completed ? 'line-through' : ''
                        }`}>
                          {task.title}
                        </h3>
                        
                        <div className="flex space-x-1">
                          <Button
                            onClick={() => setEditingTask(task)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            onClick={() => deleteTask(task.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority} priority
                        </Badge>
                        <Badge variant="secondary" className={getCategoryColor(task.category)}>
                          {task.category}
                        </Badge>
                        
                        {task.dueDate && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock size={10} />
                            Due: {format(task.dueDate, 'MMM dd, HH:mm')}
                          </Badge>
                        )}
                        
                        {task.reminderTime && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Bell size={10} />
                            Reminder: {format(task.reminderTime, 'MMM dd, HH:mm')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">
            {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
          </p>
          {filter === 'all' && (
            <Button
              onClick={() => setShowCreateTask(true)}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              Create Your First Task
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TodoList;
