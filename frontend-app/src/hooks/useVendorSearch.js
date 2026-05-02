import { useState, useCallback } from 'react';
import { vendorApi } from '../api/vendor.api';

export const useVendorSearch = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [searchLocation, setSearchLocation] = useState(null);

  const searchVendors = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Searching vendors with params:', params);
      
      const response = await vendorApi.searchVendors(params);
      const { vendors: searchResults, pagination: paginationData } = response.data.data;
      
      console.log('Search results:', searchResults);
      console.log('Pagination:', paginationData);
      
      setVendors(searchResults || []);
      setPagination(paginationData || {});
      
      // Store search location if coordinates were used
      if (params.lng && params.lat) {
        setSearchLocation({
          longitude: params.lng,
          latitude: params.lat,
          radius: params.radius || 3000
        });
      }
      
      return response.data;
    } catch (err) {
      console.error('Vendor search error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to search vendors';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreVendors = useCallback(async (params) => {
    if (loading || pagination.page >= pagination.pages) return;
    
    setLoading(true);
    try {
      const nextPageParams = {
        ...params,
        page: pagination.page + 1
      };
      
      const response = await vendorApi.searchVendors(nextPageParams);
      const { vendors: newVendors, pagination: newPagination } = response.data.data;
      
      setVendors(prev => [...prev, ...(newVendors || [])]);
      setPagination(newPagination || {});
      
      return response.data;
    } catch (err) {
      console.error('Load more vendors error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loading, pagination.page, pagination.pages]);

  const clearSearch = useCallback(() => {
    setVendors([]);
    setError(null);
    setPagination({
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    });
    setSearchLocation(null);
  }, []);

  const getUserLocation = useCallback(() => {
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
          let errorMessage = 'Unable to retrieve your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }, []);

  const searchNearbyVendors = useCallback(async (radius = 3000, itemFilters = {}) => {
    try {
      // Get user's current location
      const location = await getUserLocation();
      
      const searchParams = {
        lng: location.longitude,
        lat: location.latitude,
        radius,
        ...itemFilters
      };
      
      return await searchVendors(searchParams);
    } catch (err) {
      console.error('Search nearby vendors error:', err);
      throw err;
    }
  }, [getUserLocation, searchVendors]);

  return {
    vendors,
    loading,
    error,
    pagination,
    searchLocation,
    searchVendors,
    loadMoreVendors,
    clearSearch,
    getUserLocation,
    searchNearbyVendors
  };
};
