
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, Target, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';

const StudyAnalytics = () => {
  const { currentTheme } = useTheme();

  const todayStats = {
    focusSessions: 3,
    totalFocusTime: 75,
    averageSessionLength: 25,
    completedTasks: 5,
    streakDays: 7
  };

  const weeklyData = [
    { day: 'Mon', sessions: 4, minutes: 100 },
    { day: 'Tue', sessions: 3, minutes: 75 },
    { day: 'Wed', sessions: 5, minutes: 125 },
    { day: 'Thu', sessions: 2, minutes: 50 },
    { day: 'Fri', sessions: 6, minutes: 150 },
    { day: 'Sat', sessions: 3, minutes: 75 },
    { day: 'Sun', sessions: 4, minutes: 100 }
  ];

  const achievements = [
    { title: 'First Timer', description: 'Complete your first Pomodoro session', earned: true },
    { title: 'Focus Master', description: 'Complete 10 sessions in one day', earned: false },
    { title: 'Consistency King', description: 'Maintain a 7-day streak', earned: true },
    { title: 'Marathon Runner', description: 'Study for 8 hours in one day', earned: false }
  ];

  return (
    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`bg-gradient-to-br ${currentTheme.cardGradient} border-0 shadow-lg`}>
          <CardHeader className="text-center pb-4">
            <CardTitle className={`flex items-center justify-center text-2xl text-${currentTheme.textColor}`}>
              <BarChart3 className="mr-2" size={24} />
              Study Analytics
            </CardTitle>
            <p className={`text-${currentTheme.textColor} mt-2 opacity-80`}>
              Track your learning progress and achievements
            </p>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Today's Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="mr-2" size={20} />
              Today's Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <Clock className="mx-auto mb-2 text-blue-600" size={24} />
                <p className="text-2xl font-bold text-blue-600">{todayStats.focusSessions}</p>
                <p className="text-sm text-gray-600">Focus Sessions</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <Target className="mx-auto mb-2 text-green-600" size={24} />
                <p className="text-2xl font-bold text-green-600">{todayStats.totalFocusTime}</p>
                <p className="text-sm text-gray-600">Minutes Focused</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-lg font-semibold text-purple-600">{todayStats.completedTasks}</p>
                <p className="text-xs text-gray-600">Tasks Done</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-lg font-semibold text-orange-600">{todayStats.streakDays}</p>
                <p className="text-xs text-gray-600">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyData.map((day, index) => (
                <div key={day.day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{day.day}</span>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="text-xs">
                      {day.sessions} sessions
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {day.minutes}m
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Award className="mr-2" size={20} />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-xl border-2 ${
                    achievement.earned 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-semibold ${achievement.earned ? 'text-yellow-700' : 'text-gray-500'}`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm ${achievement.earned ? 'text-yellow-600' : 'text-gray-400'}`}>
                        {achievement.description}
                      </p>
                    </div>
                    <Award 
                      size={24} 
                      className={achievement.earned ? 'text-yellow-500' : 'text-gray-300'} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default StudyAnalytics;
