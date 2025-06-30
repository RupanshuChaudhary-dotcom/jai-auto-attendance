import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, MapPin, StickyNote, Coffee, Utensils, Pause } from 'lucide-react';
import { AttendanceRecord } from '../types';

interface AttendanceHistoryProps {
  records: AttendanceRecord[];
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ records }) => {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 animate-bounce-gentle" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 animate-shake" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 animate-wiggle" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400 animate-pulse" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 animate-pulse";
    switch (status) {
      case 'present':
        return `${baseClasses} bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-800 dark:text-green-200`;
      case 'absent':
        return `${baseClasses} bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900 text-red-800 dark:text-red-200`;
      case 'partial':
        return `${baseClasses} bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900 text-yellow-800 dark:text-yellow-200`;
      default:
        return `${baseClasses} bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-700 dark:to-slate-700 text-gray-800 dark:text-gray-200`;
    }
  };

  const getBreakIcon = (type: string) => {
    switch (type) {
      case 'lunch': return <Utensils className="h-3 w-3 animate-bounce-gentle" />;
      case 'coffee': return <Coffee className="h-3 w-3 animate-wiggle" />;
      default: return <Pause className="h-3 w-3 animate-pulse" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const sortedRecords = [...records].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in hover:shadow-lg transition-all duration-300">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 animate-slide-down">
        <div className="flex items-center space-x-3">
          <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-float" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white animate-slide-in-left">Attendance History</h3>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {sortedRecords.length === 0 ? (
          <div className="p-8 text-center animate-fade-in">
            <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4 animate-float" />
            <p className="text-gray-500 dark:text-gray-400 animate-slide-up">No attendance records yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>Check in to start tracking your attendance</p>
          </div>
        ) : (
          sortedRecords.map((record, index) => (
            <div 
              key={record.id} 
              className="p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 dark:hover:from-gray-700 dark:hover:to-slate-700 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] animate-slide-up group"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => setSelectedRecord(record)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    {getStatusIcon(record.status)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{formatDate(record.date)}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="animate-fade-in">In: {record.checkIn || '--'}</span>
                      <span className="animate-fade-in" style={{ animationDelay: '0.1s' }}>Out: {record.checkOut || '--'}</span>
                      {record.totalHours && (
                        <span className="animate-fade-in font-semibold text-blue-600 dark:text-blue-400" style={{ animationDelay: '0.2s' }}>Hours: {record.totalHours}h</span>
                      )}
                      {record.overtime && record.overtime > 0 && (
                        <span className="text-orange-600 dark:text-orange-400 animate-pulse" style={{ animationDelay: '0.3s' }}>OT: {record.overtime}h</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {record.location && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 animate-slide-in-left">
                          <MapPin className="h-3 w-3 animate-bounce-gentle" />
                          <span>Location tracked</span>
                        </div>
                      )}
                      {record.notes && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
                          <StickyNote className="h-3 w-3 animate-wiggle" />
                          <span>Has notes</span>
                        </div>
                      )}
                      {record.breaks && record.breaks.length > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
                          <div className="flex space-x-1">
                            {record.breaks.map((breakRecord, breakIndex) => (
                              <div key={breakIndex} className="flex items-center">
                                {getBreakIcon(breakRecord.type)}
                              </div>
                            ))}
                          </div>
                          <span>{record.breaks.length} break{record.breaks.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`${getStatusBadge(record.status)} group-hover:scale-110 transition-transform duration-300`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 animate-scale-in transform">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white animate-slide-in-left">
                {formatDate(selectedRecord.date)}
              </h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-300 transform hover:scale-110 hover:rotate-90"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="animate-slide-in-left">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Check In</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedRecord.checkIn || '--'}</p>
                </div>
                <div className="animate-slide-in-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Check Out</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedRecord.checkOut || '--'}</p>
                </div>
              </div>

              {selectedRecord.totalHours && (
                <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Hours</p>
                  <p className="font-medium text-gray-900 dark:text-white animate-pulse">{selectedRecord.totalHours}h</p>
                </div>
              )}

              {selectedRecord.overtime && selectedRecord.overtime > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Overtime</p>
                  <p className="font-medium text-orange-600 dark:text-orange-400 animate-bounce-gentle">{selectedRecord.overtime}h</p>
                </div>
              )}

              {selectedRecord.location && (
                <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedRecord.location}</p>
                </div>
              )}

              {selectedRecord.breaks && selectedRecord.breaks.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Breaks</p>
                  <div className="space-y-2">
                    {selectedRecord.breaks.map((breakRecord, index) => (
                      <div key={breakRecord.id} className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-700 p-2 rounded animate-slide-in-left" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
                        <div className="flex items-center space-x-2">
                          {getBreakIcon(breakRecord.type)}
                          <span className="text-sm capitalize text-gray-900 dark:text-white">{breakRecord.type}</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {breakRecord.duration ? `${breakRecord.duration}h` : <span className="animate-pulse text-orange-500">Active</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.notes && (
                <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                  <p className="text-sm text-gray-900 dark:text-white bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-700 p-3 rounded">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};