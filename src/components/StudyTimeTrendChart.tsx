
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DayStat {
  date: string;
  minutes: number;
  hours: number;
}

const StudyTimeTrendChart = ({
  dailyStats,
  isDarkMode,
}: {
  dailyStats: DayStat[];
  isDarkMode: boolean;
}) => {
  if (!dailyStats.length) return null;
  return (
    <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white'} shadow-lg`}>
      <CardHeader>
        <CardTitle className={`flex items-center text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          <TrendingUp className="mr-2" size={20} />
          Study Time Trend (Last 7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="date" 
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'} 
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'} 
                fontSize={12}
                tick={{ fontSize: 12 }}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: isDarkMode ? '#ffffff' : '#000000',
                  fontSize: '14px'
                }}
                formatter={(value, name) => [`${value} hours`, 'Study Time']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
                strokeWidth={3}
                dot={{ fill: isDarkMode ? '#60a5fa' : '#3b82f6', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: isDarkMode ? '#60a5fa' : '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyTimeTrendChart;
