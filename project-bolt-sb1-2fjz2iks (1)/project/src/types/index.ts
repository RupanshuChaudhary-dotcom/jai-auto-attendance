export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  totalHours?: number;
  status: 'present' | 'absent' | 'partial';
  breaks?: BreakRecord[];
  notes?: string;
  location?: string;
  locationVerified?: boolean;
  distanceFromOffice?: number;
  checkOutLocation?: string;
  checkOutLocationVerified?: boolean;
  checkOutDistanceFromOffice?: number;
  overtime?: number;
  shortLeaveUsed?: boolean;
}

export interface BreakRecord {
  id: string;
  type: 'lunch' | 'coffee' | 'other';
  startTime: string;
  endTime?: string;
  duration?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'employee' | 'manager' | 'admin';
  avatar?: string;
  preferences: UserPreferences;
  isActive: boolean;
  joinDate: string;
  employeeId?: string;
}

export interface UserPreferences {
  darkMode: boolean;
  notifications: boolean;
  workingHours: number;
  breakReminders: boolean;
  emailReports: boolean;
  locationTracking: boolean;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  averageHours: number;
  attendanceRate: number;
  totalOvertime: number;
  currentStreak: number;
  longestStreak: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'vacation' | 'sick' | 'personal' | 'emergency';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  approvedBy?: string;
}

export interface Goal {
  id: string;
  userId: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  current: number;
  description: string;
  period: string;
}

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'streak' | 'hours' | 'punctuality' | 'consistency';
}

export interface UserSession {
  currentUserId: string | null;
  isLoggedIn: boolean;
}

export interface ShortLeaveInfo {
  used: number;
  remaining: number;
  total: number;
  month: string;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface OfficeLocation {
  latitude: number;
  longitude: number;
  name: string;
  allowedRadius: number;
}