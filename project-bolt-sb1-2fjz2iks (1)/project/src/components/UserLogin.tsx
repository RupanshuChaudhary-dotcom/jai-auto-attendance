import React, { useState } from 'react';
import { User, LogIn, Plus, Users, Shield, UserCheck, Search, Building2, Mail, Calendar, MapPin, Clock, Award, Briefcase } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const UserLogin: React.FC = () => {
  const { users, login, addUser } = useApp();
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    department: '',
    role: 'employee' as 'employee' | 'manager' | 'admin',
    employeeId: ''
  });

  const handleLogin = (userId: string) => {
    login(userId);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.department) return;

    addUser({
      ...newUser,
      preferences: {
        darkMode: false,
        notifications: true,
        workingHours: 8,
        breakReminders: true,
        emailReports: false,
        locationTracking: true,
      },
      isActive: true,
      joinDate: new Date().toISOString().split('T')[0]
    });

    setNewUser({
      name: '',
      email: '',
      department: '',
      role: 'employee',
      employeeId: ''
    });
    setShowAddUser(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-red-600 animate-bounce-gentle" />;
      case 'manager': return <UserCheck className="h-4 w-4 text-blue-600 animate-pulse" />;
      default: return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 shadow-sm";
    switch (role) {
      case 'admin':
        return `${baseClasses} bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200 animate-pulse`;
      case 'manager':
        return `${baseClasses} bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200`;
      default:
        return `${baseClasses} bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200`;
    }
  };

  const getDepartmentIcon = (department: string) => {
    switch (department.toLowerCase()) {
      case 'administration':
        return '🏢';
      case 'hr administration':
      case 'human resources':
        return '👥';
      case 'export':
        return '🌍';
      case 'accounts':
        return '💰';
      case 'marketing':
        return '📈';
      case 'sales & marketing':
        return '🎯';
      case 'customer relations':
        return '📞';
      case 'domestic operations':
        return '🏠';
      case 'production control':
        return '⚙️';
      case 'store & inventory':
        return '📦';
      case 'logistics':
        return '🚛';
      default:
        return '💼';
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department.toLowerCase()) {
      case 'administration':
        return 'from-purple-50 to-violet-50 border-purple-200';
      case 'hr administration':
      case 'human resources':
        return 'from-pink-50 to-rose-50 border-pink-200';
      case 'export':
        return 'from-green-50 to-emerald-50 border-green-200';
      case 'accounts':
        return 'from-yellow-50 to-amber-50 border-yellow-200';
      case 'marketing':
        return 'from-orange-50 to-red-50 border-orange-200';
      case 'sales & marketing':
        return 'from-red-50 to-pink-50 border-red-200';
      case 'customer relations':
        return 'from-cyan-50 to-blue-50 border-cyan-200';
      case 'domestic operations':
        return 'from-teal-50 to-green-50 border-teal-200';
      case 'production control':
        return 'from-indigo-50 to-blue-50 border-indigo-200';
      case 'store & inventory':
        return 'from-slate-50 to-gray-50 border-slate-200';
      case 'logistics':
        return 'from-emerald-50 to-teal-50 border-emerald-200';
      default:
        return 'from-gray-50 to-slate-50 border-gray-200';
    }
  };

  // Get unique departments for filter
  const departments = ['all', ...Array.from(new Set(users.map(u => u.department)))];

  // Filter users based on search and department
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (u.employeeId && u.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = selectedDepartment === 'all' || u.department === selectedDepartment;
    return u.isActive && matchesSearch && matchesDepartment;
  });

  // Group users by department for better organization
  const usersByDepartment = filteredUsers.reduce((acc, user) => {
    if (!acc[user.department]) {
      acc[user.department] = [];
    }
    acc[user.department].push(user);
    return acc;
  }, {} as Record<string, typeof users>);

  // Sort departments by importance
  const departmentOrder = [
    'Administration',
    'HR Administration',
    'Human Resources',
    'Accounts',
    'Export',
    'Sales & Marketing',
    'Marketing',
    'Customer Relations',
    'Production Control',
    'Domestic Operations',
    'Store & Inventory',
    'Logistics'
  ];

  const sortedDepartments = Object.keys(usersByDepartment).sort((a, b) => {
    const indexA = departmentOrder.indexOf(a);
    const indexB = departmentOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const getEmployeeStats = () => {
    const total = users.filter(u => u.isActive).length;
    const admins = users.filter(u => u.role === 'admin' && u.isActive).length;
    const managers = users.filter(u => u.role === 'manager' && u.isActive).length;
    const employees = users.filter(u => u.role === 'employee' && u.isActive).length;
    return { total, admins, managers, employees };
  };

  const stats = getEmployeeStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="w-full max-w-7xl">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 animate-scale-in border border-gray-100">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 sm:p-6 rounded-full w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center animate-float shadow-lg">
              <Building2 className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-600 animate-bounce-gentle" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 animate-slide-up">JAI AUTO INDUSTRIES</h1>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-blue-600 mb-2 sm:mb-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              JAI AUTO ATTENDANCE
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Smart Employee Management System
            </p>
            
            {/* Company Stats */}
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8 mt-4 sm:mt-6">
              <div className="flex items-center justify-center space-x-2 animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs sm:text-sm text-gray-500">Total Employees</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2 animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
                <div className="bg-green-100 p-2 rounded-lg">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs sm:text-sm text-gray-500">Departments</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{departments.length - 1}</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs sm:text-sm text-gray-500">GPS Verified</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">100m Range</p>
                </div>
              </div>
            </div>

            {/* Role Distribution */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-3 sm:mt-4">
              <div className="flex items-center space-x-1 text-xs sm:text-sm animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                <span className="text-gray-600">{stats.admins} Admins</span>
              </div>
              <div className="flex items-center space-x-1 text-xs sm:text-sm animate-slide-up" style={{ animationDelay: '0.7s' }}>
                <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                <span className="text-gray-600">{stats.managers} Managers</span>
              </div>
              <div className="flex items-center space-x-1 text-xs sm:text-sm animate-slide-up" style={{ animationDelay: '0.8s' }}>
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                <span className="text-gray-600">{stats.employees} Employees</span>
              </div>
            </div>
          </div>

          {!showAddUser ? (
            <>
              {/* Search and Filter */}
              <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4 animate-slide-down">
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, department, or employee ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white text-sm sm:text-base lg:text-lg shadow-sm"
                    />
                  </div>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="px-4 sm:px-6 py-3 sm:py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white text-sm sm:text-base lg:text-lg shadow-sm min-w-[180px] sm:min-w-[200px]"
                  >
                    <option value="all">All Departments</option>
                    {departments.slice(1).map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Users Grid by Department */}
              <div className="space-y-6 sm:space-y-8 max-h-[50vh] sm:max-h-[60vh] lg:max-h-[600px] overflow-y-auto pr-1 sm:pr-2">
                {sortedDepartments.map((department, deptIndex) => {
                  const deptUsers = usersByDepartment[department];
                  return (
                    <div key={department} className="animate-slide-up" style={{ animationDelay: `${deptIndex * 0.1}s` }}>
                      <div className={`bg-gradient-to-r ${getDepartmentColor(department)} rounded-xl sm:rounded-2xl p-4 sm:p-6 border shadow-sm`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
                          <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                            <span className="text-2xl sm:text-3xl">{getDepartmentIcon(department)}</span>
                            <div>
                              <h3 className="text-lg sm:text-xl font-bold text-gray-800">{department}</h3>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {deptUsers.length} member{deptUsers.length > 1 ? 's' : ''} • 
                                {deptUsers.filter(u => u.role === 'manager').length > 0 && 
                                  ` ${deptUsers.filter(u => u.role === 'manager').length} Manager${deptUsers.filter(u => u.role === 'manager').length > 1 ? 's' : ''} • `
                                }
                                {deptUsers.filter(u => u.role === 'admin').length > 0 && 
                                  ` ${deptUsers.filter(u => u.role === 'admin').length} Admin${deptUsers.filter(u => u.role === 'admin').length > 1 ? 's' : ''}`
                                }
                              </p>
                            </div>
                          </div>
                          <div className="bg-white bg-opacity-70 px-3 sm:px-4 py-2 rounded-full self-start sm:self-center">
                            <span className="text-xs sm:text-sm font-semibold text-gray-700">
                              {deptUsers.length} Employee{deptUsers.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                          {deptUsers.map((user, userIndex) => (
                            <button
                              key={user.id}
                              onClick={() => handleLogin(user.id)}
                              className="bg-white p-4 sm:p-5 rounded-xl hover:shadow-lg transition-all duration-300 text-left group transform hover:scale-105 border border-gray-100 animate-slide-in-left"
                              style={{ animationDelay: `${(deptIndex * 0.1) + (userIndex * 0.05)}s` }}
                            >
                              <div className="flex items-start space-x-3 sm:space-x-4">
                                <div className="bg-gradient-to-br from-gray-100 to-slate-100 p-2 sm:p-3 rounded-full group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300 group-hover:scale-110 shadow-sm">
                                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 truncate text-sm sm:text-base lg:text-lg">
                                      {user.name}
                                    </h4>
                                    {getRoleIcon(user.role)}
                                  </div>
                                  <div className="flex items-center space-x-1 mb-2 sm:mb-3">
                                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                                    <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                    <span className={getRoleBadge(user.role)}>
                                      {user.role.toUpperCase()}
                                    </span>
                                    {user.employeeId && (
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full font-mono">
                                        {user.employeeId}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                                    <Calendar className="h-3 w-3" />
                                    <span>Joined {new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                  </div>
                                </div>
                                <LogIn className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-600 transition-all duration-300 transform group-hover:translate-x-1" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 sm:py-16 animate-fade-in">
                  <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4 sm:mb-6" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-500 mb-2">No employees found</h3>
                  <p className="text-sm sm:text-base text-gray-400">Try adjusting your search terms or department filter</p>
                </div>
              )}

              {/* Add User Button */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAddUser(true)}
                  className="w-full p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 flex items-center justify-center space-x-3 text-gray-600 hover:text-blue-600 transform hover:scale-105 animate-fade-in group"
                >
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6 group-hover:animate-bounce-gentle" />
                  <span className="text-base sm:text-lg font-medium">Add New Employee</span>
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleAddUser} className="space-y-6 sm:space-y-8 animate-scale-in">
              <div className="flex items-center space-x-4 mb-6 sm:mb-8">
                <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Employee</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="animate-slide-in-left">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base sm:text-lg"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="animate-slide-in-right">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base sm:text-lg"
                    placeholder="employee@jaiauto.in"
                    required
                  />
                </div>

                <div className="animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Department *
                  </label>
                  <select
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base sm:text-lg"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Administration">Administration</option>
                    <option value="HR Administration">HR Administration</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Accounts">Accounts</option>
                    <option value="Export">Export</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Customer Relations">Customer Relations</option>
                    <option value="Production Control">Production Control</option>
                    <option value="Domestic Operations">Domestic Operations</option>
                    <option value="Store & Inventory">Store & Inventory</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>

                <div className="animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={newUser.employeeId}
                    onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base sm:text-lg"
                    placeholder="e.g., EMP001"
                  />
                </div>
              </div>

              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base sm:text-lg"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-base sm:text-lg"
                >
                  Add Employee
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 bg-gradient-to-r from-gray-300 to-slate-300 hover:from-gray-400 hover:to-slate-400 text-gray-700 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 text-base sm:text-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">🏢 JAI AUTO INDUSTRIES</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                <span>📍 Office: 28.6611056, 77.3457939</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                <span>⏰ Work: 9:45 AM - 6:00 PM</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Award className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                <span>📏 GPS: 100m Required</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};