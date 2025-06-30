import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

interface OfficeLocation {
  latitude: number;
  longitude: number;
  name: string;
  allowedRadius: number; // in meters
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false
  });

  // Office location with your specific coordinates
  const OFFICE_LOCATION: OfficeLocation = {
    latitude: 28.6611056,  // Your specified latitude
    longitude: 77.3457939, // Your specified longitude
    name: 'Main Office',
    allowedRadius: 100 // 100 meters radius as requested
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      setLocation(prev => ({ ...prev, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            error: null,
            loading: false
          });
          resolve(position);
        },
        (error) => {
          let errorMessage = 'Unable to retrieve location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user. Please enable location services and refresh the page.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please check your GPS signal.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }

          setLocation(prev => ({
            ...prev,
            error: errorMessage,
            loading: false
          }));
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true, // Request high accuracy GPS
          timeout: 15000, // 15 second timeout
          maximumAge: 30000 // Cache for 30 seconds
        }
      );
    });
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const isWithinOfficeRange = async (): Promise<{
    allowed: boolean;
    distance: number;
    accuracy: number;
    message: string;
  }> => {
    try {
      const position = await getCurrentPosition();
      const distance = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        OFFICE_LOCATION.latitude,
        OFFICE_LOCATION.longitude
      );

      const accuracy = position.coords.accuracy;
      const allowed = distance <= OFFICE_LOCATION.allowedRadius;

      let message = '';
      if (allowed) {
        message = `✅ Within office range (${Math.round(distance)}m from ${OFFICE_LOCATION.name})`;
      } else {
        message = `❌ Outside office range (${Math.round(distance)}m from ${OFFICE_LOCATION.name}). Must be within ${OFFICE_LOCATION.allowedRadius}m`;
      }

      return {
        allowed,
        distance: Math.round(distance),
        accuracy: Math.round(accuracy),
        message
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Location check failed');
    }
  };

  const getLocationString = (): string => {
    if (location.latitude && location.longitude) {
      return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    }
    return 'Location unavailable';
  };

  const updateOfficeLocation = (newLocation: Partial<OfficeLocation>) => {
    Object.assign(OFFICE_LOCATION, newLocation);
  };

  const getOfficeLocationString = (): string => {
    return `${OFFICE_LOCATION.latitude}, ${OFFICE_LOCATION.longitude}`;
  };

  const getDistanceFromOffice = async (): Promise<number> => {
    try {
      const position = await getCurrentPosition();
      return calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        OFFICE_LOCATION.latitude,
        OFFICE_LOCATION.longitude
      );
    } catch (error) {
      throw new Error('Unable to calculate distance from office');
    }
  };

  return {
    location,
    getCurrentPosition,
    isWithinOfficeRange,
    getLocationString,
    getOfficeLocationString,
    getDistanceFromOffice,
    calculateDistance,
    updateOfficeLocation,
    officeLocation: OFFICE_LOCATION
  };
};