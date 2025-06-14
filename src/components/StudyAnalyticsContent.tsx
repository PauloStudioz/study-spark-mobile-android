import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, Target, Award, Calendar, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';
import LevelWidget from './LevelWidget';
import StudyTimeTrendChart from './StudyTimeTrendChart';
import PerformanceOverview from './PerformanceOverview';
import SubjectBreakdown from './SubjectBreakdown';
import DailyActivity from './DailyActivity';
import AchievementsSection from './AchievementsSection';

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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <LevelWidget userStats={userStats} isDarkMode={isDarkMode} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <StudyTimeTrendChart dailyStats={dailyStats} isDarkMode={isDarkMode} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <PerformanceOverview userStats={userStats} productivityScore={productivityScore} isDarkMode={isDarkMode} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <SubjectBreakdown subjectStats={subjectStats} isDarkMode={isDarkMode} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <DailyActivity dailyStats={dailyStats} isDarkMode={isDarkMode} colors={colors} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <AchievementsSection achievements={achievements} isDarkMode={isDarkMode} />
      </motion.div>
    </div>
  );
};

export default StudyAnalyticsContent;
