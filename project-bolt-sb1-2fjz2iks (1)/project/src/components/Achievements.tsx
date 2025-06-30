import React from 'react';
import { Trophy, Award, Star, Zap } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementsProps {
  achievements: Achievement[];
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'streak':
        return <Zap className="h-6 w-6" />;
      case 'hours':
        return <Award className="h-6 w-6" />;
      case 'punctuality':
        return <Star className="h-6 w-6" />;
      case 'consistency':
        return <Trophy className="h-6 w-6" />;
      default:
        return <Trophy className="h-6 w-6" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'streak':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'hours':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'punctuality':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'consistency':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const sortedAchievements = [...achievements].sort((a, b) => 
    new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Achievements</h3>
        <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full text-sm font-medium">
          {achievements.length}
        </span>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No achievements unlocked yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Keep tracking your attendance to unlock achievements!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{achievement.title}</h4>
                    <div className={`p-1 rounded border ${getCategoryColor(achievement.category)}`}>
                      {getCategoryIcon(achievement.category)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Unlocked {formatDate(achievement.unlockedAt)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(achievement.category)}`}>
                      {achievement.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Achievement Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Achievement Categories</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { category: 'streak', name: 'Streak', description: 'Consecutive attendance days' },
            { category: 'hours', name: 'Hours', description: 'Total working hours milestones' },
            { category: 'punctuality', name: 'Punctuality', description: 'On-time attendance records' },
            { category: 'consistency', name: 'Consistency', description: 'Regular attendance patterns' }
          ].map((cat) => {
            const count = achievements.filter(a => a.category === cat.category).length;
            return (
              <div key={cat.category} className="text-center">
                <div className={`inline-flex p-3 rounded-lg border ${getCategoryColor(cat.category)} mb-2`}>
                  {getCategoryIcon(cat.category)}
                </div>
                <h5 className="font-medium text-gray-900 dark:text-white">{cat.name}</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{cat.description}</p>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};