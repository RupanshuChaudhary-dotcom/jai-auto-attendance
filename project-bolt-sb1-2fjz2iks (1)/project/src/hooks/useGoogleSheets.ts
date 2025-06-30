import { useState, useEffect } from 'react';
import { AttendanceRecord } from '../types';

interface GoogleSheetsConfig {
  spreadsheetId: string;
  apiKey: string;
  sheetName: string;
  enabled: boolean;
}

export const useGoogleSheets = () => {
  const [config, setConfig] = useState<GoogleSheetsConfig>({
    spreadsheetId: '',
    apiKey: '',
    sheetName: 'Attendance Data',
    enabled: false
  });
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Load config from localStorage
    const storedConfig = localStorage.getItem('google_sheets_config');
    if (storedConfig) {
      const parsedConfig = JSON.parse(storedConfig);
      setConfig(parsedConfig);
      setIsConnected(parsedConfig.enabled && parsedConfig.spreadsheetId && parsedConfig.apiKey);
    }

    const storedLastSync = localStorage.getItem('google_sheets_last_sync');
    if (storedLastSync) {
      setLastSync(storedLastSync);
    }
  }, []);

  const saveConfig = (newConfig: Partial<GoogleSheetsConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem('google_sheets_config', JSON.stringify(updatedConfig));
    setIsConnected(updatedConfig.enabled && updatedConfig.spreadsheetId && updatedConfig.apiKey);
  };

  const formatAttendanceData = (records: AttendanceRecord[], users: any[]) => {
    const headers = [
      'Date',
      'Employee Name',
      'Employee ID',
      'Department',
      'Email',
      'Check In Time',
      'Check Out Time',
      'Total Hours',
      'Status',
      'Overtime Hours',
      'Break Duration',
      'Notes',
      'Location Verified',
      'Distance from Office (m)',
      'Short Leave Used',
      'Sync Timestamp'
    ];

    const rows = records.map(record => {
      const user = users.find(u => u.id === record.userId);
      const breakDuration = record.breaks?.reduce((total, b) => total + (b.duration || 0), 0) || 0;
      
      return [
        record.date,
        user?.name || 'Unknown',
        user?.employeeId || 'N/A',
        user?.department || 'N/A',
        user?.email || 'N/A',
        record.checkIn || '',
        record.checkOut || '',
        record.totalHours || 0,
        record.status,
        record.overtime || 0,
        breakDuration,
        record.notes || '',
        record.locationVerified ? 'Yes' : 'No',
        record.distanceFromOffice || 0,
        (record as any).shortLeaveUsed ? 'Yes' : 'No',
        new Date().toISOString()
      ];
    });

    return [headers, ...rows];
  };

  const syncToGoogleSheets = async (allRecords: AttendanceRecord[], users: any[]) => {
    if (!isConnected || !config.spreadsheetId || !config.apiKey) {
      throw new Error('Google Sheets not configured properly');
    }

    setSyncStatus('syncing');

    try {
      // Format data for Google Sheets
      const sheetData = formatAttendanceData(allRecords, users);
      
      // Create the Google Sheets API URL
      const baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
      const range = `${config.sheetName}!A1:P${sheetData.length}`;
      const url = `${baseUrl}/${config.spreadsheetId}/values/${range}?valueInputOption=RAW&key=${config.apiKey}`;

      // Clear existing data first
      const clearUrl = `${baseUrl}/${config.spreadsheetId}/values/${config.sheetName}!A:P:clear?key=${config.apiKey}`;
      await fetch(clearUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Upload new data
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: sheetData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to sync to Google Sheets');
      }

      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem('google_sheets_last_sync', now);
      setSyncStatus('success');

      return { success: true, recordCount: allRecords.length };
    } catch (error) {
      setSyncStatus('error');
      throw error;
    }
  };

  const testConnection = async () => {
    if (!config.spreadsheetId || !config.apiKey) {
      throw new Error('Please provide both Spreadsheet ID and API Key');
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}?key=${config.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to connect to Google Sheets');
      }

      const data = await response.json();
      return { success: true, title: data.properties?.title };
    } catch (error) {
      throw error;
    }
  };

  const createSheet = async () => {
    if (!config.spreadsheetId || !config.apiKey) {
      throw new Error('Please provide both Spreadsheet ID and API Key');
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}:batchUpdate?key=${config.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            addSheet: {
              properties: {
                title: config.sheetName
              }
            }
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create sheet');
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  return {
    config,
    isConnected,
    lastSync,
    syncStatus,
    saveConfig,
    syncToGoogleSheets,
    testConnection,
    createSheet,
    formatAttendanceData
  };
};