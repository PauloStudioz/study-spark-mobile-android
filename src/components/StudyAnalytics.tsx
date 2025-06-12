
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Trophy, Clock, Target, TrendingUp, Award } from 'lucide-react';
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
  const [goals, setGoals] = useState<Goals>({
    dailyFocusMinutes: 120,
    weeklySessions: 14,
    monthlyQuizzes: 20
  });
  const [studyStreak, setStudyStreak] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    // Load study data from localStorage
    const savedData = localStorage.getItem('studymate-analytics');
    if (savedData) {
      const data = JSON.parse(savedData);
      setStudyData(data.studyData || []);
      setStudyStreak(data.studyStreak || 0);
      setTotalStudyTime(data.totalStudyTime || 0);
      setAchievements(data.achievements || []);
    } else {
      // Generate sample data for demo
      generateSampleData();
    }
  }, []);

  const generateSampleData = () => {
    const sampleData: StudyData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      sampleData.push({
        date: date.toISOString().split('T')[0],
        focusTime: Math.floor(Math.random() * 120) + 30,
        breakTime: Math.floor(Math.random() * 40) + 10,
        sessions: Math.floor(Math.random() * 8) + 2,
        quizScore: Math.floor(Math.random() * 40) + 60
      });
    }
    
    setStudyData(sampleData);
    setStudyStreak(5);
    setTotalStudyTime(890);
    setAchievements(['First Week', 'Quiz Master', 'Focus Champion']);
  };

  const weeklyData = studyData.map(day => ({
    day: new Date(day.date).toLocaleDateString('en', { weekday: 'short' }),
    'Focus Time': day.focusTime,
    'Break Time': day.breakTime,
    Sessions: day.sessions * 10 // Scale for visibility
  }));

  const pieData = [
    { name: 'Focus Time', value: studyData.reduce((acc, day) => acc + day.focusTime, 0), color: '#8884d8' },
    { name: 'Break Time', value: studyData.reduce((acc, day) => acc + day.breakTime, 0), color: '#82ca9d' },
  ];

  const todayData = studyData[studyData.length - 1] || { focusTime: 0, sessions: 0, quizScore: 0 };
  const dailyProgress = (todayData.focusTime / goals.dailyFocusMinutes) * 100;
  const weeklyProgress = (studyData.reduce((acc, day) => acc + day.sessions, 0) / goals.weeklySessions) * 100;

  const achievementsList = [
    { id: 'first-week', name: 'First Week', description: 'Complete 7 days of studying', icon: '🎯' },
    { id: 'quiz-master', name: 'Quiz Master', description: 'Score 90%+ on 10 quizzes', icon: '🧠' },
    { id: 'focus-champion', name: 'Focus Champion', description: 'Complete 100 focus sessions', icon: '⚡' },
    { id: 'streak-warrior', name: 'Streak Warrior', description: 'Maintain 30-day study streak', icon: '🔥' },
    { id: 'time-master', name: 'Time Master', description: 'Study for 50+ hours total', icon: '⏰' },
  ];

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
                <span className="text-2xl font-bold text-gray-800">{totalStudyTime}h</span>
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

      {/* Daily Goals */}
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
                <span>{studyData.reduce((acc, day) => acc + day.sessions, 0)}/{goals.weeklySessions}</span>
              </div>
              <Progress value={weeklyProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className={`bg-gradient-to-br ${currentTheme.cardGradient} border-0`}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Focus Time" fill="#8884d8" />
                <Bar dataKey="Break Time" fill="#82ca9d" />
              </BarChart>
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
              {achievementsList.map((achievement, index) => (
                <div
                  key={achievement.id}
                  className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                    achievements.includes(achievement.id)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <span className="text-2xl mr-3">{achievement.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{achievement.name}</h4>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                  {achievements.includes(achievement.id) && (
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
