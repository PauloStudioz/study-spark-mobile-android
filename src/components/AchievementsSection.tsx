
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Achievement = {
  id: string,
  unlocked: boolean,
  icon: string,
  title: string,
  description: string,
  points: number
};

const AchievementsSection = ({
  achievements,
  isDarkMode
}: {
  achievements: Achievement[],
  isDarkMode: boolean
}) => (
  <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white'} shadow-lg`}>
    <CardHeader>
      <CardTitle className={`flex items-center text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        <Award className="mr-2" size={20} />
        Recent Achievements
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 gap-3">
        {achievements.slice(0, 6).map((achievement) => (
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
);

export default AchievementsSection;
