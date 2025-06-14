
import React from "react";
import StudyAnalyticsHeader from "./StudyAnalyticsHeader";
import LevelWidget from "./LevelWidget";
import StudyTimeTrendChart from "./StudyTimeTrendChart";
import PerformanceOverview from "./PerformanceOverview";
import SubjectBreakdown from "./SubjectBreakdown";
import DailyActivity from "./DailyActivity";
import AchievementsSection from "./AchievementsSection";

interface SubjectStats {
  subject: string;
  totalTime: number;
  sessions: number;
  averageSession: number;
  color: string;
}
interface DayStat {
  date: string;
  minutes: number;
  hours: number;
}
interface StudyAnalyticsContentProps {
  subjectStats: SubjectStats[];
  dailyStats: DayStat[];
  bestFocusTime: string;
  productivityScore: number;
  userStats: any;
  achievements: any[];
  isDarkMode: boolean;
  colors: any;
  selectedTimeframe: 'week' | 'month' | 'all';
  setSelectedTimeframe: React.Dispatch<React.SetStateAction<'week' | 'month' | 'all'>>;
}

const StudyAnalyticsContent: React.FC<StudyAnalyticsContentProps> = ({
  subjectStats,
  dailyStats,
  productivityScore,
  userStats,
  achievements,
  isDarkMode,
  colors,
  selectedTimeframe,
  setSelectedTimeframe
}) => (
  <div className="space-y-4 max-w-4xl mx-auto">
    <StudyAnalyticsHeader
      isDarkMode={isDarkMode}
      colors={colors}
      selectedTimeframe={selectedTimeframe}
      setSelectedTimeframe={setSelectedTimeframe}
    />
    <LevelWidget userStats={userStats} isDarkMode={isDarkMode} />
    <StudyTimeTrendChart dailyStats={dailyStats} isDarkMode={isDarkMode} />
    <PerformanceOverview userStats={userStats} productivityScore={productivityScore} isDarkMode={isDarkMode} />
    <SubjectBreakdown subjectStats={subjectStats} isDarkMode={isDarkMode} />
    <DailyActivity dailyStats={dailyStats} isDarkMode={isDarkMode} colors={colors} />
    <AchievementsSection achievements={achievements} isDarkMode={isDarkMode} />
  </div>
);

export default StudyAnalyticsContent;
