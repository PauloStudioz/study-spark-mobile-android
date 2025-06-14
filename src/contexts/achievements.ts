// Achievements & check function split out for clarity
import { Achievement, UserStats } from "./GamificationContext";
import { calculateLevel } from "./gamificationLogic";

export const defaultAchievements: Achievement[] = [
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

export function checkAchievements(
  achievements: Achievement[],
  newStats: UserStats,
  showNotification: (msg: string) => void
): Achievement[] {
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
      newStats.totalPoints += achievement.points;
      newStats.level = calculateLevel(newStats.totalPoints);
      return { ...achievement, unlocked: true, unlockedAt: new Date() };
    }
    return achievement;
  });
}
