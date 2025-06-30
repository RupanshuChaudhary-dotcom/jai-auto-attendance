import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Search, 
  Filter, 
  Download, 
  Eye,
  MapPin,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  Building2,
  Mail,
  Phone,
  UserCheck,
  Shield,
  User
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { AttendanceRecord } from '../types';

export const AdminDashboard: React.FC = () => {
  const { users, user: currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-500 mb-2">Access Denied</h3>
        <p className="text-gray-400">Only administrators can access this dashboard</p>
      </div>
    );
  }

  // Get all employee attendance data
  const getAllEmployeeData = () => {
    return users.map(user => {
      const attendanceKey = `attendance_records_${user.id}`;
      const records: AttendanceRecord[] = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7);
      
      const todayRecord = records.find(r => r.date === today);
      const monthRecords = records.filter(r => r.date.startsWith(thisMonth));
      const totalDays = monthRecords.length;
      const presentDays = monthRecords.filter(r => r.status === 'present').length;
      const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
      const totalHours = monthRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
      const avgHours = totalDays > 0 ? Math.round((totalHours / totalDays) * 100) / 100 : 0;

      return {
        ...user,
        todayStatus: todayRecord?.status || 'absent',
        todayCheckIn: todayRecord?.checkIn,
        todayCheckOut: todayRecord?.checkOut,
        todayHours: todayRecord?.totalHours || 0,
        monthlyAttendanceRate: attendanceRate,
        monthlyAvgHours: avgHours,
        totalRecords: records.length,
        isCheckedIn: todayRecord?.checkIn && !todayRecord?.checkOut,
        lastActivity: records.length > 0 ? records[records.length - 1].date : 'Never',
        records
      };
    });
  };

  const employeeData = getAllEmployeeData();

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employeeData.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (emp.employeeId && emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'present' && emp.todayStatus === 'present') ||
                           (statusFilter === 'absent' && emp.todayStatus === 'absent') ||
                           (statusFilter === 'partial' && emp.todayStatus === 'partial') ||
                           (statusFilter === 'checked-in' && emp.isCheckedIn);
      
      return emp.isActive && matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employeeData, searchTerm, departmentFilter, statusFilter]);

  // Get departments
  const departments = Array.from(new Set(users.map(u => u.department)));

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const totalEmployees = employeeData.filter(e => e.isActive).length;
    const presentToday = employeeData.filter(e => e.todayStatus === 'present').length;
    const checkedInNow = employeeData.filter(e => e.isCheckedIn).length;
    const avgAttendanceRate = totalEmployees > 0 ? 
      Math.round(employeeData.reduce((sum, e) => sum + e.monthlyAttendanceRate, 0) / totalEmployees) : 0;
    
    return {
      totalEmployees,
      presentToday,
      checkedInNow,
      avgAttendanceRate,
      absentToday: totalEmployees - presentToday
    };
  }, [employeeData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'present':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'absent':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'partial':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-red-600" />;
      case 'manager': return <UserCheck className="h-4 w-4 text-blue-600" />;
      default: return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const exportData = () => {
    const exportData = filteredEmployees.map(emp => ({
      name: emp.name,
      email: emp.email,
      department: emp.department,
      role: emp.role,
      employeeId: emp.employeeId,
      todayStatus: emp.todayStatus,
      todayCheckIn: emp.todayCheckIn || 'N/A',
      todayCheckOut: emp.todayCheckOut || 'N/A',
      todayHours: emp.todayHours,
      monthlyAttendanceRate: emp.monthlyAttendanceRate,
      monthlyAvgHours: emp.monthlyAvgHours,
      totalRecords: emp.totalRecords
    }));

    const csv = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee-attendance-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitor all employee attendance and activities</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportData}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Present Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.presentToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Checked In Now</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.checkedInNow}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 dark:bg-red-900 p-2 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Absent Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.absentToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Attendance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.avgAttendanceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="present">Present Today</option>
            <option value="absent">Absent Today</option>
            <option value="partial">Partial Today</option>
            <option value="checked-in">Currently Checked In</option>
          </select>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Users className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Employee Data */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-700 dark:to-slate-700 p-2 rounded-full">
                    {getRoleIcon(employee.role)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{employee.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{employee.department}</p>
                  </div>
                </div>
                {employee.isCheckedIn && (
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                    Active
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Today's Status</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(employee.todayStatus)}
                    <span className={getStatusBadge(employee.todayStatus)}>
                      {employee.todayStatus.charAt(0).toUpperCase() + employee.todayStatus.slice(1)}
                    </span>
                  </div>
                </div>

                {employee.todayCheckIn && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Check In</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{employee.todayCheckIn}</span>
                  </div>
                )}

                {employee.todayCheckOut && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Check Out</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{employee.todayCheckOut}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Rate</span>
                  <span className={`text-sm font-medium ${
                    employee.monthlyAttendanceRate >= 80 ? 'text-green-600' : 
                    employee.monthlyAttendanceRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {employee.monthlyAttendanceRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Hours</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{employee.monthlyAvgHours}h</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => setSelectedEmployee(employee.id)}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Today Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monthly Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-700 dark:to-slate-700 p-2 rounded-full">
                          {getRoleIcon(employee.role)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{employee.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{employee.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(employee.todayStatus)}
                        <span className={getStatusBadge(employee.todayStatus)}>
                          {employee.todayStatus.charAt(0).toUpperCase() + employee.todayStatus.slice(1)}
                        </span>
                        {employee.isCheckedIn && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {employee.todayCheckIn || '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {employee.todayCheckOut || '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {employee.todayHours ? `${employee.todayHours}h` : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        employee.monthlyAttendanceRate >= 80 ? 'text-green-600' : 
                        employee.monthlyAttendanceRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {employee.monthlyAttendanceRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedEmployee(employee.id)}
                        className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No employees found</h3>
          <p className="text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employeeId={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
};

// Employee Detail Modal Component
const EmployeeDetailModal: React.FC<{ employeeId: string; onClose: () => void }> = ({ employeeId, onClose }) => {
  const { users } = useApp();
  const employee = users.find(u => u.id === employeeId);
  
  if (!employee) return null;

  const attendanceKey = `attendance_records_${employeeId}`;
  const records: AttendanceRecord[] = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
  
  const recentRecords = records.slice(-10).reverse();
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthRecords = records.filter(r => r.date.startsWith(thisMonth));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{employee.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">{employee.department} • {employee.role}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Employee Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Employee Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="text-gray-900 dark:text-white">{employee.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Employee ID:</span>
                  <span className="text-gray-900 dark:text-white">{employee.employeeId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Join Date:</span>
                  <span className="text-gray-900 dark:text-white">{new Date(employee.joinDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Role:</span>
                  <span className="text-gray-900 dark:text-white capitalize">{employee.role}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Monthly Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Days:</span>
                  <span className="text-gray-900 dark:text-white">{monthRecords.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Present Days:</span>
                  <span className="text-gray-900 dark:text-white">{monthRecords.filter(r => r.status === 'present').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Hours:</span>
                  <span className="text-gray-900 dark:text-white">{Math.round(monthRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0) * 100) / 100}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Attendance Rate:</span>
                  <span className="text-gray-900 dark:text-white">
                    {monthRecords.length > 0 ? Math.round((monthRecords.filter(r => r.status === 'present').length / monthRecords.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Attendance */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Attendance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Check In</th>
                    <th className="px-4 py-2 text-left">Check Out</th>
                    <th className="px-4 py-2 text-left">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {recentRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{record.checkIn || '--'}</td>
                      <td className="px-4 py-2">{record.checkOut || '--'}</td>
                      <td className="px-4 py-2">{record.totalHours ? `${record.totalHours}h` : '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};