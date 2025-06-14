import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';
import StudyAnalyticsContent from './StudyAnalyticsContent';

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
  const { getThemeColors, isDarkMode } = useTheme();
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
    const colorsArr = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
    return Array.from(subjectMap.entries()).map(([subject, stats], index) => ({
      subject,
      totalTime: stats.totalTime,
      sessions: stats.sessions,
      averageSession: Math.round(stats.totalTime / stats.sessions),
      color: colorsArr[index % colorsArr.length]
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
      .slice(-7)
      .map(([date, minutes]) => ({
        date: date.split('/').slice(0, 2).join('/'),
        minutes,
        hours: Number((minutes / 60).toFixed(1))
      }));
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
    const consistencyScore = Math.min(totalSessions * 10, 100);
    const qualityScore = Math.min(averageSession * 2, 100);
    return Math.round((consistencyScore + qualityScore) / 2);
  };

  const subjectStats = getSubjectStats();
  const dailyStats = getDailyStats();
  const bestFocusTime = getFocusPatterns();
  const productivityScore = getProductivityScore();

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-950">
      <div className="flex-1 p-4 pb-24">
        <StudyAnalyticsContent
          subjectStats={subjectStats}
          dailyStats={dailyStats}
          bestFocusTime={bestFocusTime}
          productivityScore={productivityScore}
          userStats={userStats}
          achievements={achievements}
          isDarkMode={isDarkMode}
          colors={colors}
          selectedTimeframe={selectedTimeframe}
          setSelectedTimeframe={setSelectedTimeframe}
        />
      </div>
    </div>
  );
};

export default StudyAnalytics;
