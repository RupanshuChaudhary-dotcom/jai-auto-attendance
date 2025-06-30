import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { AttendanceRecord } from '../types';

interface CalendarViewProps {
  records: AttendanceRecord[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ records }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getRecordForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return records.find(record => record.date === dateString);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
      case 'partial':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
      case 'absent':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();

  const monthYear = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Calendar View</h3>
          </div>
          <div className="flex items-center space-x-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">{monthYear}</h4>
            <div className="flex space-x-1">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} className="p-2 h-24"></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const record = getRecordForDate(date);
            const isToday = date.toDateString() === today.toDateString();
            const isPast = date < today;

            return (
              <div
                key={day}
                className={`p-2 h-24 border rounded-lg transition-colors duration-200 ${getStatusColor(record?.status)} ${
                  isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-medium ${isToday ? 'font-bold' : ''}`}>
                      {day}
                    </span>
                    {record && (
                      <div className="text-xs">
                        {record.status === 'present' && '✓'}
                        {record.status === 'partial' && '⚠'}
                        {record.status === 'absent' && '✗'}
                      </div>
                    )}
                  </div>
                  
                  {record && (
                    <div className="mt-1 text-xs space-y-1">
                      {record.checkIn && (
                        <div>In: {record.checkIn}</div>
                      )}
                      {record.checkOut && (
                        <div>Out: {record.checkOut}</div>
                      )}
                      {record.totalHours && (
                        <div className="font-medium">{record.totalHours}h</div>
                      )}
                    </div>
                  )}
                  
                  {!record && isPast && (
                    <div className="mt-auto text-xs text-gray-400 dark:text-gray-500">
                      No data
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Present</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Partial</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Absent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">No data</span>
          </div>
        </div>
      </div>
    </div>
  );
};