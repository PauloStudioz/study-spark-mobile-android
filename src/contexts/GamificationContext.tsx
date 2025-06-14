
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
  totalStudyTime: number;
  quizQuestionsCorrect: number;
  routinesCompleted: number;
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
    id: 'quiz-champion',
    title: 'Quiz Champion',
    description: 'Answer 50 quiz questions correctly',
    icon: '🏆',
    points: 80,
    unlocked: false
  },
  {
    id: 'level-master',
    title: 'Level Master',
    description: 'Reach level 10',
    icon: '🌟',
    points: 500,
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
    totalStudyTime: 0,
    quizQuestionsCorrect: 0,
    routinesCompleted: 0
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

  const showNotification = (message: string) => {
    console.log(message); // For debugging
    
    // Simple notification display
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('StudyMate Pro', { body: message, icon: '/favicon.ico' });
    }
    
    // Show toast notification (if available)
    if (typeof window !== 'undefined' && (window as any).toast) {
      (window as any).toast({ title: 'StudyMate Pro', description: message });
    }
  };

  const checkAchievements = (newStats: UserStats): Achievement[] => {
    return achievements.map(achievement => {
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
        case 'quiz-champion':
          shouldUnlock = newStats.quizQuestionsCorrect >= 50;
          break;
        case 'level-master':
          shouldUnlock = newStats.level >= 10;
          break;
      }

      if (shouldUnlock && !achievement.unlocked) {
        showNotification(`🎉 Achievement Unlocked: ${achievement.title}! (+${achievement.points} XP)`);
        // Add achievement points to user stats
        newStats.totalPoints += achievement.points;
        newStats.level = calculateLevel(newStats.totalPoints);
        return { ...achievement, unlocked: true, unlockedAt: new Date() };
      }
      return achievement;
    });
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
    
    showNotification(`+${points} XP for ${activity}!`);
  };

  const completeSession = () => {
    const points = 25;
    const newStats = {
      ...userStats,
      sessionsCompleted: userStats.sessionsCompleted + 1,
      totalPoints: userStats.totalPoints + points
    };
    newStats.level = calculateLevel(newStats.totalPoints);
    
    const newAchievements = checkAchievements(newStats);
    setUserStats(newStats);
    setAchievements(newAchievements);
    saveData(newStats, newAchievements);
    
    showNotification(`+${points} XP for completing study session!`);
  };

  const completeTask = () => {
    const points = 10;
    const newStats = {
      ...userStats,
      tasksCompleted: userStats.tasksCompleted + 1,
      totalPoints: userStats.totalPoints + points
    };
    newStats.level = calculateLevel(newStats.totalPoints);
    
    const newAchievements = checkAchievements(newStats);
    setUserStats(newStats);
    setAchievements(newAchievements);
    saveData(newStats, newAchievements);
    
    showNotification(`+${points} XP for completing task!`);
  };

  const reviewFlashcard = (difficulty: 'easy' | 'medium' | 'hard') => {
    let points = 5; // base points
    if (difficulty === 'easy') points = 10;
    else if (difficulty === 'medium') points = 7;
    else if (difficulty === 'hard') points = 3;

    const newStats = {
      ...userStats,
      flashcardsReviewed: userStats.flashcardsReviewed + 1,
      totalPoints: userStats.totalPoints + points
    };
    newStats.level = calculateLevel(newStats.totalPoints);
    
    const newAchievements = checkAchievements(newStats);
    setUserStats(newStats);
    setAchievements(newAchievements);
    saveData(newStats, newAchievements);
    
    showNotification(`+${points} XP for flashcard review!`);
  };

  const correctQuizAnswer = () => {
    const points = 15;
    const newStats = {
      ...userStats,
      quizQuestionsCorrect: userStats.quizQuestionsCorrect + 1,
      totalPoints: userStats.totalPoints + points
    };
    newStats.level = calculateLevel(newStats.totalPoints);
    
    const newAchievements = checkAchievements(newStats);
    setUserStats(newStats);
    setAchievements(newAchievements);
    saveData(newStats, newAchievements);
    
    showNotification(`+${points} XP for correct answer!`);
  };

  const completeRoutine = () => {
    const points = 30;
    const newStats = {
      ...userStats,
      routinesCompleted: userStats.routinesCompleted + 1,
      totalPoints: userStats.totalPoints + points
    };
    newStats.level = calculateLevel(newStats.totalPoints);
    
    const newAchievements = checkAchievements(newStats);
    setUserStats(newStats);
    setAchievements(newAchievements);
    saveData(newStats, newAchievements);
    
    showNotification(`+${points} XP for completing routine!`);
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
      totalStudyTime: 0,
      quizQuestionsCorrect: 0,
      routinesCompleted: 0
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
