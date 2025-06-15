import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'study' | 'break' | 'achievement';
  timestamp: Date;
  read: boolean;
  actionable?: boolean;
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Check for task reminders every minute
    const interval = setInterval(checkTaskReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkTaskReminders = () => {
    const tasks = JSON.parse(localStorage.getItem('studymate-tasks') || '[]');
    const now = new Date();

    tasks.forEach((task: any) => {
      if (task.reminderTime && !task.completed) {
        const reminderTime = new Date(task.reminderTime);
        const timeDiff = reminderTime.getTime() - now.getTime();
        
        // Notify 5 minutes before and at reminder time
        if (timeDiff <= 5 * 60 * 1000 && timeDiff > 4 * 60 * 1000) {
          showNotification({
            id: `task-reminder-${task.id}-5min`,
            title: 'Task Reminder - 5 Minutes',
            message: `"${task.title}" is due in 5 minutes`,
            type: 'task',
            timestamp: now,
            read: false,
            actionable: true
          });
        } else if (timeDiff <= 0 && timeDiff > -60 * 1000) {
          showNotification({
            id: `task-reminder-${task.id}`,
            title: 'Task Due Now!',
            message: `Time to work on: "${task.title}"`,
            type: 'task',
            timestamp: now,
            read: false,
            actionable: true
          });
        }
      }
    });
  };

  const showNotification = (notification: Notification) => {
    // Add to notification list
    setNotifications(prev => [notification, ...prev].slice(0, 50));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task': return '📋';
      case 'study': return '📚';
      case 'break': return '☕';
      case 'achievement': return '🏆';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-800';
      case 'study': return 'bg-green-100 text-green-800';
      case 'break': return 'bg-orange-100 text-orange-800';
      case 'achievement': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Test notification function
  const testNotification = () => {
    showNotification({
      id: `test-${Date.now()}`,
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working!',
      type: 'achievement',
      timestamp: new Date(),
      read: false,
      actionable: false
    });
  };

  return (
    <>
      <Button
        onClick={() => setShowPanel(true)}
        variant="ghost"
        size="sm"
        className="relative text-white hover:bg-white/20 rounded-full p-2"
      >
        <Bell size={20} />
        {notifications.filter(n => !n.read).length > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
            {notifications.filter(n => !n.read).length > 99 ? "99+" : notifications.filter(n => !n.read).length}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {showPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowPanel(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 overflow-hidden"
            >
              <Card className="h-full border-0 rounded-none">
                <CardHeader className="border-b sticky top-0 bg-white z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <Bell size={20} className="mr-2" />
                      Notifications
                      {notifications.filter(n => !n.read).length > 0 && (
                        <Badge className="ml-2 bg-blue-500">
                          {notifications.filter(n => !n.read).length}
                        </Badge>
                      )}
                    </CardTitle>
                    <Button
                      onClick={() => setShowPanel(false)}
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  <div className="flex space-x-2 pt-3">
                    <Button
                      onClick={() =>
                        showNotification({
                          id: `test-${Date.now()}`,
                          title: "Test Notification",
                          message: "This is a test notification!",
                          type: "achievement",
                          timestamp: new Date(),
                          read: false,
                          actionable: false
                        })
                      }
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      Test
                    </Button>
                    <Button
                      onClick={clearAllNotifications}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      Clear All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 h-full overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                      <Bell size={48} className="mb-4 opacity-50" />
                      <p>No notifications yet</p>
                      <p className="text-sm">You'll see task reminders and updates here</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                <Badge variant="outline" className={getNotificationColor(notification.type)}>
                                  {notification.type}
                                </Badge>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                              <h4 className="font-semibold text-sm text-gray-800 mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400">
                                {notification.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(notification.id);
                              }}
                              variant="ghost"
                              size="sm"
                              className="ml-2 rounded-full p-1"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationCenter;
