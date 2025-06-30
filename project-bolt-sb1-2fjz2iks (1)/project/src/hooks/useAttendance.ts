import { useState, useEffect } from 'react';
import { AttendanceRecord, AttendanceStats, BreakRecord } from '../types';
import { useGeolocation } from './useGeolocation';
import { useGoogleSheets } from './useGoogleSheets';
import { useApp } from '../contexts/AppContext';

export const useAttendance = (userId: string | null) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [activeBreak, setActiveBreak] = useState<BreakRecord | null>(null);
  const [shortLeavesUsed, setShortLeavesUsed] = useState(0);

  const { isWithinOfficeRange, getLocationString } = useGeolocation();
  const { isConnected, syncToGoogleSheets } = useGoogleSheets();
  const { users } = useApp();

  const STORAGE_KEY = userId ? `attendance_records_${userId}` : 'attendance_records';
  const SHORT_LEAVE_KEY = userId ? `short_leaves_${userId}` : 'short_leaves';
  
  // Standard work times
  const STANDARD_CHECK_IN = '09:45';
  const STANDARD_CHECK_OUT = '18:00';
  const LATE_CHECK_IN_LIMIT = '11:30';
  const EARLY_CHECK_OUT_LIMIT = '16:00';
  const MAX_SHORT_LEAVES_PER_MONTH = 2;

  useEffect(() => {
    if (!userId) {
      setRecords([]);
      setTodayRecord(null);
      setIsCheckedIn(false);
      setActiveBreak(null);
      setShortLeavesUsed(0);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedRecords = JSON.parse(stored);
      setRecords(parsedRecords);
      
      const today = new Date().toISOString().split('T')[0];
      const todayRec = parsedRecords.find((r: AttendanceRecord) => r.date === today);
      
      if (todayRec) {
        setTodayRecord(todayRec);
        setIsCheckedIn(!!todayRec.checkIn && !todayRec.checkOut);
        
        // Check for active break
        const activeBreakRec = todayRec.breaks?.find((b: BreakRecord) => !b.endTime);
        if (activeBreakRec) {
          setActiveBreak(activeBreakRec);
        }
      }
    }

    // Load short leaves count for current month
    const shortLeaveData = localStorage.getItem(SHORT_LEAVE_KEY);
    if (shortLeaveData) {
      const data = JSON.parse(shortLeaveData);
      const currentMonth = new Date().toISOString().slice(0, 7);
      setShortLeavesUsed(data[currentMonth] || 0);
    }
  }, [userId, STORAGE_KEY, SHORT_LEAVE_KEY]);

  const saveRecords = (newRecords: AttendanceRecord[]) => {
    if (!userId) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
    setRecords(newRecords);
    
    // Auto-sync to Google Sheets if enabled
    if (isConnected) {
      syncToGoogleSheetsAsync(newRecords);
    }
  };

  const syncToGoogleSheetsAsync = async (recordsToSync: AttendanceRecord[]) => {
    try {
      // Collect all attendance records from all users
      const allRecords: AttendanceRecord[] = [];
      
      users.forEach(user => {
        const userRecords = JSON.parse(localStorage.getItem(`attendance_records_${user.id}`) || '[]');
        allRecords.push(...userRecords);
      });

      // Sort by date (newest first)
      allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      await syncToGoogleSheets(allRecords, users);
    } catch (error) {
      console.error('Auto-sync to Google Sheets failed:', error);
      // Don't show error to user for auto-sync failures
    }
  };

  const updateShortLeaves = (count: number) => {
    if (!userId) return;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const shortLeaveData = JSON.parse(localStorage.getItem(SHORT_LEAVE_KEY) || '{}');
    shortLeaveData[currentMonth] = count;
    localStorage.setItem(SHORT_LEAVE_KEY, JSON.stringify(shortLeaveData));
    setShortLeavesUsed(count);
  };

  const isSunday = (date: string) => {
    return new Date(date).getDay() === 0;
  };

  const isShortLeaveEligible = (checkInTime: string, checkOutTime?: string) => {
    if (shortLeavesUsed >= MAX_SHORT_LEAVES_PER_MONTH) return false;
    
    const checkIn = new Date(`2000-01-01T${checkInTime}:00`);
    const standardCheckIn = new Date(`2000-01-01T${STANDARD_CHECK_IN}:00`);
    const lateLimit = new Date(`2000-01-01T${LATE_CHECK_IN_LIMIT}:00`);
    
    if (checkOutTime) {
      const checkOut = new Date(`2000-01-01T${checkOutTime}:00`);
      const earlyLimit = new Date(`2000-01-01T${EARLY_CHECK_OUT_LIMIT}:00`);
      const standardCheckOut = new Date(`2000-01-01T${STANDARD_CHECK_OUT}:00`);
      
      // Option 1: Check in till 11:30 AM and check out at 6:00 PM (or later)
      const option1 = checkIn <= lateLimit && checkOut >= standardCheckOut;
      
      // Option 2: Check in at 9:45 AM (or earlier) and check out at 4:00 PM (or later)
      const option2 = checkIn <= standardCheckIn && checkOut >= earlyLimit;
      
      return option1 || option2;
    }
    
    return false;
  };

  const getAttendanceStatus = (checkInTime: string, checkOutTime?: string, date: string) => {
    // Sunday is always off
    if (isSunday(date)) {
      return 'absent'; // Sunday records shouldn't exist, but if they do, mark as absent
    }

    const checkIn = new Date(`2000-01-01T${checkInTime}:00`);
    const standardCheckIn = new Date(`2000-01-01T${STANDARD_CHECK_IN}:00`);
    
    // If checked out, calculate based on total hours and short leave eligibility
    if (checkOutTime) {
      const checkOut = new Date(`2000-01-01T${checkOutTime}:00`);
      const totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      
      // Check if eligible for short leave (counts as full day)
      if (isShortLeaveEligible(checkInTime, checkOutTime)) {
        return 'present';
      }
      
      // Regular attendance rules
      if (totalHours >= 7) {
        return 'present';
      } else {
        return 'partial';
      }
    }
    
    // If only checked in, determine based on check-in time
    return checkIn <= standardCheckIn ? 'present' : 'partial';
  };

  const checkIn = async () => {
    if (!userId) return;
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check if today is Sunday
    if (isSunday(today)) {
      alert('Today is Sunday - an off day. Attendance is not required.');
      return;
    }

    // Check if already checked in today
    const existingRecord = records.find(r => r.date === today);
    if (existingRecord && existingRecord.checkIn) {
      alert('You have already checked in today. Only one check-in per day is allowed.');
      return;
    }

    try {
      // Check geolocation
      const locationCheck = await isWithinOfficeRange();
      
      if (!locationCheck.allowed) {
        alert(`❌ Check-in denied!\n\n${locationCheck.message}\n\nAccuracy: ±${locationCheck.accuracy}m\n\nPlease move closer to the office to check in.`);
        return;
      }

      const time = now.toTimeString().split(' ')[0].slice(0, 5);
      const location = getLocationString();
      const status = getAttendanceStatus(time, undefined, today);
      
      if (existingRecord) {
        const updatedRecords = records.map(r => 
          r.date === today 
            ? { ...r, checkIn: time, status: status as any, location, locationVerified: true, distanceFromOffice: locationCheck.distance }
            : r
        );
        saveRecords(updatedRecords);
        setTodayRecord({ ...existingRecord, checkIn: time, status: status as any, location, locationVerified: true, distanceFromOffice: locationCheck.distance });
      } else {
        const newRecord: AttendanceRecord = {
          id: crypto.randomUUID(),
          userId,
          date: today,
          checkIn: time,
          status: status as any,
          location,
          locationVerified: true,
          distanceFromOffice: locationCheck.distance,
          breaks: []
        };
        const updatedRecords = [...records, newRecord];
        saveRecords(updatedRecords);
        setTodayRecord(newRecord);
      }
      
      setIsCheckedIn(true);
      
      // Show success message with location info
      alert(`✅ Check-in successful!\n\n${locationCheck.message}\nAccuracy: ±${locationCheck.accuracy}m\nTime: ${time}`);
      
    } catch (error) {
      alert(`❌ Check-in failed!\n\nLocation Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease enable location services and try again.`);
    }
  };

  const checkOut = async () => {
    if (!userId) return;
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].slice(0, 5);

    // Check if already checked out today
    const existingRecord = records.find(r => r.date === today);
    if (existingRecord && existingRecord.checkOut) {
      alert('You have already checked out today. Only one check-out per day is allowed.');
      return;
    }

    // Check if not checked in yet
    if (!existingRecord || !existingRecord.checkIn) {
      alert('You must check in first before checking out.');
      return;
    }

    try {
      // Check geolocation
      const locationCheck = await isWithinOfficeRange();
      
      if (!locationCheck.allowed) {
        alert(`❌ Check-out denied!\n\n${locationCheck.message}\n\nAccuracy: ±${locationCheck.accuracy}m\n\nPlease move closer to the office to check out.`);
        return;
      }

      const updatedRecords = records.map(r => {
        if (r.date === today) {
          const checkInTime = new Date(`${today}T${r.checkIn}:00`);
          const checkOutTime = new Date(`${today}T${time}:00`);
          let totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
          
          // Subtract break time
          const totalBreakTime = (r.breaks || []).reduce((sum, b) => sum + (b.duration || 0), 0);
          totalHours -= totalBreakTime;
          
          const overtime = Math.max(0, totalHours - 8);
          
          // Determine final status and check for short leave usage
          const finalStatus = getAttendanceStatus(r.checkIn, time, today);
          
          // If this qualifies as short leave and user hasn't exceeded limit, use short leave
          let usedShortLeave = false;
          if (finalStatus === 'present' && isShortLeaveEligible(r.checkIn, time) && 
              (totalHours < 7 || new Date(`2000-01-01T${r.checkIn}:00`) > new Date(`2000-01-01T${STANDARD_CHECK_IN}:00`))) {
            usedShortLeave = true;
            updateShortLeaves(shortLeavesUsed + 1);
          }
          
          return {
            ...r,
            checkOut: time,
            totalHours: Math.round(totalHours * 100) / 100,
            overtime: Math.round(overtime * 100) / 100,
            status: finalStatus as any,
            shortLeaveUsed: usedShortLeave,
            checkOutLocation: getLocationString(),
            checkOutLocationVerified: true,
            checkOutDistanceFromOffice: locationCheck.distance
          };
        }
        return r;
      });

      saveRecords(updatedRecords);
      const updated = updatedRecords.find(r => r.date === today);
      setTodayRecord(updated || null);
      setIsCheckedIn(false);
      setActiveBreak(null);
      
      // Show success message with location info
      alert(`✅ Check-out successful!\n\n${locationCheck.message}\nAccuracy: ±${locationCheck.accuracy}m\nTime: ${time}`);
      
    } catch (error) {
      alert(`❌ Check-out failed!\n\nLocation Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease enable location services and try again.`);
    }
  };

  const startBreak = (type: 'lunch' | 'coffee' | 'other') => {
    if (!todayRecord || !userId) return;

    // Check if user is checked in
    if (!todayRecord.checkIn) {
      alert('You must check in first before taking a break.');
      return;
    }

    // Check if user has already checked out
    if (todayRecord.checkOut) {
      alert('You cannot take a break after checking out.');
      return;
    }

    // Check if there's already an active break
    const hasActiveBreak = todayRecord.breaks?.some(b => !b.endTime);
    if (hasActiveBreak) {
      alert('You already have an active break. Please end your current break first.');
      return;
    }

    const now = new Date();
    const time = now.toTimeString().split(' ')[0].slice(0, 5);
    
    const newBreak: BreakRecord = {
      id: crypto.randomUUID(),
      type,
      startTime: time
    };

    const updatedRecord = {
      ...todayRecord,
      breaks: [...(todayRecord.breaks || []), newBreak]
    };

    const updatedRecords = records.map(r => 
      r.date === todayRecord.date ? updatedRecord : r
    );

    saveRecords(updatedRecords);
    setTodayRecord(updatedRecord);
    setActiveBreak(newBreak);
  };

  const endBreak = () => {
    if (!activeBreak || !todayRecord || !userId) return;

    const now = new Date();
    const time = now.toTimeString().split(' ')[0].slice(0, 5);
    
    const startTime = new Date(`${todayRecord.date}T${activeBreak.startTime}:00`);
    const endTime = new Date(`${todayRecord.date}T${time}:00`);
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    const updatedBreaks = (todayRecord.breaks || []).map(b =>
      b.id === activeBreak.id
        ? { ...b, endTime: time, duration: Math.round(duration * 100) / 100 }
        : b
    );

    const updatedRecord = {
      ...todayRecord,
      breaks: updatedBreaks
    };

    const updatedRecords = records.map(r => 
      r.date === todayRecord.date ? updatedRecord : r
    );

    saveRecords(updatedRecords);
    setTodayRecord(updatedRecord);
    setActiveBreak(null);
  };

  const addNote = (note: string) => {
    if (!todayRecord || !userId) return;

    const updatedRecord = { ...todayRecord, notes: note };
    const updatedRecords = records.map(r => 
      r.date === todayRecord.date ? updatedRecord : r
    );

    saveRecords(updatedRecords);
    setTodayRecord(updatedRecord);
  };

  const getStats = (): AttendanceStats => {
    // Filter out Sundays from calculations
    const workDayRecords = records.filter(r => !isSunday(r.date));
    
    const totalDays = workDayRecords.length;
    const presentDays = workDayRecords.filter(r => r.status === 'present').length;
    const absentDays = workDayRecords.filter(r => r.status === 'absent').length;
    const totalHours = workDayRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
    const totalOvertime = workDayRecords.reduce((sum, r) => sum + (r.overtime || 0), 0);
    const averageHours = totalDays > 0 ? totalHours / totalDays : 0;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Calculate streaks (excluding Sundays)
    const sortedRecords = [...workDayRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = sortedRecords.length - 1; i >= 0; i--) {
      if (sortedRecords[i].status === 'present') {
        tempStreak++;
        if (i === sortedRecords.length - 1) currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
        if (i === sortedRecords.length - 1) currentStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      totalDays,
      presentDays,
      absentDays,
      averageHours: Math.round(averageHours * 100) / 100,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      totalOvertime: Math.round(totalOvertime * 100) / 100,
      currentStreak,
      longestStreak
    };
  };

  const getShortLeaveInfo = () => {
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return {
      used: shortLeavesUsed,
      remaining: MAX_SHORT_LEAVES_PER_MONTH - shortLeavesUsed,
      total: MAX_SHORT_LEAVES_PER_MONTH,
      month: currentMonth
    };
  };

  // Helper functions to check if actions are allowed
  const canCheckIn = () => {
    const today = new Date().toISOString().split('T')[0];
    if (isSunday(today)) return false;
    
    const existingRecord = records.find(r => r.date === today);
    return !existingRecord || !existingRecord.checkIn;
  };

  const canCheckOut = () => {
    const today = new Date().toISOString().split('T')[0];
    const existingRecord = records.find(r => r.date === today);
    return existingRecord && existingRecord.checkIn && !existingRecord.checkOut;
  };

  return {
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
    isSunday: (date: string) => isSunday(date),
    isShortLeaveEligible: (checkIn: string, checkOut?: string) => isShortLeaveEligible(checkIn, checkOut),
    canCheckIn,
    canCheckOut
  };
};