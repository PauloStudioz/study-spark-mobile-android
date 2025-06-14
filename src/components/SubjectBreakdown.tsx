
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type SubjectStats = {
  subject: string,
  totalTime: number,
  sessions: number,
  averageSession: number,
  color: string
};

const SubjectBreakdown = ({
  subjectStats,
  isDarkMode
}: {
  subjectStats: SubjectStats[],
  isDarkMode: boolean
}) => {
  if (!subjectStats.length) return null;
  return (
    <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white'} shadow-lg`}>
      <CardHeader>
        <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Subject Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {subjectStats.map((stat) => (
            <div key={stat.subject} className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{stat.subject}</h3>
                <Badge variant="secondary">{stat.totalTime}m total</Badge>
              </div>
              <div className={`flex justify-between text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span>{stat.sessions} sessions</span>
                <span>Avg: {stat.averageSession}m</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default SubjectBreakdown;
