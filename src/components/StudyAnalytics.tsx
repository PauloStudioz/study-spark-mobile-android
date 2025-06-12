
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, Trophy, Clock, Target, TrendingUp, Award, BarChart3, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTheme } from '@/contexts/ThemeContext';

interface StudyData {
  date: string;
  focusTime: number;
  breakTime: number;
  sessions: number;
  quizScore: number;
}

interface Goals {
  dailyFocusMinutes: number;
  weeklySessions: number;
  monthlyQuizzes: number;
}

const StudyAnalytics = () => {
  const { currentTheme } = useTheme();
  const [studyData, setStudyData] = useState<StudyData[]>([]);
  const [viewMode, setViewMode] = useState<'line' | 'bar'>('line');
  const [goals, setGoals] = useState<Goals>({
    dailyFocusMinutes: 120,
    weeklySessions: 14,
    monthlyQuizzes: 20
  });
  const [studyStreak, setStudyStreak] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    loadStudyData();
  }, []);

  const loadStudyData = () => {
    const savedData = localStorage.getItem('studymate-analytics');
    if (savedData) {
      const data = JSON.parse(savedData);
      setStudyData(data.studyData || []);
      setStudyStreak(data.studyStreak || 0);
      setTotalStudyTime(data.totalStudyTime || 0);
      setAchievements(data.achievements || []);
    } else {
      generateSampleData();
    }
  };

  const generateSampleData = () => {
    const sampleData: StudyData[] = [];
    const today = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      sampleData.push({
        date: date.toISOString().split('T')[0],
        focusTime: Math.floor(Math.random() * 120) + 30 + Math.sin(i * 0.5) * 20,
        breakTime: Math.floor(Math.random() * 40) + 10,
        sessions: Math.floor(Math.random() * 8) + 2,
        quizScore: Math.floor(Math.random() * 40) + 60 + Math.cos(i * 0.3) * 15
      });
    }
    
    setStudyData(sampleData);
    setStudyStreak(7);
    setTotalStudyTime(1250);
    setAchievements(['First Week', 'Quiz Master', 'Focus Champion']);
  };

  const chartData = studyData.map(day => ({
    date: new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    'Focus Time': day.focusTime,
    'Quiz Score': day.quizScore,
    'Sessions': day.sessions * 10 // Scale for visibility
  }));

  const todayData = studyData[studyData.length - 1] || { focusTime: 0, sessions: 0, quizScore: 0 };
  const dailyProgress = Math.min((todayData.focusTime / goals.dailyFocusMinutes) * 100, 100);
  const weeklyProgress = Math.min((studyData.slice(-7).reduce((acc, day) => acc + day.sessions, 0) / goals.weeklySessions) * 100, 100);

  const averageFocusTime = Math.round(studyData.reduce((acc, day) => acc + day.focusTime, 0) / studyData.length) || 0;
  const averageQuizScore = Math.round(studyData.reduce((acc, day) => acc + day.quizScore, 0) / studyData.length) || 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`bg-gradient-to-br ${currentTheme.cardGradient} border-0`}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-2xl font-bold text-gray-800">{Math.round(totalStudyTime / 60)}h</span>
              </div>
              <p className="text-sm text-gray-600">Total Study Time</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`bg-gradient-to-br ${currentTheme.cardGradient} border-0`}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-orange-600 mr-2" />
                <span className="text-2xl font-bold text-gray-800">{studyStreak}</span>
              </div>
              <p className="text-sm text-gray-600">Study Streak</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className={`bg-gradient-to-br ${currentTheme.cardGradient} border-0`}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Focus Time</span>
                <span>{todayData.focusTime}/{goals.dailyFocusMinutes} min</span>
              </div>
              <Progress value={dailyProgress} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Weekly Sessions</span>
                <span>{studyData.slice(-7).reduce((acc, day) => acc + day.sessions, 0)}/{goals.weeklySessions}</span>
              </div>
              <Progress value={weeklyProgress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{averageFocusTime}min</div>
                <div className="text-xs text-gray-600">Avg Daily Focus</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{averageQuizScore}%</div>
                <div className="text-xs text-gray-600">Avg Quiz Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className={`bg-gradient-to-br ${currentTheme.cardGradient} border-0`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Study Trends (Last 2 Weeks)
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setViewMode('line')}
                  variant={viewMode === 'line' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-lg"
                >
                  <Activity size={16} className="mr-1" />
                  Line
                </Button>
                <Button
                  onClick={() => setViewMode('bar')}
                  variant={viewMode === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-lg"
                >
                  <BarChart3 size={16} className="mr-1" />
                  Bar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              {viewMode === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Focus Time" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Quiz Score" 
                    stroke="#82ca9d" 
                    strokeWidth={3}
                    dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#82ca9d', strokeWidth: 2 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="Focus Time" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Quiz Score" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className={`bg-gradient-to-br ${currentTheme.cardGradient} border-0`}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'first-week', name: 'First Week', description: 'Complete 7 days of studying', icon: '🎯', unlocked: true },
                { id: 'quiz-master', name: 'Quiz Master', description: 'Score 90%+ on 10 quizzes', icon: '🧠', unlocked: true },
                { id: 'focus-champion', name: 'Focus Champion', description: 'Complete 100 focus sessions', icon: '⚡', unlocked: true },
                { id: 'streak-warrior', name: 'Streak Warrior', description: 'Maintain 30-day study streak', icon: '🔥', unlocked: false },
                { id: 'time-master', name: 'Time Master', description: 'Study for 100+ hours total', icon: '⏰', unlocked: false },
              ].map((achievement, index) => (
                <div
                  key={achievement.id}
                  className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                    achievement.unlocked
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <span className="text-2xl mr-3">{achievement.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{achievement.name}</h4>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && (
                    <span className="text-green-600 text-sm font-semibold">✓</span>
                  )}
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
