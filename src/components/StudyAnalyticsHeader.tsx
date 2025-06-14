
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface StudyAnalyticsHeaderProps {
  isDarkMode: boolean;
  colors: any;
  selectedTimeframe: 'week' | 'month' | 'all';
  setSelectedTimeframe: React.Dispatch<React.SetStateAction<'week' | 'month' | 'all'>>;
}

const StudyAnalyticsHeader: React.FC<StudyAnalyticsHeaderProps> = ({
  isDarkMode,
  colors,
  selectedTimeframe,
  setSelectedTimeframe
}) => (
  <Card className={`${
    isDarkMode
      ? 'bg-gray-800/50 border-gray-700'
      : `bg-gradient-to-br ${colors.cardGradient} border-0`
  } shadow-lg`}>
    <CardHeader className="text-center pb-4">
      <CardTitle className={`flex items-center justify-center text-2xl ${
        isDarkMode ? "text-white" : `text-${colors.textColor}`
      }`}>
        <BarChart3 className="mr-2" size={24} />
        Study Analytics
      </CardTitle>
      <p className={`${
        isDarkMode ? "text-gray-300" : `text-${colors.textColor}`
      } mt-2 opacity-80`}>
        Advanced insights into your learning journey
      </p>
    </CardHeader>
    <CardContent>
      <div className="flex justify-center space-x-2">
        {(['week', 'month', 'all'] as const).map(timeframe => (
          <button
            key={timeframe}
            onClick={() => setSelectedTimeframe(timeframe)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedTimeframe === timeframe
                ? isDarkMode
                  ? 'bg-blue-600 text-white'
                  : `bg-gradient-to-r ${colors.headerGradient} text-white`
                : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
          </button>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default StudyAnalyticsHeader;
