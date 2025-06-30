import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Calendar, Target } from 'lucide-react';
import { AttendanceRecord } from '../types';

interface AnalyticsProps {
  records: AttendanceRecord[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ records }) => {
  // Prepare data for charts
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyData = last30Days.map(date => {
    const record = records.find(r => r.date === date);
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: record?.totalHours || 0,
      status: record?.status || 'absent'
    };
  });

  const weeklyData = [];
  for (let i = 0; i < 12; i++) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= weekStart && recordDate <= weekEnd;
    });
    
    const totalHours = weekRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
    const presentDays = weekRecords.filter(r => r.status === 'present').length;
    
    weeklyData.unshift({
      week: `Week ${i + 1}`,
      hours: Math.round(totalHours * 100) / 100,
      days: presentDays
    });
  }

  const statusData = [
    { name: 'Present', value: records.filter(r => r.status === 'present').length, color: '#10B981' },
    { name: 'Partial', value: records.filter(r => r.status === 'partial').length, color: '#F59E0B' },
    { name: 'Absent', value: records.filter(r => r.status === 'absent').length, color: '#EF4444' }
  ];

  const monthlyStats = records.reduce((acc, record) => {
    const month = record.date.slice(0, 7);
    if (!acc[month]) {
      acc[month] = { totalHours: 0, presentDays: 0, totalDays: 0 };
    }
    acc[month].totalHours += record.totalHours || 0;
    if (record.status === 'present') acc[month].presentDays++;
    acc[month].totalDays++;
    return acc;
  }, {} as Record<string, any>);

  const monthlyData = Object.entries(monthlyStats).map(([month, stats]) => ({
    month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    hours: Math.round(stats.totalHours * 100) / 100,
    attendance: Math.round((stats.presentDays / stats.totalDays) * 100)
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Daily Hours</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {records.length > 0 ? Math.round((records.reduce((sum, r) => sum + (r.totalHours || 0), 0) / records.length) * 100) / 100 : 0}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {records.filter(r => r.date.startsWith(new Date().toISOString().slice(0, 7))).length} days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Overtime</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(records.reduce((sum, r) => sum + (r.overtime || 0), 0) * 100) / 100}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {records.length > 0 ? Math.round((records.filter(r => r.status === 'present').length / records.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Hours Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Hours (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Line type="monotone" dataKey="hours" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Hours</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData.slice(-8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Bar dataKey="hours" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Attendance Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Bar dataKey="attendance" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};