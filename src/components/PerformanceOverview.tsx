
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Clock } from 'lucide-react';

const PerformanceOverview = ({
  userStats,
  productivityScore,
  isDarkMode
}: {
  userStats: any,
  productivityScore: number,
  isDarkMode: boolean
}) => (
  <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white'} shadow-lg`}>
    <CardHeader>
      <CardTitle className={`flex items-center text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        <Target className="mr-2" size={20} />
        Performance Overview
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        <div className={`text-center p-4 rounded-xl ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
          <Clock className={`mx-auto mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{Math.round(userStats.totalStudyTime / 60)}</p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hours Studied</p>
        </div>
        <div className={`text-center p-4 rounded-xl ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
          <Target className={`mx-auto mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} size={24} />
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{productivityScore}</p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Productivity Score</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default PerformanceOverview;
