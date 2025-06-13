
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, Target, Award, Calendar, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';

interface StudySession {
  date: string;
  subject: string;
  duration: number;
  type: 'pomodoro' | 'flashcard' | 'task' | 'quiz';
}

interface SubjectStats {
  subject: string;
  totalTime: number;
  sessions: number;
  averageSession: number;
  color: string;
}

const StudyAnalytics = () => {
  const { getThemeColors } = useTheme();
  const colors = getThemeColors();
  const { userStats, achievements } = useGamification();
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    const savedSessions = localStorage.getItem('studymate-sessions');
    if (savedSessions) {
      setStudySessions(JSON.parse(savedSessions));
    }
  }, []);

  const getTimeframeData = () => {
    const now = new Date();
    const timeframeDays = selectedTimeframe === 'week' ? 7 : selectedTimeframe === 'month' ? 30 : 365;
    const cutoffDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);
    
    return studySessions.filter(session => new Date(session.date) >= cutoffDate);
  };

  const getSubjectStats = (): SubjectStats[] => {
    const sessions = getTimeframeData();
    const subjectMap = new Map<string, { totalTime: number; sessions: number }>();
    
    sessions.forEach(session => {
      const existing = subjectMap.get(session.subject) || { totalTime: 0, sessions: 0 };
      subjectMap.set(session.subject, {
        totalTime: existing.totalTime + session.duration,
        sessions: existing.sessions + 1
      });
    });

    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
    
    return Array.from(subjectMap.entries()).map(([subject, stats], index) => ({
      subject,
      totalTime: stats.totalTime,
      sessions: stats.sessions,
      averageSession: Math.round(stats.totalTime / stats.sessions),
      color: colors[index % colors.length]
    }));
  };

  const getDailyStats = () => {
    const sessions = getTimeframeData();
    const dailyMap = new Map<string, number>();
    
    sessions.forEach(session => {
      const date = new Date(session.date).toLocaleDateString();
      dailyMap.set(date, (dailyMap.get(date) || 0) + session.duration);
    });

    return Array.from(dailyMap.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-7);
  };

  const getFocusPatterns = () => {
    const sessions = getTimeframeData();
    const hourMap = new Map<number, number>();
    
    sessions.forEach(session => {
      const hour = new Date(session.date).getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });

    const bestHour = Array.from(hourMap.entries())
      .sort(([,a], [,b]) => b - a)[0];
    
    return bestHour ? `${bestHour[0]}:00 - ${bestHour[0] + 1}:00` : 'No data';
  };

  const getProductivityScore = () => {
    const sessions = getTimeframeData();
    const totalSessions = sessions.length;
    const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const averageSession = totalSessions > 0 ? totalTime / totalSessions : 0;
    
    // Score based on consistency and session length
    const consistencyScore = Math.min(totalSessions * 10, 100);
    const qualityScore = Math.min(averageSession * 2, 100);
    
    return Math.round((consistencyScore + qualityScore) / 2);
  };

  const subjectStats = getSubjectStats();
  const dailyStats = getDailyStats();
  const bestFocusTime = getFocusPatterns();
  const productivityScore = getProductivityScore();

  return (
    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`bg-gradient-to-br ${colors.cardGradient} border-0 shadow-lg`}>
          <CardHeader className="text-center pb-4">
            <CardTitle className={`flex items-center justify-center text-2xl text-${colors.textColor}`}>
              <BarChart3 className="mr-2" size={24} />
              Study Analytics
            </CardTitle>
            <p className={`text-${colors.textColor} mt-2 opacity-80`}>
              Advanced insights into your learning journey
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-x-2">
              {(['week', 'month', 'all'] as const).map(timeframe => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedTimeframe === timeframe
                      ? `bg-gradient-to-r ${colors.headerGradient} text-white`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="mr-2" size={20} />
              Overview Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <Award className="mx-auto mb-2 text-blue-600" size={24} />
                <p className="text-2xl font-bold text-blue-600">{userStats.level}</p>
                <p className="text-sm text-gray-600">Current Level</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <Target className="mx-auto mb-2 text-green-600" size={24} />
                <p className="text-2xl font-bold text-green-600">{userStats.totalPoints}</p>
                <p className="text-sm text-gray-600">Total Points</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <Clock className="mx-auto mb-2 text-purple-600" size={24} />
                <p className="text-2xl font-bold text-purple-600">{userStats.sessionsCompleted}</p>
                <p className="text-sm text-gray-600">Sessions Done</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <Brain className="mx-auto mb-2 text-orange-600" size={24} />
                <p className="text-2xl font-bold text-orange-600">{productivityScore}</p>
                <p className="text-sm text-gray-600">Productivity Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subject Breakdown */}
      {subjectStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Subject Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectStats.map((stat, index) => (
                  <div key={stat.subject} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-800">{stat.subject}</h3>
                      <Badge variant="secondary">{stat.totalTime}m total</Badge>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{stat.sessions} sessions</span>
                      <span>Avg: {stat.averageSession}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Daily Activity */}
      {dailyStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="mr-2" size={20} />
                Daily Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailyStats.map(([date, minutes]) => (
                  <div key={date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">{date}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${colors.headerGradient} h-2 rounded-full`}
                          style={{ width: `${Math.min((minutes / 120) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600">{minutes}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Study Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <h3 className="font-semibold text-blue-800 mb-2">Peak Focus Time</h3>
                <p className="text-blue-700">{bestFocusTime}</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-xl">
                <h3 className="font-semibold text-green-800 mb-2">Study Streak</h3>
                <p className="text-green-700">{userStats.streak} consecutive days</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-xl">
                <h3 className="font-semibold text-purple-800 mb-2">Total Study Time</h3>
                <p className="text-purple-700">{Math.round(userStats.totalStudyTime / 60)} hours completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Award className="mr-2" size={20} />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {achievements.slice(0, 6).map((achievement, index) => (
                <div 
                  key={achievement.id} 
                  className={`p-4 rounded-xl border-2 ${
                    achievement.unlocked 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h3 className={`font-semibold ${achievement.unlocked ? 'text-yellow-700' : 'text-gray-500'}`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-sm ${achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'}`}>
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={achievement.unlocked ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {achievement.points} pts
                    </Badge>
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
