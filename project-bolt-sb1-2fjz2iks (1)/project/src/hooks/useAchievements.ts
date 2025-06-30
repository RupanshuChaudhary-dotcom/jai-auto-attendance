import { useState, useEffect } from 'react';
import { Achievement } from '../types';

export const useAchievements = (userId: string | null) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const STORAGE_KEY = userId ? `achievements_${userId}` : 'achievements';

  useEffect(() => {
    if (!userId) {
      setAchievements([]);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setAchievements(JSON.parse(stored));
    }
  }, [userId, STORAGE_KEY]);

  const saveAchievements = (newAchievements: Achievement[]) => {
    if (!userId) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAchievements));
    setAchievements(newAchievements);
  };

  const unlockAchievement = (achievement: Omit<Achievement, 'id' | 'unlockedAt' | 'userId'>) => {
    if (!userId) return;
    
    const existing = achievements.find(a => a.title === achievement.title);
    if (existing) return;

    const newAchievement: Achievement = {
      ...achievement,
      id: crypto.randomUUID(),
      userId,
      unlockedAt: new Date().toISOString()
    };

    const updatedAchievements = [...achievements, newAchievement];
    saveAchievements(updatedAchievements);
  };

  const checkAchievements = (stats: any) => {
    if (!userId) return;
    
    // First day achievement
    if (stats.totalDays === 1) {
      unlockAchievement({
        title: 'First Day',
        description: 'Completed your first day of attendance tracking',
        icon: '🎉',
        category: 'streak'
      });
    }

    // Streak achievements
    if (stats.currentStreak === 7) {
      unlockAchievement({
        title: 'Week Warrior',
        description: 'Maintained a 7-day attendance streak',
        icon: '🔥',
        category: 'streak'
      });
    }

    if (stats.currentStreak === 30) {
      unlockAchievement({
        title: 'Monthly Master',
        description: 'Maintained a 30-day attendance streak',
        icon: '👑',
        category: 'streak'
      });
    }

    // Hours achievements
    if (stats.totalDays > 0 && stats.averageHours >= 8) {
      unlockAchievement({
        title: 'Dedicated Worker',
        description: 'Maintained 8+ hours average daily',
        icon: '💪',
        category: 'hours'
      });
    }

    // Punctuality achievements
    if (stats.attendanceRate === 100 && stats.totalDays >= 10) {
      unlockAchievement({
        title: 'Perfect Attendance',
        description: 'Achieved 100% attendance rate',
        icon: '⭐',
        category: 'punctuality'
      });
    }
  };

  return {
    achievements,
    unlockAchievement,
    checkAchievements
  };
};