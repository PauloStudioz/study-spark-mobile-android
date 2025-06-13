
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface UserStats {
  totalPoints: number;
  level: number;
  streak: number;
  sessionsCompleted: number;
  tasksCompleted: number;
  flashcardsReviewed: number;
  totalStudyTime: number; // in minutes
}

interface GamificationContextType {
  userStats: UserStats;
  achievements: Achievement[];
  addPoints: (points: number, activity: string) => void;
  completeSession: () => void;
  completeTask: () => void;
  reviewFlashcard: () => void;
  addStudyTime: (minutes: number) => void;
  resetStats: () => void;
}

const defaultAchievements: Achievement[] = [
  {
    id: 'first-session',
    title: 'First Timer',
    description: 'Complete your first Pomodoro session',
    icon: '🍅',
    points: 10,
    unlocked: false
  },
  {
    id: 'focus-master',
    title: 'Focus Master',
    description: 'Complete 10 sessions in one day',
    icon: '🎯',
    points: 50,
    unlocked: false
  },
  {
    id: 'consistency-king',
    title: 'Consistency King',
    description: 'Maintain a 7-day streak',
    icon: '👑',
    points: 100,
    unlocked: false
  },
  {
    id: 'task-crusher',
    title: 'Task Crusher',
    description: 'Complete 25 tasks',
    icon: '⚡',
    points: 75,
    unlocked: false
  },
  {
    id: 'knowledge-seeker',
    title: 'Knowledge Seeker',
    description: 'Review 100 flashcards',
    icon: '🧠',
    points: 60,
    unlocked: false
  },
  {
    id: 'marathon-runner',
    title: 'Marathon Runner',
    description: 'Study for 8 hours total',
    icon: '🏃',
    points: 200,
    unlocked: false
  }
];

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    level: 1,
    streak: 0,
    sessionsCompleted: 0,
    tasksCompleted: 0,
    flashcardsReviewed: 0,
    totalStudyTime: 0
  });

  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);

  useEffect(() => {
    const savedStats = localStorage.getItem('studymate-stats');
    const savedAchievements = localStorage.getItem('studymate-achievements');
    
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }
    
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
  }, []);

  const saveData = (newStats: UserStats, newAchievements: Achievement[]) => {
    localStorage.setItem('studymate-stats', JSON.stringify(newStats));
    localStorage.setItem('studymate-achievements', JSON.stringify(newAchievements));
  };

  const calculateLevel = (points: number) => Math.floor(points / 100) + 1;

  const checkAchievements = (newStats: UserStats) => {
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.unlocked) return achievement;

      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first-session':
          shouldUnlock = newStats.sessionsCompleted >= 1;
          break;
        case 'focus-master':
          shouldUnlock = newStats.sessionsCompleted >= 10;
          break;
        case 'consistency-king':
          shouldUnlock = newStats.streak >= 7;
          break;
        case 'task-crusher':
          shouldUnlock = newStats.tasksCompleted >= 25;
          break;
        case 'knowledge-seeker':
          shouldUnlock = newStats.flashcardsReviewed >= 100;
          break;
        case 'marathon-runner':
          shouldUnlock = newStats.totalStudyTime >= 480; // 8 hours
          break;
      }

      if (shouldUnlock) {
        return { ...achievement, unlocked: true, unlockedAt: new Date() };
      }
      return achievement;
    });

    return updatedAchievements;
  };

  const addPoints = (points: number, activity: string) => {
    const newStats = {
      ...userStats,
      totalPoints: userStats.totalPoints + points,
      level: calculateLevel(userStats.totalPoints + points)
    };
    
    const newAchievements = checkAchievements(newStats);
    setUserStats(newStats);
    setAchievements(newAchievements);
    saveData(newStats, newAchievements);
  };

  const completeSession = () => {
    const newStats = {
      ...userStats,
      sessionsCompleted: userStats.sessionsCompleted + 1,
      totalPoints: userStats.totalPoints + 20
    };
    newStats.level = calculateLevel(newStats.totalPoints);
    
    const newAchievements = checkAchievements(newStats);
    setUserStats(newStats);
    setAchievements(newAchievements);
    saveData(newStats, newAchievements);
  };

  const completeTask = () => {
    const newStats = {
      ...userStats,
      tasksCompleted: userStats.tasksCompleted + 1,
      totalPoints: userStats.totalPoints + 10
    };
    newStats.level = calculateLevel(newStats.totalPoints);
    
    const newAchievements = checkAchievements(newStats);
    setUserStats(newStats);
    setAchievements(newAchievements);
    saveData(newStats, newAchievements);
  };

  const reviewFlashcard = () => {
    const newStats = {
      ...userStats,
      flashcardsReviewed: userStats.flashcardsReviewed + 1,
      totalPoints: userStats.totalPoints + 5
    };
    newStats.level = calculateLevel(newStats.totalPoints);
    
    const newAchievements = checkAchievements(newStats);
    setUserStats(newStats);
    setAchievements(newAchievements);
    saveData(newStats, newAchievements);
  };

  const addStudyTime = (minutes: number) => {
    const newStats = {
      ...userStats,
      totalStudyTime: userStats.totalStudyTime + minutes
    };
    
    const newAchievements = checkAchievements(newStats);
    setUserStats(newStats);
    setAchievements(newAchievements);
    saveData(newStats, newAchievements);
  };

  const resetStats = () => {
    const defaultStats: UserStats = {
      totalPoints: 0,
      level: 1,
      streak: 0,
      sessionsCompleted: 0,
      tasksCompleted: 0,
      flashcardsReviewed: 0,
      totalStudyTime: 0
    };
    
    const resetAchievements = defaultAchievements.map(a => ({ ...a, unlocked: false }));
    
    setUserStats(defaultStats);
    setAchievements(resetAchievements);
    saveData(defaultStats, resetAchievements);
  };

  return (
    <GamificationContext.Provider value={{
      userStats,
      achievements,
      addPoints,
      completeSession,
      completeTask,
      reviewFlashcard,
      addStudyTime,
      resetStats
    }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
