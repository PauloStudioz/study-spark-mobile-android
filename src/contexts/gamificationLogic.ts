
// All user level, XP, streak/stat helpers
import { UserStats } from "./GamificationContext";

// XP needed for each level (level 1 = 0, level 2 = 100, level 3 = 200, ...)
export function calculateLevel(points: number) {
  if (points < 100) return 1;
  return Math.floor(points / 100) + 1;
}

// Calculate percentage progress to next level (never negative)
export function getLevelProgress(stats: UserStats) {
  const nextLevelXP = (stats.level + 1) * 100;
  const currentLevelXP = stats.level * 100;
  if (stats.totalPoints < currentLevelXP) return 0;
  const percent = ((stats.totalPoints - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  return Math.max(0, Math.min(100, percent));
}

// Update streak, last active date
export function handleStreak(newStats: UserStats): UserStats {
  const today = new Date().toDateString();
  let updatedStats = { ...newStats };

  if (!newStats.lastActiveDate) {
    updatedStats.streak = 1;
    updatedStats.lastActiveDate = today;
  } else {
    const lastDate = new Date(newStats.lastActiveDate);
    const diffDays = Math.floor(
      (new Date(today).getTime() - lastDate.getTime())
      / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) {
      // No change
    } else if (diffDays === 1) {
      updatedStats.streak = (newStats.streak || 0) + 1;
      updatedStats.lastActiveDate = today;
    } else {
      updatedStats.streak = 1;
      updatedStats.lastActiveDate = today;
    }
  }
  return updatedStats;
}
