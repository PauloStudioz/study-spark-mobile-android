
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Crown } from "lucide-react";

type Props = {
  userStats: any;
  isDarkMode: boolean;
};

const LevelWidget: React.FC<Props> = ({ userStats, isDarkMode }) => (
  <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'} shadow-lg`}>
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
);

export default LevelWidget;
