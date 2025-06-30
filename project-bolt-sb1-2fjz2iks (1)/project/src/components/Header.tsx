import React from 'react';
import { User, Calendar, Clock, Bell, LogOut, Users, Building2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface HeaderProps {
  currentTime: string;
  currentDate: string;
}

export const Header: React.FC<HeaderProps> = ({ currentTime, currentDate }) => {
  const { user, logout, switchUser, users } = useApp();

  const handleUserSwitch = (userId: string) => {
    switchUser(userId);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 animate-slide-down sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-3 animate-slide-in-left">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 sm:p-2 rounded-lg animate-float shadow-lg">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white animate-fade-in">JAI AUTO ATTENDANCE</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 animate-slide-in-right">
            <div className="hidden md:flex items-center space-x-2 text-gray-600 dark:text-gray-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 animate-bounce-gentle" />
              <span className="text-xs sm:text-sm font-medium">{currentDate}</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse" />
              <span className="text-xs sm:text-sm font-medium animate-pulse">{currentTime}</span>
            </div>
            <button className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-110 animate-fade-in group" style={{ animationDelay: '0.4s' }}>
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300 group-hover:animate-wiggle" />
            </button>
            
            {/* User Menu */}
            <div className="relative group animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
                <div className="bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-700 dark:to-slate-700 p-1.5 sm:p-2 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:animate-bounce-gentle">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="text-xs sm:text-sm hidden lg:block">
                  <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-gray-500 dark:text-gray-400">{user?.department}</p>
                </div>
              </div>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform translate-y-2 group-hover:translate-y-0 animate-slide-down">
                <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 animate-fade-in">
                  <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{user?.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="inline-block px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-800 dark:text-blue-200 text-xs rounded-full animate-pulse font-medium">
                      {user?.role?.toUpperCase()}
                    </span>
                    {user?.employeeId && (
                      <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-mono">
                        {user.employeeId}
                      </span>
                    )}
                  </div>
                </div>
                
                {users.length > 1 && (
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700 max-h-40 sm:max-h-48 overflow-y-auto">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2 animate-fade-in">Switch User</p>
                    {users.filter(u => u.id !== user?.id && u.isActive).slice(0, 5).map((u, index) => (
                      <button
                        key={u.id}
                        onClick={() => handleUserSwitch(u.id)}
                        className="w-full text-left px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-300 transform hover:scale-105 animate-slide-in-left"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center space-x-2">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                          <div>
                            <span className="font-medium text-xs sm:text-sm">{u.name}</span>
                            <p className="text-xs text-gray-500">{u.department}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="p-2">
                  <button
                    onClick={logout}
                    className="w-full text-left px-2 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 animate-fade-in group"
                  >
                    <LogOut className="h-3 w-3 sm:h-4 sm:w-4 group-hover:animate-wiggle" />
                    <span className="text-xs sm:text-sm">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};