import axiosInstance from './axios';

export const locationApi = {
  // Get place suggestions for autocomplete
  getPlaceSuggestions: async (query, country = 'ET') => {
    try {
      const response = await axiosInstance.get('/vendors/place-suggestions', {
        params: { query, country }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting place suggestions:', error);
      throw error;
    }
  },

  // Get nearby vendors based on coordinates
  getNearbyVendors: async (latitude, longitude, radius = 3000) => {
    try {
      const response = await axiosInstance.get('/vendors/nearby', {
        params: { 
          lat: latitude, 
          lng: longitude, 
          radius 
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting nearby vendors:', error);
      throw error;
    }
  },

  // Get user's location using browser geolocation
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Location permission denied'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Location information unavailable'));
              break;
            case error.TIMEOUT:
              reject(new Error('Location request timed out'));
              break;
            default:
              reject(new Error('An unknown error occurred'));
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  },

  // Format address for display
  formatAddress: (locationDetails) => {
    if (!locationDetails) return 'Unknown Location';
    
    const { placeName, area, city, state } = locationDetails;
    const parts = [placeName];
    
    if (area && area !== placeName) {
      parts.push(area);
    }
    
    if (city && city !== placeName && city !== area) {
      parts.push(city);
    }
    
    if (state && state !== city) {
      parts.push(state);
    }
    
    return parts.join(', ');
  },

  // Calculate distance between two points (in meters)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  },

  // Format distance for display
  formatDistance: (distance) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  }
};

export default locationApi;
