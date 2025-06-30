import { useState, useEffect } from 'react';
import { LeaveRequest } from '../types';

export const useLeaves = (userId: string | null) => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  const STORAGE_KEY = userId ? `leave_requests_${userId}` : 'leave_requests';

  useEffect(() => {
    if (!userId) {
      setLeaves([]);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setLeaves(JSON.parse(stored));
    }
  }, [userId, STORAGE_KEY]);

  const saveLeaves = (newLeaves: LeaveRequest[]) => {
    if (!userId) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLeaves));
    setLeaves(newLeaves);
  };

  const submitLeaveRequest = (request: Omit<LeaveRequest, 'id' | 'requestDate' | 'status' | 'userId'>) => {
    if (!userId) return;
    
    const newRequest: LeaveRequest = {
      ...request,
      id: crypto.randomUUID(),
      userId,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    const updatedLeaves = [...leaves, newRequest];
    saveLeaves(updatedLeaves);
  };

  const updateLeaveStatus = (id: string, status: 'approved' | 'rejected', approvedBy?: string) => {
    const updatedLeaves = leaves.map(leave =>
      leave.id === id ? { ...leave, status, approvedBy } : leave
    );
    saveLeaves(updatedLeaves);
  };

  const deleteLeaveRequest = (id: string) => {
    const updatedLeaves = leaves.filter(leave => leave.id !== id);
    saveLeaves(updatedLeaves);
  };

  return {
    leaves,
    submitLeaveRequest,
    updateLeaveStatus,
    deleteLeaveRequest
  };
};