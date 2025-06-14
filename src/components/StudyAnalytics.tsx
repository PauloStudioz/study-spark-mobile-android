
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Trophy, Star, TrendingUp } from "lucide-react";

const StudyAnalytics = () => {
  const { isDarkMode } = useTheme();
  const { userStats } = useGamification();

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '✨';
    return '🌟';
  };

  const getMotivationalMessage = (streak: number) => {
    if (streak >= 30) return "Unstoppable! You're on fire! 🚀";
    if (streak >= 14) return "Two weeks strong! Keep going! 💪";
    if (streak >= 7) return "One week milestone! Amazing! 🎉";
    if (streak >= 3) return "Building momentum! 📈";
    if (streak >= 1) return "Great start! Keep it up! 👍";
    return "Ready to start your streak? 🌟";
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'from-red-500 to-orange-600';
    if (streak >= 14) return 'from-orange-500 to-red-500';
    if (streak >= 7) return 'from-yellow-500 to-orange-500';
    if (streak >= 3) return 'from-blue-500 to-purple-500';
    return 'from-gray-400 to-gray-500';
  };

  const nextLevelXP = (userStats.level + 1) * 100;
  const currentLevelXP = userStats.level * 100;
  const progressToNextLevel = ((userStats.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <div className="space-y-6">
      {/* Level Card - Made more prominent */}
      <Card className={`${isDarkMode ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-700' : 'bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200'} shadow-xl`}>
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Star className={`mx-auto mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} size={32} />
            <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-1`}>
              Level {userStats.level}
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {userStats.xp} / {nextLevelXP} XP
            </p>
          </div>
          
          {/* XP Progress Bar */}
          <div className="w-full bg-gray-300 rounded-full h-3 mb-2 overflow-hidden">
            <div 
              className={`bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500`}
              style={{ width: `${Math.max(5, progressToNextLevel)}%` }}
            />
          </div>
          
          <p className={`text-xs ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            {Math.round(progressToNextLevel)}% to next level
          </p>
        </CardContent>
      </Card>

      {/* Streak Card */}
      <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/90 border-gray-200'} shadow-xl`}>
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <div className="text-4xl mb-2">
              {getStreakEmoji(userStats.streak)}
            </div>
            <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-1`}>
              {userStats.streak}
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Day Streak
            </p>
          </div>
          
          <div className="w-full bg-gray-300 rounded-full h-2 mb-3 overflow-hidden">
            <div 
              className={`bg-gradient-to-r ${getStreakColor(userStats.streak)} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(100, (userStats.streak / 30) * 100)}%` }}
            />
          </div>
          
          <p className={`text-xs font-medium ${isDarkMode ? 'text-yellow-400' : 'text-orange-600'}`}>
            {getMotivationalMessage(userStats.streak)}
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className={`${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white/80 border-gray-200'} shadow-lg`}>
          <CardContent className="p-4 text-center">
            <Calendar className="text-blue-500 mx-auto mb-2" size={24} />
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sessions</p>
            <p className={`text-xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {userStats.sessionsCompleted}
            </p>
          </CardContent>
        </Card>
        
        <Card className={`${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white/80 border-gray-200'} shadow-lg`}>
          <CardContent className="p-4 text-center">
            <TrendingUp className="text-green-500 mx-auto mb-2" size={24} />
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total XP</p>
            <p className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {userStats.xp}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudyAnalytics;
