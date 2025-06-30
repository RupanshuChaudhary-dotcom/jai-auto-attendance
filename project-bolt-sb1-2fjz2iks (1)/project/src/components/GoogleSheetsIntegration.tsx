import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Settings, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  ExternalLink,
  AlertTriangle,
  Clock,
  Database,
  Zap,
  Key,
  Link,
  Upload,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { useGoogleSheets } from '../hooks/useGoogleSheets';
import { useApp } from '../contexts/AppContext';

export const GoogleSheetsIntegration: React.FC = () => {
  const { users } = useApp();
  const { 
    config, 
    isConnected, 
    lastSync, 
    syncStatus, 
    saveConfig, 
    syncToGoogleSheets, 
    testConnection,
    createSheet 
  } = useGoogleSheets();

  const [showConfig, setShowConfig] = useState(false);
  const [tempConfig, setTempConfig] = useState(config);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');

  useEffect(() => {
    setTempConfig(config);
  }, [config]);

  const handleSaveConfig = async () => {
    try {
      saveConfig(tempConfig);
      setShowConfig(false);
      
      if (tempConfig.enabled && tempConfig.spreadsheetId && tempConfig.apiKey) {
        await handleTestConnection();
      }
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setConnectionStatus('unknown');
    
    try {
      const result = await testConnection();
      setConnectionStatus('success');
      alert(`✅ Connection successful!\n\nSpreadsheet: ${result.title}\n\nYou can now sync attendance data to Google Sheets.`);
    } catch (error) {
      setConnectionStatus('error');
      alert(`❌ Connection failed!\n\n${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your configuration.`);
    } finally {
      setTesting(false);
    }
  };

  const handleSyncData = async () => {
    if (!isConnected) {
      alert('Please configure Google Sheets integration first.');
      return;
    }

    setSyncing(true);
    
    try {
      // Collect all attendance records from all users
      const allRecords: any[] = [];
      
      users.forEach(user => {
        const userRecords = JSON.parse(localStorage.getItem(`attendance_records_${user.id}`) || '[]');
        allRecords.push(...userRecords);
      });

      // Sort by date (newest first)
      allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const result = await syncToGoogleSheets(allRecords, users);
      
      alert(`✅ Sync successful!\n\n${result.recordCount} attendance records synced to Google Sheets.\n\nLast sync: ${new Date().toLocaleString()}`);
    } catch (error) {
      alert(`❌ Sync failed!\n\n${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your configuration and try again.`);
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateSheet = async () => {
    if (!config.spreadsheetId || !config.apiKey) {
      alert('Please provide Spreadsheet ID and API Key first.');
      return;
    }

    try {
      await createSheet();
      alert(`✅ Sheet created successfully!\n\nSheet name: ${config.sheetName}\n\nYou can now sync data to this sheet.`);
    } catch (error) {
      alert(`❌ Failed to create sheet!\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusColor = () => {
    if (!isConnected) return 'text-gray-500';
    switch (connectionStatus) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusIcon = () => {
    if (!isConnected) return <XCircle className="h-5 w-5 text-gray-500" />;
    switch (connectionStatus) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 rounded-xl">
            <FileSpreadsheet className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Google Sheets Integration</h2>
            <p className="text-gray-600 dark:text-gray-400">Automatically sync attendance data to Google Sheets</p>
          </div>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Settings className="h-4 w-4" />
          <span>Configure</span>
        </button>
      </div>

      {/* Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Connection Status</h3>
              <p className={`text-sm ${getStatusColor()}`}>
                {!isConnected ? 'Not configured' : 
                 connectionStatus === 'success' ? 'Connected and ready' :
                 connectionStatus === 'error' ? 'Connection failed' : 'Configuration pending'}
              </p>
            </div>
          </div>
          
          {isConnected && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
                <span>Test</span>
              </button>
              
              <button
                onClick={handleSyncData}
                disabled={syncing || connectionStatus !== 'success'}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50"
              >
                <Upload className={`h-4 w-4 ${syncing ? 'animate-bounce' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Last Sync Info */}
        {lastSync && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Last sync: {new Date(lastSync).toLocaleString()}</span>
          </div>
        )}

        {/* Sync Status */}
        {syncStatus !== 'idle' && (
          <div className="mt-3 p-3 rounded-lg border">
            {syncStatus === 'syncing' && (
              <div className="flex items-center space-x-2 text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Syncing data to Google Sheets...</span>
              </div>
            )}
            {syncStatus === 'success' && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Data synced successfully!</span>
              </div>
            )}
            {syncStatus === 'error' && (
              <div className="flex items-center space-x-2 text-red-600">
                <XCircle className="h-4 w-4" />
                <span>Sync failed. Please check your configuration.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-slide-down">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Google Sheets Configuration</h3>
          
          <div className="space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Enable Integration</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automatically sync attendance data to Google Sheets</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempConfig.enabled}
                  onChange={(e) => setTempConfig({ ...tempConfig, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Spreadsheet ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center space-x-2">
                  <Link className="h-4 w-4" />
                  <span>Google Spreadsheet ID *</span>
                </div>
              </label>
              <input
                type="text"
                value={tempConfig.spreadsheetId}
                onChange={(e) => setTempConfig({ ...tempConfig, spreadsheetId: e.target.value })}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Found in the URL: https://docs.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit
              </p>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Google Sheets API Key *</span>
                </div>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={tempConfig.apiKey}
                  onChange={(e) => setTempConfig({ ...tempConfig, apiKey: e.target.value })}
                  placeholder="AIzaSyBnNAISIGI_pVEMRuHhHbMA_laKFnr_jEo"
                  className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Get your API key from <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>
              </p>
            </div>

            {/* Sheet Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Sheet Name</span>
                </div>
              </label>
              <input
                type="text"
                value={tempConfig.sheetName}
                onChange={(e) => setTempConfig({ ...tempConfig, sheetName: e.target.value })}
                placeholder="Attendance Data"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Name of the sheet tab where data will be synced
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={handleSaveConfig}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Save Configuration</span>
              </button>
              
              <button
                onClick={handleCreateSheet}
                disabled={!tempConfig.spreadsheetId || !tempConfig.apiKey}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="h-4 w-4" />
                <span>Create Sheet</span>
              </button>
              
              <button
                onClick={() => setShowConfig(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-start space-x-3">
          <Database className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Setup Instructions</h3>
            <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
              <div className="flex items-start space-x-2">
                <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <div>
                  <p className="font-medium">Create a Google Spreadsheet</p>
                  <p className="text-blue-700 dark:text-blue-300">Go to <a href="https://sheets.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Sheets</a> and create a new spreadsheet</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <div>
                  <p className="font-medium">Get the Spreadsheet ID</p>
                  <p className="text-blue-700 dark:text-blue-300">Copy the ID from the URL: docs.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <div>
                  <p className="font-medium">Enable Google Sheets API</p>
                  <p className="text-blue-700 dark:text-blue-300">Go to <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a> and enable the Google Sheets API</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                <div>
                  <p className="font-medium">Create API Key</p>
                  <p className="text-blue-700 dark:text-blue-300">Create credentials → API Key and restrict it to Google Sheets API</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">5</span>
                <div>
                  <p className="font-medium">Make Spreadsheet Public</p>
                  <p className="text-blue-700 dark:text-blue-300">Share your spreadsheet with "Anyone with the link can view" or add your API key's service account</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Data Structure</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          The following data will be synced to your Google Sheet:
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {[
                  'Date', 'Employee Name', 'Employee ID', 'Department', 'Email',
                  'Check In Time', 'Check Out Time', 'Total Hours', 'Status',
                  'Overtime Hours', 'Break Duration', 'Notes', 'Location Verified',
                  'Distance from Office', 'Short Leave Used', 'Sync Timestamp'
                ].map((header) => (
                  <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600 last:border-r-0">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="text-xs text-gray-600 dark:text-gray-400">
                <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-600">2024-01-15</td>
                <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-600">Rajat Kumar</td>
                <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-600">EXP101</td>
                <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-600">Export</td>
                <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-600">rajat.kumar@jaiauto.in</td>
                <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-600">09:45</td>
                <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-600">18:00</td>
                <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-600">8.25</td>
                <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-600">present</td>
                <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-600">0.25</td>
                <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-600">1.0</td>
                <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-600">Good day</td>
                <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-600">Yes</td>
                <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-600">45</td>
                <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-600">No</td>
                <td className="px-3 py-2">2024-01-15T18:30:00Z</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Links */}
      {isConnected && config.spreadsheetId && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <a
              href={`https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open Google Sheet</span>
            </a>
            
            <a
              href="https://console.developers.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Google Cloud Console</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};