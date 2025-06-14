
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Calendar, Trophy } from "lucide-react";

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

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} rounded-2xl p-6 h-full flex flex-col justify-center items-center space-y-6`}>
      {/* Main Streak Display */}
      <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/90 border-gray-200'} shadow-xl w-full max-w-sm`}>
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-2">
              {getStreakEmoji(userStats.streak)}
            </div>
            <h2 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
              {userStats.streak}
            </h2>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Day Streak
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-300 rounded-full h-2 mb-4 overflow-hidden">
            <div 
              className={`bg-gradient-to-r ${getStreakColor(userStats.streak)} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(100, (userStats.streak / 30) * 100)}%` }}
            />
          </div>
          
          <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-orange-600'}`}>
            {getMotivationalMessage(userStats.streak)}
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
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
            <Trophy className="text-green-500 mx-auto mb-2" size={24} />
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Level</p>
            <p className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {userStats.level}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next Milestone */}
      <div className="text-center">
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Next milestone: {userStats.streak < 7 ? '7 days' : userStats.streak < 14 ? '14 days' : userStats.streak < 30 ? '30 days' : 'Keep going!'}
        </p>
      </div>
    </div>
  );
};

export default StudyAnalytics;
