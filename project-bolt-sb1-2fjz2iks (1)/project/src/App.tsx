import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Clock, Users, Target, Trophy, Zap, Award } from 'lucide-react';
import { AppProvider, useApp } from './contexts/AppContext';
import { UserLogin } from './components/UserLogin';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { CheckInOut } from './components/CheckInOut';
import { StatsCard } from './components/StatsCard';
import { AttendanceHistory } from './components/AttendanceHistory';
import { Analytics } from './components/Analytics';
import { CalendarView } from './components/CalendarView';
import { Goals } from './components/Goals';
import { Achievements } from './components/Achievements';
import { LeaveManagement } from './components/LeaveManagement';
import { UserManagement } from './components/UserManagement';
import { AdminDashboard } from './components/AdminDashboard';
import { Settings } from './components/Settings';
import { useAttendance } from './hooks/useAttendance';
import { useLeaves } from './hooks/useLeaves';
import { useGoals } from './hooks/useGoals';
import { useAchievements } from './hooks/useAchievements';

function AppContent() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { user, session } = useApp();
  
  const { 
    records, 
    isCheckedIn, 
    todayRecord, 
    activeBreak,
    checkIn, 
    checkOut, 
    startBreak,
    endBreak,
    addNote,
    getStats,
    getShortLeaveInfo,
    isSunday,
    isShortLeaveEligible
  } = useAttendance(user?.id || null);
  
  const { leaves, submitLeaveRequest, updateLeaveStatus, deleteLeaveRequest } = useLeaves(user?.id || null);
  const { goals, updateGoalProgress, addGoal, deleteGoal } = useGoals(user?.id || null);
  const { achievements, unlockAchievement, checkAchievements } = useAchievements(user?.id || null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0].slice(0, 5));
      setCurrentDate(now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      const stats = getStats();
      checkAchievements(stats);
    }
  }, [records, checkAchievements, getStats, user]);

  // Show login screen if not logged in
  if (!session.isLoggedIn || !user) {
    return <UserLogin />;
  }

  const stats = getStats();
  const shortLeaveInfo = getShortLeaveInfo();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Check In/Out Section */}
            <div className="lg:col-span-1 animate-slide-in-left">
              <CheckInOut
                isCheckedIn={isCheckedIn}
                todayRecord={todayRecord}
                activeBreak={activeBreak}
                onCheckIn={checkIn}
                onCheckOut={checkOut}
                onStartBreak={startBreak}
                onEndBreak={endBreak}
                onAddNote={addNote}
                currentTime={currentTime}
                getShortLeaveInfo={getShortLeaveInfo}
                isSunday={isSunday}
                isShortLeaveEligible={isShortLeaveEligible}
              />
            </div>

            {/* Stats and History */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8 animate-slide-in-right">
              {/* Short Leave Info Card */}
              {shortLeaveInfo && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-xl p-3 sm:p-4 lg:p-6 border border-green-200 dark:border-green-800 animate-fade-in hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="animate-slide-in-left mb-3 sm:mb-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Short Leave Balance</h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                        <span className="font-bold text-green-600 dark:text-green-400 animate-pulse">{shortLeaveInfo.remaining}</span> of {shortLeaveInfo.total} remaining for {shortLeaveInfo.month}
                      </p>
                    </div>
                    <div className="text-center sm:text-right animate-slide-in-right">
                      <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 animate-bounce-gentle">{shortLeaveInfo.remaining}</div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Available</div>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p className="animate-slide-up">• Check in till 11:30 AM + Check out at 6:00 PM = Full Day</p>
                    <p className="animate-slide-up" style={{ animationDelay: '0.1s' }}>• Check in at 9:45 AM + Check out at 4:00 PM = Full Day</p>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                <StatsCard
                  title="Total Days"
                  value={stats.totalDays}
                  icon={Calendar}
                  color="blue"
                />
                <StatsCard
                  title="Present Days"
                  value={stats.presentDays}
                  icon={Users}
                  color="green"
                />
                <StatsCard
                  title="Attendance Rate"
                  value={`${stats.attendanceRate}%`}
                  icon={TrendingUp}
                  color={stats.attendanceRate >= 80 ? 'green' : stats.attendanceRate >= 60 ? 'yellow' : 'red'}
                />
                <StatsCard
                  title="Avg Hours/Day"
                  value={`${stats.averageHours}h`}
                  icon={Clock}
                  color="blue"
                />
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                <StatsCard
                  title="Current Streak"
                  value={`${stats.currentStreak} days`}
                  icon={Zap}
                  color="orange"
                />
                <StatsCard
                  title="Longest Streak"
                  value={`${stats.longestStreak} days`}
                  icon={Target}
                  color="purple"
                />
                <StatsCard
                  title="Total Overtime"
                  value={`${stats.totalOvertime}h`}
                  icon={Clock}
                  color="yellow"
                />
                <StatsCard
                  title="Achievements"
                  value={achievements.length}
                  icon={Trophy}
                  color="yellow"
                />
              </div>

              {/* Attendance History */}
              <AttendanceHistory records={records} />
            </div>
          </div>
        );

      case 'admin':
        return (
          <div className="animate-fade-in">
            <AdminDashboard />
          </div>
        );

      case 'calendar':
        return (
          <div className="animate-fade-in">
            <CalendarView records={records} />
          </div>
        );

      case 'analytics':
        return (
          <div className="animate-fade-in">
            <Analytics records={records} />
          </div>
        );

      case 'goals':
        return (
          <div className="animate-fade-in">
            <Goals
              goals={goals}
              onAddGoal={addGoal}
              onDeleteGoal={deleteGoal}
            />
          </div>
        );

      case 'achievements':
        return (
          <div className="animate-fade-in">
            <Achievements achievements={achievements} />
          </div>
        );

      case 'leaves':
        return (
          <div className="animate-fade-in">
            <LeaveManagement
              leaves={leaves}
              onSubmitLeave={submitLeaveRequest}
              onUpdateStatus={updateLeaveStatus}
              onDeleteLeave={deleteLeaveRequest}
            />
          </div>
        );

      case 'users':
        return (
          <div className="animate-fade-in">
            <UserManagement />
          </div>
        );

      case 'settings':
        return (
          <div className="animate-fade-in">
            <Settings />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900 dark:to-slate-900 transition-all duration-500">
      <Header currentTime={currentTime} currentDate={currentDate} />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 xl:px-6 py-3 sm:py-4 lg:py-6 animate-fade-in">
        {renderContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;