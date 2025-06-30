import React from 'react';
import { 
  Home, 
  Calendar, 
  BarChart3, 
  Target, 
  Trophy, 
  FileText, 
  Settings, 
  Moon, 
  Sun,
  Users,
  Shield
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { darkMode, toggleDarkMode, user } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    ...(user?.role === 'admin' ? [
      { id: 'admin', label: 'Admin Dashboard', icon: Shield }
    ] : []),
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'leaves', label: 'Leave Management', icon: FileText },
    ...(user?.role === 'admin' || user?.role === 'manager' ? [
      { id: 'users', label: 'User Management', icon: Users }
    ] : []),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 animate-slide-down sticky top-14 sm:top-16 z-40" style={{ animationDelay: '0.1s' }}>
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 xl:px-6">
        <div className="flex justify-between items-center h-12 sm:h-14">
          <div className="flex space-x-2 sm:space-x-4 lg:space-x-6 overflow-x-auto scrollbar-hide">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap transform hover:scale-105 animate-slide-in-left ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-700 dark:text-blue-300 shadow-md animate-glow'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-gray-100 hover:to-slate-100 dark:hover:from-gray-700 dark:hover:to-slate-700'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Icon className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 ${
                    activeTab === item.id ? 'animate-bounce-gentle' : 'group-hover:scale-110'
                  }`} />
                  <span className="hidden sm:block lg:inline">{item.label}</span>
                  {item.id === 'admin' && (
                    <div className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 px-1 py-0.5 rounded text-xs font-bold animate-pulse">
                      ADMIN
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={toggleDarkMode}
            className="p-1.5 sm:p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-gray-100 hover:to-slate-100 dark:hover:from-gray-700 dark:hover:to-slate-700 transition-all duration-300 transform hover:scale-110 animate-fade-in group flex-shrink-0"
            style={{ animationDelay: '0.6s' }}
          >
            {darkMode ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-spin" />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-wiggle" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};