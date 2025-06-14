import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultAchievements, checkAchievements } from "./achievements";
import { calculateLevel, handleStreak, getLevelProgress } from "./gamificationLogic";
import { showNotification } from "./notifications";

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
  totalStudyTime: number;
  quizQuestionsCorrect: number;
  routinesCompleted: number;
  lastActiveDate?: string; // New: track last day activity for better streaks
}

interface GamificationContextType {
  userStats: UserStats;
  achievements: Achievement[];
  addPoints: (points: number, activity: string) => void;
  completeSession: () => void;
  completeTask: () => void;
  reviewFlashcard: (difficulty: 'easy' | 'medium' | 'hard') => void;
  correctQuizAnswer: () => void;
  completeRoutine: () => void;
  addStudyTime: (minutes: number) => void;
  resetStats: () => void;
  showNotification: (message: string) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    level: 1,
    streak: 0,
    sessionsCompleted: 0,
    tasksCompleted: 0,
    flashcardsReviewed: 0,
    totalStudyTime: 0,
    quizQuestionsCorrect: 0,
    routinesCompleted: 0,
    lastActiveDate: undefined
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

  const addPoints = (points: number, activity: string) => {
    let newStats = {
      ...userStats,
      totalPoints: userStats.totalPoints + points,
    };
    newStats.level = calculateLevel(newStats.totalPoints);

    newStats = handleStreak(newStats);

    const newAchievements = checkAchievements(achievements, newStats, showNotification);
    setUserStats(newStats);
    setAchievements(newAchievements);
    saveData(newStats, newAchievements);
    showNotification(`+${points} XP for ${activity}!`);
  };

  const completeSession = () => {
    const points = 25;
    let newStats = {
      ...userStats,
      sessionsCompleted: userStats.sessionsCompleted + 1,
      totalPoints: userStats.totalPoints + points
    };
    newStats.level = calculateLevel(newStats.totalPoints);

    newStats = handleStreak(newStats);

    const newAchievements = checkAchievements(achievements, newStats, showNotification);
    setUserStats(newStats);
    setAchievements(newAchievements);
    saveData(newStats, newAchievements);
    showNotification(`+${points} XP for completing study session!`);
  };

  const completeTask = () => {
    const points = 10;
    let newStats = {
      ...userStats,
      tasksCompleted: userStats.tasksCompleted + 1,
      totalPoints: userStats.totalPoints + points
    };
    newStats.level = calculateLevel(newStats.totalPoints);

    newStats = handleStreak(newStats);

    const newAchievements = checkAchievements(achievements, newStats, showNotification);
    setUserStats(newStats);
    setAchievements(newAchievements);
    saveData(newStats, newAchievements);
    showNotification(`+${points} XP for completing task!`);
  };

  const reviewFlashcard = (difficulty: 'easy' | 'medium' | 'hard') => {
    let points = 5;
    if (difficulty === 'easy') points = 10;
    else if (difficulty === 'medium') points = 7;
    else if (difficulty === 'hard') points = 3;

    let newStats = {
      ...userStats,
      flashcardsReviewed: userStats.flashcardsReviewed + 1,
      totalPoints: userStats.totalPoints + points
    };
    newStats.level = calculateLevel(newStats.totalPoints);

    newStats = handleStreak(newStats);

    const newAchievements = checkAchievements(achievements, newStats, showNotification);
    setUserStats(newStats);
    setAchievements(newAchievements);
    saveData(newStats, newAchievements);
    showNotification(`+${points} XP for flashcard review!`);
  };

  const correctQuizAnswer = () => {
    const points = 15;
    let newStats = {
      ...userStats,
      quizQuestionsCorrect: userStats.quizQuestionsCorrect + 1,
      totalPoints: userStats.totalPoints + points
    };
    newStats.level = calculateLevel(newStats.totalPoints);

    newStats = handleStreak(newStats);

    const newAchievements = checkAchievements(achievements, newStats, showNotification);
    setUserStats(newStats);
    setAchievements(newAchievements);
    saveData(newStats, newAchievements);
    showNotification(`+${points} XP for correct answer!`);
  };

  const completeRoutine = () => {
    const points = 30;
    let newStats = {
      ...userStats,
      routinesCompleted: userStats.routinesCompleted + 1,
      totalPoints: userStats.totalPoints + points
    };
    newStats.level = calculateLevel(newStats.totalPoints);

    newStats = handleStreak(newStats);

    const newAchievements = checkAchievements(achievements, newStats, showNotification);
    setUserStats(newStats);
    setAchievements(newAchievements);
    saveData(newStats, newAchievements);
    showNotification(`+${points} XP for completing routine!`);
  };

  const addStudyTime = (minutes: number) => {
    let newStats = {
      ...userStats,
      totalStudyTime: userStats.totalStudyTime + minutes
    };

    newStats = handleStreak(newStats);

    const newAchievements = checkAchievements(achievements, newStats, showNotification);
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
      totalStudyTime: 0,
      quizQuestionsCorrect: 0,
      routinesCompleted: 0
    };
    
    const resetAchievements = defaultAchievements.map(a => ({ ...a, unlocked: false }));
    
    setUserStats(defaultStats);
    setAchievements(resetAchievements);
    saveData(defaultStats, resetAchievements);
  };

  // Only return 0-100% for level progress and never negative:
  const getLevelProgress = (stats: UserStats) => {
    const nextLevelXP = (stats.level + 1) * 100;
    const currentLevelXP = stats.level * 100;
    if (stats.totalPoints < currentLevelXP) return 0;
    const percent = ((stats.totalPoints - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, percent));
  };

  return (
    <GamificationContext.Provider value={{
      userStats,
      achievements,
      addPoints,
      completeSession,
      completeTask,
      reviewFlashcard,
      correctQuizAnswer,
      completeRoutine,
      addStudyTime,
      resetStats,
      showNotification
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
