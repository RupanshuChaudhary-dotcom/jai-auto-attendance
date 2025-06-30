import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, CheckCircle, Coffee, Utensils, Pause, StickyNote, AlertTriangle, Timer, Calendar, Gift, Zap, Lock, MapPin } from 'lucide-react';
import { AttendanceRecord, BreakRecord } from '../types';
import { AnimatedCharacter } from './AnimatedCharacter';
import { LocationStatus } from './LocationStatus';

interface CheckInOutProps {
  isCheckedIn: boolean;
  todayRecord: AttendanceRecord | null;
  activeBreak: BreakRecord | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onStartBreak: (type: 'lunch' | 'coffee' | 'other') => void;
  onEndBreak: () => void;
  onAddNote: (note: string) => void;
  currentTime: string;
  getShortLeaveInfo?: () => { used: number; remaining: number; total: number; month: string };
  isSunday?: (date: string) => boolean;
  isShortLeaveEligible?: (checkIn: string, checkOut?: string) => boolean;
}

export const CheckInOut: React.FC<CheckInOutProps> = ({
  isCheckedIn,
  todayRecord,
  activeBreak,
  onCheckIn,
  onCheckOut,
  onStartBreak,
  onEndBreak,
  onAddNote,
  currentTime,
  getShortLeaveInfo,
  isSunday,
  isShortLeaveEligible
}) => {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState(todayRecord?.notes || '');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCharacter, setShowCharacter] = useState<'checkin' | 'checkout' | 'break' | 'success' | null>(null);
  const [locationValid, setLocationValid] = useState(false);
  const [showLocationStatus, setShowLocationStatus] = useState(false);

  // Define standard work times
  const STANDARD_CHECK_IN = '09:45';
  const STANDARD_CHECK_OUT = '18:00';
  const LATE_CHECK_IN_LIMIT = '11:30';
  const EARLY_CHECK_OUT_LIMIT = '16:00';

  const today = new Date().toISOString().split('T')[0];
  const isTodaySunday = isSunday ? isSunday(today) : false;
  const shortLeaveInfo = getShortLeaveInfo ? getShortLeaveInfo() : null;

  // Check if actions are allowed
  const hasCheckedInToday = todayRecord && todayRecord.checkIn;
  const hasCheckedOutToday = todayRecord && todayRecord.checkOut;
  const canCheckIn = !hasCheckedInToday && !isTodaySunday && locationValid;
  const canCheckOut = hasCheckedInToday && !hasCheckedOutToday && !isTodaySunday && locationValid;

  const handleLocationUpdate = (isValid: boolean, distance?: number) => {
    setLocationValid(isValid);
  };

  const handleSaveNote = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onAddNote(note);
      setShowNoteInput(false);
      setShowSuccess(true);
      setShowCharacter('success');
      setIsAnimating(false);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 300);
  };

  const handleCheckIn = () => {
    if (!canCheckIn) {
      if (hasCheckedInToday) {
        alert('You have already checked in today. Only one check-in per day is allowed.');
      } else if (isTodaySunday) {
        alert('Today is Sunday - an off day. Attendance is not required.');
      } else if (!locationValid) {
        alert('You must be within 100 meters of the office to check in. Please check your location status.');
      }
      return;
    }

    setIsAnimating(true);
    setTimeout(() => {
      onCheckIn();
      setShowSuccess(true);
      setShowCharacter('checkin');
      setIsAnimating(false);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 500);
  };

  const handleCheckOut = () => {
    if (!canCheckOut) {
      if (!hasCheckedInToday) {
        alert('You must check in first before checking out.');
      } else if (hasCheckedOutToday) {
        alert('You have already checked out today. Only one check-out per day is allowed.');
      } else if (!locationValid) {
        alert('You must be within 100 meters of the office to check out. Please check your location status.');
      }
      return;
    }

    setIsAnimating(true);
    setTimeout(() => {
      onCheckOut();
      setShowSuccess(true);
      setShowCharacter('checkout');
      setIsAnimating(false);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 500);
  };

  const handleStartBreak = (type: 'lunch' | 'coffee' | 'other') => {
    if (!hasCheckedInToday) {
      alert('You must check in first before taking a break.');
      return;
    }

    if (hasCheckedOutToday) {
      alert('You cannot take a break after checking out.');
      return;
    }

    if (activeBreak) {
      alert('You already have an active break. Please end your current break first.');
      return;
    }

    onStartBreak(type);
    setShowCharacter('break');
  };

  const getBreakIcon = (type: string) => {
    switch (type) {
      case 'lunch': return <Utensils className="h-4 w-4" />;
      case 'coffee': return <Coffee className="h-4 w-4" />;
      default: return <Pause className="h-4 w-4" />;
    }
  };

  const getTimeStatus = (currentTime: string, standardTime: string, isCheckIn: boolean) => {
    const current = new Date(`2000-01-01T${currentTime}:00`);
    const standard = new Date(`2000-01-01T${standardTime}:00`);
    
    if (isCheckIn) {
      if (current <= standard) {
        return { status: 'on-time', message: 'On time', color: 'text-green-600 dark:text-green-400' };
      } else {
        const diffMinutes = Math.floor((current.getTime() - standard.getTime()) / (1000 * 60));
        return { 
          status: 'late', 
          message: `${diffMinutes} min late`, 
          color: 'text-red-600 dark:text-red-400' 
        };
      }
    } else {
      if (current >= standard) {
        return { status: 'on-time', message: 'Full day', color: 'text-green-600 dark:text-green-400' };
      } else {
        const diffMinutes = Math.floor((standard.getTime() - current.getTime()) / (1000 * 60));
        return { 
          status: 'early', 
          message: `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m early`, 
          color: 'text-yellow-600 dark:text-yellow-400' 
        };
      }
    }
  };

  const currentTimeStatus = isCheckedIn 
    ? getTimeStatus(currentTime, STANDARD_CHECK_OUT, false)
    : getTimeStatus(currentTime, STANDARD_CHECK_IN, true);

  const getRecordTimeStatus = (time: string, isCheckIn: boolean) => {
    const standardTime = isCheckIn ? STANDARD_CHECK_IN : STANDARD_CHECK_OUT;
    return getTimeStatus(time, standardTime, isCheckIn);
  };

  const getShortLeaveStatus = () => {
    if (!todayRecord?.checkIn || !isShortLeaveEligible) return null;
    
    const checkIn = new Date(`2000-01-01T${todayRecord.checkIn}:00`);
    const currentTimeObj = new Date(`2000-01-01T${currentTime}:00`);
    const standardCheckIn = new Date(`2000-01-01T${STANDARD_CHECK_IN}:00`);
    const lateLimit = new Date(`2000-01-01T${LATE_CHECK_IN_LIMIT}:00`);
    const earlyLimit = new Date(`2000-01-01T${EARLY_CHECK_OUT_LIMIT}:00`);
    const standardCheckOut = new Date(`2000-01-01T${STANDARD_CHECK_OUT}:00`);
    
    // Option 1: Check in till 11:30 AM and check out at 6:00 PM
    const option1Eligible = checkIn <= lateLimit;
    const option1Complete = option1Eligible && currentTimeObj >= standardCheckOut;
    
    // Option 2: Check in at 9:45 AM and check out at 4:00 PM
    const option2Eligible = checkIn <= standardCheckIn;
    const option2Complete = option2Eligible && currentTimeObj >= earlyLimit;
    
    if (option1Complete || option2Complete) {
      return { eligible: true, complete: true, type: option1Complete ? 'option1' : 'option2' };
    } else if (option1Eligible || option2Eligible) {
      return { eligible: true, complete: false, type: option1Eligible ? 'option1' : 'option2' };
    }
    
    return { eligible: false, complete: false, type: null };
  };

  const shortLeaveStatus = getShortLeaveStatus();

  if (isTodaySunday) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 animate-float">
            <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-bounce-gentle" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 animate-slide-up">Sunday - Off Day</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Today is your weekly off day. Enjoy your rest!
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg p-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Attendance is not required on Sundays. See you tomorrow!
            </p>
          </div>
          
          {/* Sunday cartoon character */}
          <div className="mt-6 text-6xl animate-cartoon-dance">
            😴💤
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Animated Character Overlay */}
      {showCharacter && (
        <AnimatedCharacter
          type={showCharacter}
          onComplete={() => setShowCharacter(null)}
        />
      )}

      <div className="space-y-6">
        {/* Location Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location Verification</h3>
            </div>
            <button
              onClick={() => setShowLocationStatus(!showLocationStatus)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
            >
              {showLocationStatus ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          {showLocationStatus && (
            <LocationStatus onLocationUpdate={handleLocationUpdate} />
          )}
          
          {!showLocationStatus && (
            <div className={`p-3 rounded-lg border transition-all duration-300 ${
              locationValid 
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900' 
                : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900'
            }`}>
              <div className="flex items-center space-x-2">
                {locationValid ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <span className={`text-sm font-medium ${
                  locationValid 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {locationValid 
                    ? '✅ Within office range - Attendance allowed' 
                    : '❌ Outside office range - Attendance blocked'
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Main Check In/Out Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 animate-fade-in hover:shadow-xl transition-all duration-300">
          <div className="text-center">
            <div className="mb-6">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-all duration-500 ${
                isCheckedIn 
                  ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 animate-pulse-slow' 
                  : 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 animate-float'
              } ${isAnimating ? 'animate-cartoon-jump' : ''}`}>
                {isCheckedIn ? (
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 animate-heartbeat" />
                ) : (
                  <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 animate-slide-up">
                {hasCheckedOutToday ? 'Day Complete!' : isCheckedIn ? 'You\'re Checked In' : 'Ready to Check In?'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Current time: <span className="font-semibold animate-pulse">{currentTime}</span>
              </p>
            </div>

            {/* Attendance Status Indicator */}
            {hasCheckedInToday && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-lg border border-green-200 dark:border-green-800 animate-slide-up">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 animate-bounce-gentle" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    {hasCheckedOutToday ? 'Attendance Complete' : 'Currently Checked In'}
                  </span>
                </div>
                {hasCheckedOutToday && (
                  <p className="text-xs text-green-700 dark:text-green-300">
                    You have completed your attendance for today. See you tomorrow!
                  </p>
                )}
              </div>
            )}

            {/* Success Animation */}
            {showSuccess && (
              <div className="fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg animate-notification-slide z-50">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 animate-success-check" />
                  <span className="animate-rainbow-text">Action completed successfully!</span>
                </div>
              </div>
            )}

            {/* Floating confetti for celebrations */}
            {showSuccess && (
              <div className="fixed inset-0 pointer-events-none z-40">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-2xl animate-confetti-fall"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: `${2 + Math.random()}s`
                    }}
                  >
                    🎉
                  </div>
                ))}
              </div>
            )}

            {/* Work Schedule Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg p-4 mb-6 animate-slide-up hover:shadow-md transition-all duration-300" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Timer className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-wiggle" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Work Schedule</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="animate-slide-in-left">
                  <p className="text-blue-600 dark:text-blue-400">Check-in</p>
                  <p className="font-semibold text-blue-800 dark:text-blue-200">{STANDARD_CHECK_IN} AM</p>
                </div>
                <div className="animate-slide-in-right">
                  <p className="text-blue-600 dark:text-blue-400">Check-out</p>
                  <p className="font-semibold text-blue-800 dark:text-blue-200">{STANDARD_CHECK_OUT} PM</p>
                </div>
              </div>
              
              {/* Current Time Status */}
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-center space-x-2">
                  {currentTimeStatus.status === 'late' && <AlertTriangle className="h-4 w-4 text-red-500 animate-shake" />}
                  <span className={`text-sm font-medium ${currentTimeStatus.color} transition-colors duration-300`}>
                    {currentTimeStatus.message}
                  </span>
                </div>
              </div>
            </div>

            {/* Short Leave Info */}
            {shortLeaveInfo && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-lg p-4 mb-6 animate-slide-up hover:shadow-md transition-all duration-300" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Gift className="h-4 w-4 text-green-600 dark:text-green-400 animate-bounce-gentle" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">Short Leave Balance</span>
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  <p><span className="font-semibold animate-pulse">{shortLeaveInfo.remaining}</span> of {shortLeaveInfo.total} remaining this month</p>
                  <div className="mt-2 text-xs space-y-1">
                    <p className="animate-slide-in-left">• Check in till 11:30 AM + Check out at 6:00 PM = Full Day</p>
                    <p className="animate-slide-in-right">• Check in at 9:45 AM + Check out at 4:00 PM = Full Day</p>
                  </div>
                </div>
                
                {/* Short Leave Status */}
                {shortLeaveStatus && shortLeaveStatus.eligible && shortLeaveInfo.remaining > 0 && (
                  <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                    <div className="flex items-center justify-center space-x-2">
                      <span className={`text-xs font-medium ${
                        shortLeaveStatus.complete ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'
                      } transition-colors duration-300`}>
                        {shortLeaveStatus.complete ? (
                          <span className="flex items-center space-x-1">
                            <Zap className="h-3 w-3 animate-bounce-gentle" />
                            <span>Short Leave Qualified</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 animate-pulse" />
                            <span>Short Leave In Progress</span>
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {todayRecord && (
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-700 rounded-lg p-4 mb-6 animate-scale-in hover:shadow-md transition-all duration-300">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="animate-slide-in-left">
                    <p className="text-gray-500 dark:text-gray-400">Check In</p>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-gray-900 dark:text-white">{todayRecord.checkIn || '--'}</p>
                      {hasCheckedInToday && <CheckCircle className="h-4 w-4 text-green-500 animate-bounce-gentle" />}
                    </div>
                    {todayRecord.checkIn && (
                      <div className="flex items-center justify-center mt-1">
                        <span className={`text-xs ${getRecordTimeStatus(todayRecord.checkIn, true).color} transition-colors duration-300`}>
                          {getRecordTimeStatus(todayRecord.checkIn, true).message}
                        </span>
                      </div>
                    )}
                    {todayRecord.locationVerified && (
                      <div className="flex items-center justify-center mt-1">
                        <span className="text-xs text-green-600 dark:text-green-400">
                          📍 {todayRecord.distanceFromOffice}m from office
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="animate-slide-in-right">
                    <p className="text-gray-500 dark:text-gray-400">Check Out</p>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-gray-900 dark:text-white">{todayRecord.checkOut || '--'}</p>
                      {hasCheckedOutToday && <CheckCircle className="h-4 w-4 text-green-500 animate-bounce-gentle" />}
                    </div>
                    {todayRecord.checkOut && (
                      <div className="flex items-center justify-center mt-1">
                        <span className={`text-xs ${getRecordTimeStatus(todayRecord.checkOut, false).color} transition-colors duration-300`}>
                          {getRecordTimeStatus(todayRecord.checkOut, false).message}
                        </span>
                      </div>
                    )}
                    {todayRecord.checkOutLocationVerified && (
                      <div className="flex items-center justify-center mt-1">
                        <span className="text-xs text-green-600 dark:text-green-400">
                          📍 {todayRecord.checkOutDistanceFromOffice}m from office
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {todayRecord.totalHours && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 animate-slide-up" style={{ animationDelay: '0.6s' }}>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Total Hours</p>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white animate-pulse">{todayRecord.totalHours}h</p>
                    {todayRecord.overtime && todayRecord.overtime > 0 && (
                      <p className="text-sm text-orange-600 dark:text-orange-400 animate-bounce-gentle">
                        Overtime: {todayRecord.overtime}h
                      </p>
                    )}
                    {(todayRecord as any).shortLeaveUsed && (
                      <p className="text-sm text-green-600 dark:text-green-400 animate-pulse">
                        ✓ Short Leave Applied
                      </p>
                    )}
                  </div>
                )}
                
                {/* Break Summary */}
                {todayRecord.breaks && todayRecord.breaks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 animate-slide-up" style={{ animationDelay: '0.7s' }}>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Breaks Today</p>
                    <div className="space-y-1">
                      {todayRecord.breaks.map((breakRecord, index) => (
                        <div key={breakRecord.id} className="flex items-center justify-between text-xs animate-slide-in-left" style={{ animationDelay: `${0.8 + index * 0.1}s` }}>
                          <div className="flex items-center space-x-1">
                            {getBreakIcon(breakRecord.type)}
                            <span className="capitalize">{breakRecord.type}</span>
                          </div>
                          <span className={breakRecord.duration ? '' : 'animate-pulse text-orange-500'}>
                            {breakRecord.duration ? `${breakRecord.duration}h` : 'Active'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              {!hasCheckedInToday ? (
                <div className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
                  <button
                    onClick={handleCheckIn}
                    disabled={!canCheckIn || isAnimating}
                    className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg relative overflow-hidden group ${
                      canCheckIn && !isAnimating
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-xl transform hover:-translate-y-1'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {/* Animated background effect */}
                    {canCheckIn && !isAnimating && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    )}
                    
                    {!canCheckIn && hasCheckedInToday ? (
                      <Lock className="h-5 w-5 z-10" />
                    ) : !canCheckIn && !locationValid ? (
                      <MapPin className="h-5 w-5 z-10" />
                    ) : (
                      <LogIn className={`h-5 w-5 transition-transform duration-300 z-10 ${isAnimating ? 'animate-cartoon-spin' : canCheckIn ? 'group-hover:scale-110' : ''}`} />
                    )}
                    <span className="z-10">
                      {!canCheckIn && hasCheckedInToday 
                        ? 'Already Checked In Today' 
                        : !canCheckIn && !locationValid
                          ? 'Location Required for Check-in'
                        : isAnimating 
                          ? 'Checking In...' 
                          : 'Check In'
                      }
                    </span>
                    
                    {/* Running character preview */}
                    {canCheckIn && !isAnimating && (
                      <div className="absolute right-2 text-lg animate-float">
                        🏃‍♂️
                      </div>
                    )}
                  </button>
                  
                  {/* Check-in warnings */}
                  {!locationValid && (
                    <div className="mt-2 p-2 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900 dark:to-pink-900 border border-red-200 dark:border-red-800 rounded-lg animate-error-shake">
                      <div className="flex items-center justify-center space-x-2">
                        <MapPin className="h-4 w-4 text-red-600 dark:text-red-400 animate-bounce-gentle" />
                        <span className="text-sm text-red-700 dark:text-red-300">
                          You must be within 100 meters of the office to check in
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {canCheckIn && currentTimeStatus.status === 'late' && (
                    <div className="mt-2 p-2 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900 dark:to-pink-900 border border-red-200 dark:border-red-800 rounded-lg animate-error-shake">
                      <div className="flex items-center justify-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 animate-bounce-gentle" />
                        <span className="text-sm text-red-700 dark:text-red-300">
                          You're checking in late. Standard time is {STANDARD_CHECK_IN} AM
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : !hasCheckedOutToday ? (
                <>
                  {/* Break Controls */}
                  {!activeBreak ? (
                    <div className="grid grid-cols-3 gap-2 mb-3 animate-slide-up" style={{ animationDelay: '0.8s' }}>
                      <button
                        onClick={() => handleStartBreak('coffee')}
                        disabled={hasCheckedOutToday}
                        className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-1 transform relative overflow-hidden group ${
                          !hasCheckedOutToday
                            ? 'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 hover:from-amber-200 hover:to-yellow-200 dark:hover:from-amber-800 dark:hover:to-yellow-800 text-amber-800 dark:text-amber-200 hover:scale-105 hover:shadow-md'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Coffee className={`h-4 w-4 z-10 ${!hasCheckedOutToday ? 'group-hover:animate-wiggle' : ''}`} />
                        <span className="text-xs z-10">Coffee</span>
                        {!hasCheckedOutToday && (
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-yellow-200 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                        )}
                      </button>
                      <button
                        onClick={() => handleStartBreak('lunch')}
                        disabled={hasCheckedOutToday}
                        className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-1 transform relative overflow-hidden group ${
                          !hasCheckedOutToday
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-800 dark:hover:to-emerald-800 text-green-800 dark:text-green-200 hover:scale-105 hover:shadow-md'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Utensils className={`h-4 w-4 z-10 ${!hasCheckedOutToday ? 'group-hover:animate-wiggle' : ''}`} />
                        <span className="text-xs z-10">Lunch</span>
                        {!hasCheckedOutToday && (
                          <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-emerald-200 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                        )}
                      </button>
                      <button
                        onClick={() => handleStartBreak('other')}
                        disabled={hasCheckedOutToday}
                        className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-1 transform relative overflow-hidden group ${
                          !hasCheckedOutToday
                            ? 'bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900 dark:to-violet-900 hover:from-purple-200 hover:to-violet-200 dark:hover:from-purple-800 dark:hover:to-violet-800 text-purple-800 dark:text-purple-200 hover:scale-105 hover:shadow-md'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Pause className={`h-4 w-4 z-10 ${!hasCheckedOutToday ? 'group-hover:animate-wiggle' : ''}`} />
                        <span className="text-xs z-10">Break</span>
                        {!hasCheckedOutToday && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-violet-200 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={onEndBreak}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 mb-3 transform hover:scale-105 hover:shadow-lg animate-pulse-slow group relative overflow-hidden"
                    >
                      <Pause className="h-5 w-5 group-hover:animate-wiggle z-10" />
                      <span className="z-10">End {activeBreak.type} Break</span>
                      <div className="absolute right-2 text-lg animate-float">
                        ☕
                      </div>
                    </button>
                  )}

                  <div className="animate-slide-up" style={{ animationDelay: '0.9s' }}>
                    <button
                      onClick={handleCheckOut}
                      disabled={!canCheckOut || isAnimating}
                      className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg relative overflow-hidden group ${
                        canCheckOut && !isAnimating
                          ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white hover:shadow-xl transform hover:-translate-y-1'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canCheckOut && !isAnimating && (
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      )}
                      
                      {!canCheckOut && !locationValid ? (
                        <MapPin className="h-5 w-5 z-10" />
                      ) : (
                        <LogOut className={`h-5 w-5 transition-transform duration-300 z-10 ${isAnimating ? 'animate-cartoon-spin' : canCheckOut ? 'group-hover:scale-110' : ''}`} />
                      )}
                      <span className="z-10">
                        {!canCheckOut && !locationValid
                          ? 'Location Required for Check-out'
                          : isAnimating 
                            ? 'Checking Out...' 
                            : 'Check Out'
                        }
                      </span>
                      
                      {/* Walking character preview */}
                      {canCheckOut && !isAnimating && (
                        <div className="absolute right-2 text-lg animate-float">
                          🚶‍♂️
                        </div>
                      )}
                    </button>
                    
                    {/* Check-out warnings */}
                    {!locationValid && (
                      <div className="mt-2 p-2 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900 dark:to-pink-900 border border-red-200 dark:border-red-800 rounded-lg animate-error-shake">
                        <div className="flex items-center justify-center space-x-2">
                          <MapPin className="h-4 w-4 text-red-600 dark:text-red-400 animate-bounce-gentle" />
                          <span className="text-sm text-red-700 dark:text-red-300">
                            You must be within 100 meters of the office to check out
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {canCheckOut && currentTimeStatus.status === 'early' && (
                      <div className="mt-2 p-2 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900 dark:to-amber-900 border border-yellow-200 dark:border-yellow-800 rounded-lg animate-slide-down">
                        <div className="flex items-center justify-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 animate-bounce-gentle" />
                          <span className="text-sm text-yellow-700 dark:text-yellow-300">
                            Early checkout. Standard time is {STANDARD_CHECK_OUT} PM
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
                  <div className="w-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-800 dark:text-green-200 font-semibold py-4 px-6 rounded-lg flex items-center justify-center space-x-2 border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-5 w-5 animate-bounce-gentle" />
                    <span>Attendance Complete for Today</span>
                    <div className="text-lg animate-float">
                      🎉
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Section */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-600 animate-slide-up" style={{ animationDelay: '1s' }}>
                {!showNoteInput ? (
                  <button
                    onClick={() => setShowNoteInput(true)}
                    className="w-full bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-700 dark:to-slate-700 hover:from-gray-200 hover:to-slate-200 dark:hover:from-gray-600 dark:hover:to-slate-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105 group relative overflow-hidden"
                  >
                    <StickyNote className="h-4 w-4 group-hover:animate-wiggle z-10" />
                    <span className="z-10">{todayRecord?.notes ? 'Edit Note' : 'Add Note'}</span>
                    <div className="absolute right-2 text-sm animate-bounce-gentle">
                      📝
                    </div>
                  </button>
                ) : (
                  <div className="space-y-2 animate-scale-in">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add a note for today..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 animate-glow"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveNote}
                        disabled={isAnimating}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAnimating ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setShowNoteInput(false)}
                        className="flex-1 bg-gradient-to-r from-gray-300 to-slate-300 dark:from-gray-600 dark:to-slate-600 hover:from-gray-400 hover:to-slate-400 dark:hover:from-gray-500 dark:hover:to-slate-500 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {todayRecord?.notes && !showNoteInput && (
                  <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg animate-slide-up">
                    <p className="text-sm text-blue-800 dark:text-blue-200">{todayRecord.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};