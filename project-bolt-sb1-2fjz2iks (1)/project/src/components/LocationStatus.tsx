import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, XCircle, AlertTriangle, Loader, Settings, Navigation } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';

interface LocationStatusProps {
  onLocationUpdate?: (isValid: boolean, distance?: number) => void;
}

export const LocationStatus: React.FC<LocationStatusProps> = ({ onLocationUpdate }) => {
  const { location, isWithinOfficeRange, officeLocation, updateOfficeLocation, getOfficeLocationString } = useGeolocation();
  const [locationStatus, setLocationStatus] = useState<{
    allowed: boolean;
    distance: number;
    accuracy: number;
    message: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempOfficeLocation, setTempOfficeLocation] = useState(officeLocation);

  const checkLocation = async () => {
    setIsChecking(true);
    try {
      const result = await isWithinOfficeRange();
      setLocationStatus(result);
      onLocationUpdate?.(result.allowed, result.distance);
    } catch (error) {
      setLocationStatus({
        allowed: false,
        distance: 0,
        accuracy: 0,
        message: error instanceof Error ? error.message : 'Location check failed'
      });
      onLocationUpdate?.(false);
    } finally {
      setIsChecking(false);
    }
  };

  const updateOfficeSettings = () => {
    updateOfficeLocation(tempOfficeLocation);
    setShowSettings(false);
    checkLocation(); // Recheck with new settings
  };

  useEffect(() => {
    // Auto-check location when component mounts
    checkLocation();
    
    // Set up periodic location checking every 30 seconds
    const interval = setInterval(checkLocation, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
    }
    
    if (!locationStatus) {
      return <MapPin className="h-5 w-5 text-gray-400 animate-pulse" />;
    }

    if (locationStatus.allowed) {
      return <CheckCircle className="h-5 w-5 text-green-500 animate-bounce-gentle" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500 animate-shake" />;
    }
  };

  const getStatusColor = () => {
    if (isChecking) return 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-900 dark:to-indigo-900';
    if (!locationStatus) return 'border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 dark:border-gray-700 dark:from-gray-800 dark:to-slate-800';
    if (locationStatus.allowed) return 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-900 dark:to-emerald-900';
    return 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50 dark:border-red-800 dark:from-red-900 dark:to-pink-900';
  };

  const getStatusTextColor = () => {
    if (isChecking) return 'text-blue-800 dark:text-blue-200';
    if (!locationStatus) return 'text-gray-800 dark:text-gray-200';
    if (locationStatus.allowed) return 'text-green-800 dark:text-green-200';
    return 'text-red-800 dark:text-red-200';
  };

  return (
    <div className="space-y-4">
      {/* Location Status Card */}
      <div className={`rounded-lg border p-4 transition-all duration-300 hover:shadow-md ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h4 className={`font-medium ${getStatusTextColor()}`}>
                {isChecking ? 'Checking Location...' : 'Location Verification'}
              </h4>
              <p className={`text-sm ${getStatusTextColor()} opacity-80`}>
                {locationStatus?.message || 'Click refresh to check location'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={checkLocation}
              disabled={isChecking}
              className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 transform hover:scale-105"
              title="Refresh location"
            >
              <Navigation className={`h-4 w-4 ${isChecking ? 'animate-spin' : 'hover:animate-bounce-gentle'}`} />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105"
              title="Location settings"
            >
              <Settings className={`h-4 w-4 ${showSettings ? 'animate-spin' : 'hover:animate-wiggle'}`} />
            </button>
          </div>
        </div>

        {/* Office Location Info */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Office Location</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p>📍 {officeLocation.name}</p>
            <p>🌍 {getOfficeLocationString()}</p>
            <p>📏 Allowed radius: {officeLocation.allowedRadius}m</p>
          </div>
        </div>

        {/* Location Details */}
        {locationStatus && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Distance:</span>
                <span className={`font-bold ${locationStatus.allowed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {locationStatus.distance}m
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Accuracy:</span>
                <span className={`font-medium ${locationStatus.accuracy <= 20 ? 'text-green-600 dark:text-green-400' : locationStatus.accuracy <= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  ±{locationStatus.accuracy}m
                </span>
              </div>
            </div>
            
            {location.latitude && location.longitude && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <p>📱 Your location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
              </div>
            )}
          </div>
        )}

        {/* Accuracy Warning */}
        {locationStatus && locationStatus.accuracy > 50 && (
          <div className="mt-3 p-3 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900 border border-yellow-200 dark:border-yellow-800 rounded-lg animate-slide-down">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 animate-bounce-gentle" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                Low GPS accuracy detected. Move to an open area for better signal.
              </span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {locationStatus && locationStatus.allowed && (
          <div className="mt-3 p-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 border border-green-200 dark:border-green-800 rounded-lg animate-slide-down">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 animate-bounce-gentle" />
              <span className="text-sm text-green-700 dark:text-green-300">
                Perfect! You're within the office range. Attendance actions are enabled.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Office Location Settings */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-slide-down shadow-lg">
          <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Office Location Settings</span>
          </h5>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Office Name
              </label>
              <input
                type="text"
                value={tempOfficeLocation.name}
                onChange={(e) => setTempOfficeLocation({ ...tempOfficeLocation, name: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={tempOfficeLocation.latitude}
                  onChange={(e) => setTempOfficeLocation({ ...tempOfficeLocation, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={tempOfficeLocation.longitude}
                  onChange={(e) => setTempOfficeLocation({ ...tempOfficeLocation, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Allowed Radius (meters)
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={tempOfficeLocation.allowedRadius}
                onChange={(e) => setTempOfficeLocation({ ...tempOfficeLocation, allowedRadius: parseInt(e.target.value) || 100 })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            
            <div className="flex space-x-2 pt-2">
              <button
                onClick={updateOfficeSettings}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Update Settings
              </button>
              <button
                onClick={() => {
                  setTempOfficeLocation(officeLocation);
                  setShowSettings(false);
                }}
                className="flex-1 bg-gradient-to-r from-gray-300 to-slate-300 dark:from-gray-600 dark:to-slate-600 hover:from-gray-400 hover:to-slate-400 dark:hover:from-gray-500 dark:hover:to-slate-500 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Current Office Location:</p>
                <p>📍 Latitude: {officeLocation.latitude}</p>
                <p>📍 Longitude: {officeLocation.longitude}</p>
                <p>📏 Range: {officeLocation.allowedRadius}m radius</p>
                <p className="mt-2 text-blue-600 dark:text-blue-400">
                  💡 This matches your specified coordinates with 38m zoom level precision
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};