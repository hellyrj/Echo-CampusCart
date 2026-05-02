import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { MapPin, Navigation, Store, Star } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom vendor marker icon
const createVendorIcon = (rating = 0) => {
  const color = rating >= 4 ? 'green' : rating >= 3 ? 'orange' : 'red';
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    ">
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 7a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm1 4a1 1 0 100 2h2a1 1 0 100-2H9z"/>
      </svg>
    </div>`,
    className: 'custom-vendor-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

// User location marker icon
const createUserIcon = () => {
  return L.divIcon({
    html: `<div style="
      background-color: #3B82F6;
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
};

const VendorMap = ({ 
  vendors = [],
  userLocation = null,
  onVendorSelect,
  height = '400px',
  center = null,
  zoom = 13,
  showUserLocation = true
}) => {
  const [mapCenter, setMapCenter] = useState(center || { lat: 9.0092, lng: 38.7578 });
  const [map, setMap] = useState(null);
  const mapRef = useRef();

  // Component to handle map events
  const MapEventHandler = () => {
    useMapEvents({
      click: (e) => {
        // Handle map clicks if needed
      },
    });
    return null;
  };

  // Update map center when center prop changes
  useEffect(() => {
    if (center) {
      setMapCenter(center);
      if (map) {
        map.setView([center.lat, center.lng], zoom);
      }
    }
  }, [center, zoom, map]);

  // Fit map to show all vendors
  useEffect(() => {
    if (vendors.length > 0 && map) {
      const bounds = L.latLngBounds(
        vendors.map(vendor => [vendor.location?.coordinates[1], vendor.location?.coordinates[0]])
      );
      
      if (userLocation) {
        bounds.extend([userLocation.lat, userLocation.lng]);
      }
      
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [vendors, userLocation, map]);

  // Initialize map
  useEffect(() => {
    if (mapRef.current) {
      const leafletMap = mapRef.current;
      setMap(leafletMap);
    }
  }, []);

  const formatDistance = (distance) => {
    if (!distance) return '';
    if (distance < 1000) return `${Math.round(distance)}m`;
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(price || 0);
  };

  return (
    <div className="relative border border-gray-300 rounded-lg overflow-hidden" style={{ height }}>
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventHandler />

        {/* User Location Marker */}
        {showUserLocation && userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
            <Popup>
              <div className="text-sm">
                <div className="flex items-center gap-2 font-medium text-blue-600">
                  <Navigation className="w-4 h-4" />
                  Your Location
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Vendor Markers */}
        {vendors.map((vendor) => {
          if (!vendor.location?.coordinates) return null;
          
          return (
            <Marker
              key={vendor._id}
              position={[vendor.location.coordinates[1], vendor.location.coordinates[0]]}
              icon={createVendorIcon(vendor.rating)}
              eventHandlers={{
                click: () => onVendorSelect?.(vendor)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{vendor.storeName}</h3>
                    <div className="flex items-center bg-yellow-50 px-1 py-0.5 rounded">
                      <Star className="w-3 h-3 text-yellow-500 mr-1" />
                      <span className="text-xs font-medium text-yellow-700">
                        {vendor.rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {vendor.locationDetails?.placeName || vendor.locationDetails?.city}
                    </div>
                    
                    {vendor.distance && (
                      <div className="text-blue-600 font-medium">
                        {formatDistance(vendor.distance)} away
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      {vendor.matchingProductCount || vendor.productCount || 0} items
                    </div>
                    
                    {vendor.avgProductPrice && (
                      <div>
                        Avg price: {formatPrice(vendor.avgProductPrice)}
                      </div>
                    )}
                  </div>

                  {vendor.matchingProducts && vendor.matchingProducts.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="text-xs font-medium text-gray-700 mb-1">Matching items:</div>
                      <div className="space-y-1">
                        {vendor.matchingProducts.slice(0, 2).map((product) => (
                          <div key={product._id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 truncate">{product.name}</span>
                            <span className="text-gray-900 font-medium">
                              {formatPrice(product.basePrice)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                    {vendor.deliveryAvailable && (
                      <div className="flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                        Delivery
                      </div>
                    )}
                    {vendor.pickupAvailable && (
                      <div className="flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        Pickup
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
        <div className="text-xs font-medium text-gray-700 mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
            <span>High Rating (4+)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-orange-500 rounded-full border border-white"></div>
            <span>Good Rating (3-4)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
            <span>Low Rating (&lt;3)</span>
          </div>
          {showUserLocation && userLocation && (
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
              <span>Your Location</span>
            </div>
          )}
        </div>
      </div>

      {/* Vendor Count */}
      {vendors.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 z-10">
          <div className="text-xs font-medium text-gray-700">
            {vendors.length} vendors found
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorMap;
