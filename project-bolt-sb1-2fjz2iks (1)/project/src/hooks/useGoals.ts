import { useState, useEffect } from 'react';
import { Goal } from '../types';

export const useGoals = (userId: string | null) => {
  const [goals, setGoals] = useState<Goal[]>([]);

  const STORAGE_KEY = userId ? `attendance_goals_${userId}` : 'attendance_goals';

  useEffect(() => {
    if (!userId) {
      setGoals([]);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setGoals(JSON.parse(stored));
    } else {
      // Initialize with default goals for new users
      const defaultGoals: Goal[] = [
        {
          id: '1',
          userId,
          type: 'daily',
          target: 8,
          current: 0,
          description: 'Work 8 hours daily',
          period: new Date().toISOString().split('T')[0]
        },
        {
          id: '2',
          userId,
          type: 'weekly',
          target: 5,
          current: 0,
          description: 'Attend 5 days per week',
          period: getWeekPeriod()
        },
        {
          id: '3',
          userId,
          type: 'monthly',
          target: 22,
          current: 0,
          description: 'Attend 22 days per month',
          period: new Date().toISOString().slice(0, 7)
        }
      ];
      setGoals(defaultGoals);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultGoals));
    }
  }, [userId, STORAGE_KEY]);

  const getWeekPeriod = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    return startOfWeek.toISOString().split('T')[0];
  };

  const saveGoals = (newGoals: Goal[]) => {
    if (!userId) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newGoals));
    setGoals(newGoals);
  };

  const updateGoalProgress = (id: string, current: number) => {
    const updatedGoals = goals.map(goal =>
      goal.id === id ? { ...goal, current } : goal
    );
    saveGoals(updatedGoals);
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'userId'>) => {
    if (!userId) return;
    
    const newGoal: Goal = {
      ...goal,
      id: crypto.randomUUID(),
      userId
    };
    const updatedGoals = [...goals, newGoal];
    saveGoals(updatedGoals);
  };

  const deleteGoal = (id: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== id);
    saveGoals(updatedGoals);
  };

  return {
    goals,
    updateGoalProgress,
    addGoal,
    deleteGoal
  };
};