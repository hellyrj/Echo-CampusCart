import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Search, MapPin, Navigation, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom selected location marker
const selectedIcon = L.divIcon({
  html: `<div style="
    background-color: #3B82F6;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="
      background-color: white;
      width: 8px;
      height: 8px;
      border-radius: 50%;
    "></div>
  </div>`,
  className: 'custom-selected-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

// User location marker
const userIcon = L.divIcon({
  html: `<div style="
    background-color: #10B981;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  "></div>`,
  className: 'custom-user-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});

const LocationPicker = ({ 
  initialLocation = { lat: 9.0092, lng: 38.7578 }, // Addis Ababa default
  onLocationSelect,
  height = '400px',
  showSearch = true,
  placeholder = 'Search for a place...'
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [mapCenter, setMapCenter] = useState(initialLocation);
  const [map, setMap] = useState(null);
  const mapRef = useRef();
  const searchTimeoutRef = useRef();

  // Get place name from coordinates (reverse geocoding)
  const getPlaceNameFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'EchoCampusCart/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }
      
      const data = await response.json();
      console.log('Reverse geocoding result:', data);
      
      if (data && data.display_name) {
        return data.display_name;
      }
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };

  // Component to handle map clicks
  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        console.log('Map clicked at:', { lat, lng });
        
        const location = { lat, lng };
        setSelectedLocation(location);
        
        // Get place name from coordinates
        const placeName = await getPlaceNameFromCoordinates(lat, lng);
        
        if (placeName) {
          setSearchQuery(placeName);
          console.log('Place name from coordinates:', placeName);
        }
        
        onLocationSelect?.({ lat, lng, placeName });
      },
    });
    return null;
  };

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setLocationLoading(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        
        console.log('User location obtained:', location);
        setUserLocation(location);
        setMapCenter(location);
        setSelectedLocation(location);
        
        // Get place name from user's coordinates
        const placeName = await getPlaceNameFromCoordinates(latitude, longitude);
        
        if (placeName) {
          setSearchQuery(placeName);
          console.log('User location place name:', placeName);
          onLocationSelect?.({ ...location, placeName });
        } else {
          onLocationSelect?.(location);
        }
        
        // Center map on user location
        if (map) {
          map.setView([latitude, longitude], 15);
        }
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        let message = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied. Please enable location services in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        setLocationError(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Search for places using Nominatim
  const searchPlaces = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=et&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'EchoCampusCart/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      
      const results = data.map(item => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        importance: item.importance || 0,
        address: item.address || {}
      }));
      
      setSearchResults(results);
      console.log('Search results:', results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search input with debouncing
  let searchTimeout;
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debouncing
    searchTimeout = setTimeout(() => {
      searchPlaces(query);
    }, 500);
  };

  // Handle Enter key press in search box
  const handleSearchKeyPress = async (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      setSearchLoading(true);
      
      try {
        // Search for the exact place
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=et&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'EchoCampusCart/1.0'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Search failed');
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          const place = data[0];
          const location = { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
          
          console.log('Place found by Enter:', place);
          
          setSelectedLocation(location);
          setMapCenter(location);
          setSearchResults([]);
          onLocationSelect?.({ ...location, placeName: place.display_name });
          
          // Center map on the found place
          if (map) {
            map.setView([location.lat, location.lng], 16);
          }
        } else {
          console.log('No place found for:', searchQuery);
        }
      } catch (error) {
        console.error('Error searching place:', error);
      } finally {
        setSearchLoading(false);
      }
    }
  };

  // Select a place from search results
  const selectPlace = (place) => {
    const location = { lat: place.lat, lng: place.lng };
    console.log('Place selected:', place);
    
    setSelectedLocation(location);
    setMapCenter(location);
    setSearchQuery(place.display_name);
    setSearchResults([]);
    onLocationSelect?.({ ...location, placeName: place.display_name });
    
    // Center map on selected place
    if (map) {
      map.setView([place.lat, place.lng], 16);
    }
  };

  // Initialize map
  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={getUserLocation}
              disabled={locationLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50"
            >
              {locationLoading ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Navigation className="w-5 h-5" />
              )}
              Use My Location
            </button>
          </div>

          {/* Location Error Message */}
          {locationError && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {locationError}
            </div>
          )}

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((place, index) => (
                <button
                  key={index}
                  onClick={() => selectPlace(place)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {place.display_name}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchLoading && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
              <div className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-sm text-gray-600">Searching...</span>
            </div>
          )}
        </div>
      )}

      {/* Map Container */}
      <div className="relative border border-gray-300 rounded-lg overflow-hidden" style={{ height }}>
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          whenReady={(mapInstance) => {
            setMap(mapInstance.target);
            console.log('Map created successfully');
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler />
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={selectedIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Selected Location</strong><br />
                Lat: {selectedLocation.lat.toFixed(6)}<br />
                Lng: {selectedLocation.lng.toFixed(6)}
              </div>
            </Popup>
          </Marker>
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>
                <div className="text-sm">
                  <strong>Your Location</strong><br />
                  Lat: {userLocation.lat.toFixed(6)}<br />
                  Lng: {userLocation.lng.toFixed(6)}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Selected Location Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm text-blue-800">
          <MapPin className="w-4 h-4" />
          <span>
            Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
