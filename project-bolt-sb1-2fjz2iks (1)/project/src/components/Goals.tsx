import React, { useState } from 'react';
import { Target, Plus, Trash2, Edit } from 'lucide-react';
import { Goal } from '../types';

interface GoalsProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onDeleteGoal: (id: string) => void;
}

export const Goals: React.FC<GoalsProps> = ({ goals, onAddGoal, onDeleteGoal }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    type: 'daily' as 'daily' | 'weekly' | 'monthly',
    target: 8,
    description: '',
    period: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.description) return;

    let period = '';
    const now = new Date();
    
    switch (newGoal.type) {
      case 'daily':
        period = now.toISOString().split('T')[0];
        break;
      case 'weekly':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        period = startOfWeek.toISOString().split('T')[0];
        break;
      case 'monthly':
        period = now.toISOString().slice(0, 7);
        break;
    }

    onAddGoal({
      ...newGoal,
      current: 0,
      period
    });

    setNewGoal({
      type: 'daily',
      target: 8,
      description: '',
      period: ''
    });
    setShowAddForm(false);
  };

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Goals & Targets</h3>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal Type
                </label>
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as any })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Value
                </label>
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: Number(e.target.value) })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="1"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="e.g., Work 8 hours daily"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Add Goal
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const percentage = getProgressPercentage(goal);
          const progressColor = getProgressColor(percentage);

          return (
            <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{goal.description}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{goal.type} Goal</p>
                </div>
                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{goal.current} / {goal.target}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${
                  percentage >= 100 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {percentage.toFixed(0)}% Complete
                </span>
                {percentage >= 100 && (
                  <span className="text-green-600 dark:text-green-400 text-sm font-medium">🎉 Achieved!</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && !showAddForm && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No goals set yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first goal to start tracking progress</p>
        </div>
      )}
    </div>
  );
};