import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Download, Mail, MapPin, Clock, Gift, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { GoogleSheetsIntegration } from './GoogleSheetsIntegration';

export const Settings: React.FC = () => {
  const { user, updateUser, updatePreferences } = useApp();
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileUpdate = (field: string, value: string) => {
    updateUser({ [field]: value });
  };

  const handlePreferenceUpdate = (field: string, value: boolean | number) => {
    updatePreferences({ [field]: value });
  };

  const exportData = () => {
    const data = {
      user,
      attendanceRecords: JSON.parse(localStorage.getItem(`attendance_records_${user?.id}`) || '[]'),
      leaveRequests: JSON.parse(localStorage.getItem(`leave_requests_${user?.id}`) || '[]'),
      goals: JSON.parse(localStorage.getItem(`attendance_goals_${user?.id}`) || '[]'),
      achievements: JSON.parse(localStorage.getItem(`achievements_${user?.id}`) || '[]'),
      shortLeaves: JSON.parse(localStorage.getItem(`short_leaves_${user?.id}`) || '{}')
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-data-${user?.name}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'schedule', label: 'Work Schedule', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'googlesheets', label: 'Google Sheets', icon: FileSpreadsheet },
    { id: 'data', label: 'Data Export', icon: Download }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <SettingsIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h3>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 dark:text-white">Profile Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user?.name || ''}
                  onChange={(e) => handleProfileUpdate('name', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  onChange={(e) => handleProfileUpdate('email', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={user?.department || ''}
                  onChange={(e) => handleProfileUpdate('department', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={user?.employeeId || ''}
                  onChange={(e) => handleProfileUpdate('employeeId', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 dark:text-white">Work Schedule Settings</h4>
            
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h5 className="font-medium text-blue-800 dark:text-blue-200">Standard Work Hours</h5>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Check-in Time</p>
                  <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">9:45 AM</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Check-out Time</p>
                  <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">6:00 PM</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Total working hours: <span className="font-semibold">8 hours 15 minutes</span>
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Sunday is a weekly off day
                </p>
              </div>
            </div>

            {/* Short Leave Rules */}
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Gift className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h5 className="font-medium text-green-800 dark:text-green-200">Short Leave Policy</h5>
              </div>
              <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                <p><span className="font-semibold">2 short leaves per month</span> are available</p>
                <div className="space-y-1">
                  <p><strong>Option 1:</strong> Check in till 11:30 AM + Check out at 6:00 PM = Full Day</p>
                  <p><strong>Option 2:</strong> Check in at 9:45 AM + Check out at 4:00 PM = Full Day</p>
                </div>
                <p className="text-xs mt-2 text-green-600 dark:text-green-400">
                  After using 2 short leaves, late arrival or early departure will count as half day
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected Working Hours per Day
                </label>
                <input
                  type="number"
                  value={user?.preferences.workingHours || 8}
                  onChange={(e) => handlePreferenceUpdate('workingHours', Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="1"
                  max="24"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  This affects overtime calculations and goal tracking
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Attendance Rules</h5>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Check-in after 9:45 AM is considered late</li>
                  <li>• Check-out before 6:00 PM may result in partial attendance</li>
                  <li>• Minimum 7 hours required for full attendance</li>
                  <li>• Overtime is calculated for hours worked beyond 8 hours</li>
                  <li>• Sunday is a weekly off day (no attendance required)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 dark:text-white">Notification Preferences</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications for check-in reminders</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={user?.preferences.notifications || false}
                    onChange={(e) => handlePreferenceUpdate('notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Reports</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive weekly attendance reports via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={user?.preferences.emailReports || false}
                    onChange={(e) => handlePreferenceUpdate('emailReports', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Break Reminders</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Get reminded to take breaks during work</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={user?.preferences.breakReminders || false}
                    onChange={(e) => handlePreferenceUpdate('breakReminders', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 dark:text-white">Privacy Settings</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Location Tracking</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Allow location tracking for check-ins</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={user?.preferences.locationTracking || false}
                    onChange={(e) => handlePreferenceUpdate('locationTracking', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex">
                  <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="ml-3">
                    <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Data Privacy</h5>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      All your data is stored locally on your device. We don't collect or share any personal information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'googlesheets' && (
          <GoogleSheetsIntegration />
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 dark:text-white">Data Management</h4>
            
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">Export Data</h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Download all your attendance data as JSON</p>
                  </div>
                  <button
                    onClick={exportData}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-red-900 dark:text-red-200">Clear Personal Data</h5>
                    <p className="text-sm text-red-600 dark:text-red-400">Permanently delete your attendance records and settings</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
                        const userKeys = [
                          `attendance_records_${user?.id}`,
                          `leave_requests_${user?.id}`,
                          `attendance_goals_${user?.id}`,
                          `achievements_${user?.id}`,
                          `short_leaves_${user?.id}`
                        ];
                        userKeys.forEach(key => localStorage.removeItem(key));
                        window.location.reload();
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Clear Data
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex">
                  <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="ml-3">
                    <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200">Data Storage</h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Your data is stored locally in your browser. Make sure to export regularly for backup.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};