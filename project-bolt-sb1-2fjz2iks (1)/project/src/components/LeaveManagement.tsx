import React, { useState } from 'react';
import { FileText, Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { LeaveRequest } from '../types';

interface LeaveManagementProps {
  leaves: LeaveRequest[];
  onSubmitLeave: (request: Omit<LeaveRequest, 'id' | 'requestDate' | 'status'>) => void;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => void;
  onDeleteLeave: (id: string) => void;
}

export const LeaveManagement: React.FC<LeaveManagementProps> = ({
  leaves,
  onSubmitLeave,
  onUpdateStatus,
  onDeleteLeave
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'vacation' as 'vacation' | 'sick' | 'personal' | 'emergency',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason) return;

    onSubmitLeave(formData);
    setFormData({
      type: 'vacation',
      startDate: '',
      endDate: '',
      reason: ''
    });
    setShowForm(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200`;
      case 'rejected':
        return `${baseClasses} bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200`;
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200`;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vacation':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'sick':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'personal':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'emergency':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const sortedLeaves = [...leaves].sort((a, b) => 
    new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Leave Management</h3>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Request Leave</span>
        </button>
      </div>

      {/* Leave Request Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">New Leave Request</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Leave Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="vacation">Vacation</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration
                </label>
                <div className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {formData.startDate && formData.endDate ? 
                    `${calculateDays(formData.startDate, formData.endDate)} day(s)` : 
                    'Select dates'
                  }
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min={formData.startDate}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Please provide a reason for your leave request..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                required
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave Requests List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white">Leave Requests</h4>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedLeaves.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No leave requests yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Submit your first leave request</p>
            </div>
          ) : (
            sortedLeaves.map((leave) => (
              <div key={leave.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {getStatusIcon(leave.status)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(leave.type)}`}>
                          {leave.type}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({calculateDays(leave.startDate, leave.endDate)} day{calculateDays(leave.startDate, leave.endDate) > 1 ? 's' : ''})
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{leave.reason}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Requested on {new Date(leave.requestDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={getStatusBadge(leave.status)}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                    
                    {leave.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onUpdateStatus(leave.id, 'approved')}
                          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200"
                          title="Approve"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onUpdateStatus(leave.id, 'rejected')}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                          title="Reject"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={() => onDeleteLeave(leave.id)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Leave Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['vacation', 'sick', 'personal', 'emergency'].map((type) => {
          const typeLeaves = leaves.filter(l => l.type === type && l.status === 'approved');
          const totalDays = typeLeaves.reduce((sum, l) => sum + calculateDays(l.startDate, l.endDate), 0);
          
          return (
            <div key={type} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <div className="text-center">
                <h5 className="font-medium text-gray-900 dark:text-white capitalize mb-1">{type}</h5>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDays}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">days used</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};