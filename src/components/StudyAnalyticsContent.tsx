
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, Target, Award, Calendar, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';

interface SubjectStats {
  subject: string;
  totalTime: number;
  sessions: number;
  averageSession: number;
  color: string;
}

interface DayStat {
  date: string;
  minutes: number;
  hours: number;
}

interface StudyAnalyticsContentProps {
  subjectStats: SubjectStats[];
  dailyStats: DayStat[];
  bestFocusTime: string;
  productivityScore: number;
  userStats: any;
  achievements: any[];
  isDarkMode: boolean;
  colors: any;
  selectedTimeframe: 'week' | 'month' | 'all';
  setSelectedTimeframe: React.Dispatch<React.SetStateAction<'week' | 'month' | 'all'>>;
}

const StudyAnalyticsContent: React.FC<StudyAnalyticsContentProps> = ({
  subjectStats,
  dailyStats,
  bestFocusTime,
  productivityScore,
  userStats,
  achievements,
  isDarkMode,
  colors,
  selectedTimeframe,
  setSelectedTimeframe
}) => {
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className={`${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : `bg-gradient-to-br ${colors.cardGradient} border-0`
        } shadow-lg`}>
          <CardHeader className="text-center pb-4">
            <CardTitle className={`flex items-center justify-center text-2xl ${
              isDarkMode ? 'text-white' : `text-${colors.textColor}`
            }`}>
              <BarChart3 className="mr-2" size={24} />
              Study Analytics
            </CardTitle>
            <p className={`${
              isDarkMode ? 'text-gray-300' : `text-${colors.textColor}`
            } mt-2 opacity-80`}>
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
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : `bg-gradient-to-r ${colors.headerGradient} text-white`
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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

      {/* Level Widget */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className={`${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
        } shadow-lg`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="relative">
                <Crown size={48} className="text-yellow-500" />
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-black font-bold rounded-full w-8 h-8 flex items-center justify-center text-lg">
                  {userStats.level}
                </div>
              </div>
              <div className="text-center">
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  Level {userStats.level}
                </h3>
                <p className={`${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                  {userStats.totalPoints} XP Total
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {userStats.streak} day streak • {userStats.sessionsCompleted} sessions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Study Time Line Graph */}
      {dailyStats.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white'} shadow-lg`}>
            <CardHeader>
              <CardTitle className={`flex items-center text-lg ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                <TrendingUp className="mr-2" size={20} />
                Study Time Trend (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis 
                      dataKey="date" 
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'} 
                      fontSize={12}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'} 
                      fontSize={12}
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        color: isDarkMode ? '#ffffff' : '#000000',
                        fontSize: '14px'
                      }}
                      formatter={(value, name) => [`${value} hours`, 'Study Time']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
                      strokeWidth={3}
                      dot={{ fill: isDarkMode ? '#60a5fa' : '#3b82f6', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, stroke: isDarkMode ? '#60a5fa' : '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Overview Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white'} shadow-lg`}>
          <CardHeader>
            <CardTitle className={`flex items-center text-lg ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <Target className="mr-2" size={20} />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className={`text-center p-4 rounded-xl ${
                isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
              }`}>
                <Clock className={`mx-auto mb-2 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} size={24} />
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>{Math.round(userStats.totalStudyTime / 60)}</p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Hours Studied</p>
              </div>
              <div className={`text-center p-4 rounded-xl ${
                isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
              }`}>
                <Target className={`mx-auto mb-2 ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`} size={24} />
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`}>{productivityScore}</p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Productivity Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subject Breakdown */}
      {subjectStats.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white'} shadow-lg`}>
            <CardHeader>
              <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Subject Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subjectStats.map((stat, index) => (
                  <div key={stat.subject} className={`p-3 rounded-xl ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{stat.subject}</h3>
                      <Badge variant="secondary">{stat.totalTime}m total</Badge>
                    </div>
                    <div className={`flex justify-between text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white'} shadow-lg`}>
            <CardHeader>
              <CardTitle className={`flex items-center text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <Calendar className="mr-2" size={20} />
                Daily Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailyStats.map((day) => (
                  <div key={day.date} className={`flex items-center justify-between p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{day.date}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 rounded-full h-2 bg-gray-200 dark:bg-gray-600">
                        <div 
                          className={`bg-gradient-to-r ${colors.headerGradient} h-2 rounded-full`}
                          style={{ width: `${Math.min((day.minutes / 120) * 100, 100)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{day.minutes}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Achievements */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white'} shadow-lg`}>
          <CardHeader>
            <CardTitle className={`flex items-center text-lg ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <Award className="mr-2" size={20} />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {achievements.slice(0, 6).map((achievement, index) => (
                <div 
                  key={achievement.id} 
                  className={`p-4 rounded-xl border-2 transition-all ${
                    achievement.unlocked 
                      ? isDarkMode
                        ? 'bg-yellow-900/30 border-yellow-600'
                        : 'bg-yellow-50 border-yellow-200'
                      : isDarkMode
                        ? 'bg-gray-700/50 border-gray-600'
                        : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h3 className={`font-semibold ${
                          achievement.unlocked 
                            ? isDarkMode ? 'text-yellow-400' : 'text-yellow-700'
                            : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-sm ${
                          achievement.unlocked 
                            ? isDarkMode ? 'text-yellow-300' : 'text-yellow-600'
                            : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={achievement.unlocked ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {achievement.points} XP
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

export default StudyAnalyticsContent;

