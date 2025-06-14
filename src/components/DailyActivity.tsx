
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type DayStat = {
  date: string;
  minutes: number;
  hours: number;
};
type Colors = { headerGradient: string };

const DailyActivity = ({
  dailyStats,
  isDarkMode,
  colors
}: {
  dailyStats: DayStat[],
  isDarkMode: boolean,
  colors: Colors
}) => {
  if (!dailyStats.length) return null;
  return (
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
            <div key={day.date} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
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
  )
};

export default DailyActivity;
