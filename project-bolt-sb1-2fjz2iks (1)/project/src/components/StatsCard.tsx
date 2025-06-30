import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  trend
}) => {
  const colorClasses = {
    blue: 'from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    green: 'from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    red: 'from-red-50 to-pink-50 dark:from-red-900 dark:to-pink-900 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    yellow: 'from-yellow-50 to-amber-50 dark:from-yellow-900 dark:to-amber-900 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    purple: 'from-purple-50 to-violet-50 dark:from-purple-900 dark:to-violet-900 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    orange: 'from-orange-50 to-red-50 dark:from-orange-900 dark:to-red-900 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in group">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 animate-slide-up truncate">{title}</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white animate-scale-in group-hover:animate-pulse truncate">{value}</p>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 animate-slide-up truncate" style={{ animationDelay: '0.1s' }}>{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-1 sm:mt-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <span className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 hidden sm:inline">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-lg border bg-gradient-to-br ${colorClasses[color]} transition-all duration-300 group-hover:scale-110 group-hover:animate-bounce-gentle flex-shrink-0`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 transition-transform duration-300 group-hover:rotate-12" />
        </div>
      </div>
    </div>
  );
};