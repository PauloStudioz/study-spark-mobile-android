
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Clock, Trophy, Brain, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';

interface Notification {
  id: string;
  type: 'reminder' | 'achievement' | 'break' | 'goal';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: React.ReactNode;
}

const NotificationCenter = () => {
  const { currentTheme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }

    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem('studymate-notifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications(parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      })));
    } else {
      // Add sample notifications
      addSampleNotifications();
    }

    // Set up notification intervals
    const reminderInterval = setInterval(() => {
      createNotification('reminder', 'Study Reminder', 'Time for your next study session!', <Clock />);
    }, 3600000); // Every hour

    return () => clearInterval(reminderInterval);
  }, []);

  const addSampleNotifications = () => {
    const sampleNotifications: Notification[] = [
      {
        id: Date.now().toString(),
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: 'You completed your first week of studying!',
        timestamp: new Date(),
        read: false,
        icon: <Trophy className="h-4 w-4" />
      },
      {
        id: (Date.now() + 1).toString(),
        type: 'reminder',
        title: 'Break Time',
        message: 'You\'ve been studying for 25 minutes. Take a 5-minute break!',
        timestamp: new Date(Date.now() - 300000),
        read: false,
        icon: <Clock className="h-4 w-4" />
      }
    ];
    setNotifications(sampleNotifications);
  };

  const createNotification = (
    type: Notification['type'],
    title: string,
    message: string,
    icon: React.ReactNode
  ) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      icon
    };

    setNotifications(prev => [notification, ...prev]);

    // Show browser notification if permission granted
    if (notificationPermission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }

    // Vibrate on mobile (if supported)
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    // Save to localStorage
    const updatedNotifications = [notification, ...notifications];
    localStorage.setItem('studymate-notifications', JSON.stringify(updatedNotifications));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'achievement': return 'border-l-yellow-500 bg-yellow-50';
      case 'reminder': return 'border-l-blue-500 bg-blue-50';
      case 'break': return 'border-l-green-500 bg-green-50';
      case 'goal': return 'border-l-purple-500 bg-purple-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className="relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-12 w-80 max-h-96 overflow-hidden z-50"
          >
            <Card className={`bg-gradient-to-br ${currentTheme.cardGradient} border-0 shadow-lg`}>
              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Notifications</h3>
                    <div className="flex space-x-2">
                      {unreadCount > 0 && (
                        <Button
                          onClick={markAllAsRead}
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                        >
                          Mark all read
                        </Button>
                      )}
                      <Button
                        onClick={() => setIsOpen(false)}
                        variant="ghost"
                        size="sm"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell size={48} className="mx-auto mb-4 opacity-30" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                          !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                        } border-b border-gray-100 cursor-pointer hover:bg-opacity-80 transition-all`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="mt-1">
                              {notification.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                {notification.title}
                              </h4>
                              <p className={`text-xs ${!notification.read ? 'text-gray-700' : 'text-gray-500'} mt-1`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {notification.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <X size={12} />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
