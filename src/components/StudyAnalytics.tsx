
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Star, Trophy } from "lucide-react";

const StudyAnalytics = () => {
  const { isDarkMode } = useTheme();
  const { userStats } = useGamification();

  const getProgressPercentage = () => {
    const pointsInCurrentLevel = userStats.totalPoints % 100;
    return (pointsInCurrentLevel / 100) * 100;
  };

  const getPointsToNextLevel = () => {
    return 100 - (userStats.totalPoints % 100);
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} rounded-2xl p-6 h-full flex flex-col justify-center items-center space-y-8`}>
      {/* Main Level Display */}
      <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'} shadow-xl w-full max-w-sm`}>
        <CardContent className="p-8 text-center">
          <div className="relative mb-6">
            <Crown size={64} className="text-yellow-500 mx-auto" />
            <div className="absolute -top-3 -right-3 bg-yellow-400 text-black font-bold rounded-full w-12 h-12 flex items-center justify-center text-xl shadow-lg">
              {userStats.level}
            </div>
          </div>
          
          <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
            Level {userStats.level}
          </h2>
          
          <p className={`text-lg mb-4 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
            {userStats.totalPoints.toLocaleString()} XP
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-300 rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {getPointsToNextLevel()} XP to next level
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <Card className={`${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white/80 border-gray-200'} shadow-lg`}>
          <CardContent className="p-4 text-center">
            <Star className="text-blue-500 mx-auto mb-2" size={24} />
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Streak</p>
            <p className={`text-xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {userStats.streak}
            </p>
          </CardContent>
        </Card>
        
        <Card className={`${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white/80 border-gray-200'} shadow-lg`}>
          <CardContent className="p-4 text-center">
            <Trophy className="text-green-500 mx-auto mb-2" size={24} />
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sessions</p>
            <p className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {userStats.sessionsCompleted}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Motivational Message */}
      <div className="text-center">
        <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Keep it up! 💪
        </p>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          You're doing amazing on your learning journey
        </p>
      </div>
    </div>
  );
};

export default StudyAnalytics;
