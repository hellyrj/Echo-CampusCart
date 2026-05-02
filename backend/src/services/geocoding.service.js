import axios from 'axios';

class GeocodingService {
    constructor() {
        // Using OpenStreetMap Nominatim API (free, no API key required)
        this.baseUrl = 'https://nominatim.openstreetmap.org/search';
        this.reverseUrl = 'https://nominatim.openstreetmap.org/reverse';
    }

    /**
     * Convert place name/address to coordinates
     * @param {string} query - Place name or address
     * @param {string} country - Country code (default: 'ET' for Ethiopia)
     * @returns {Promise<Object>} Location details with coordinates
     */
    async geocode(query, country = 'ET') {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    q: query,
                    format: 'json',
                    addressdetails: 1,
                    countrycodes: country,
                    limit: 1,
                    'accept-language': 'en'
                },
                headers: {
                    'User-Agent': 'CampusCart Vendor Registration'
                }
            });

            if (response.data && response.data.length > 0) {
                const result = response.data[0];
                return {
                    success: true,
                    data: {
                        placeName: result.display_name.split(',')[0].trim(),
                        fullAddress: result.display_name,
                        coordinates: [parseFloat(result.lon), parseFloat(result.lat)],
                        landmark: result.address?.building || result.address?.amenity || null,
                        area: result.address?.suburb || result.address?.district || null,
                        city: result.address?.city || result.address?.town || result.address?.village || 'Unknown',
                        state: result.address?.state || 'Unknown',
                        postalCode: result.address?.postcode || null,
                        country: result.address?.country || 'Nigeria'
                    }
                };
            }

            return {
                success: false,
                message: 'Location not found'
            };
        } catch (error) {
            console.error('Geocoding error:', error);
            return {
                success: false,
                message: 'Failed to geocode location'
            };
        }
    }

    /**
     * Get place suggestions for autocomplete
     * @param {string} query - Partial place name
     * @param {string} country - Country code (default: 'ET' for Ethiopia)
     * @returns {Promise<Array>} Array of place suggestions
     */
    async getSuggestions(query, country = 'ET') {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    q: query,
                    format: 'json',
                    addressdetails: 1,
                    countrycodes: country,
                    limit: 5,
                    'accept-language': 'en'
                },
                headers: {
                    'User-Agent': 'CampusCart Vendor Registration'
                }
            });

            if (response.data && response.data.length > 0) {
                return response.data.map(result => ({
                    placeName: result.display_name.split(',')[0].trim(),
                    fullAddress: result.display_name,
                    coordinates: [parseFloat(result.lon), parseFloat(result.lat)],
                    city: result.address?.city || result.address?.town || result.address?.village || 'Unknown',
                    state: result.address?.state || 'Unknown',
                    area: result.address?.suburb || result.address?.district || null
                }));
            }

            return [];
        } catch (error) {
            console.error('Suggestions error:', error);
            return [];
        }
    }

    /**
     * Reverse geocode coordinates to get place details
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise<Object>} Place details
     */
    async reverseGeocode(lat, lon) {
        try {
            const response = await axios.get(this.reverseUrl, {
                params: {
                    lat,
                    lon,
                    format: 'json',
                    addressdetails: 1,
                    'accept-language': 'en'
                },
                headers: {
                    'User-Agent': 'CampusCart Vendor Registration'
                }
            });

            if (response.data) {
                const result = response.data;
                return {
                    success: true,
                    data: {
                        placeName: result.display_name.split(',')[0].trim(),
                        fullAddress: result.display_name,
                        coordinates: [lon, lat],
                        landmark: result.address?.building || result.address?.amenity || null,
                        area: result.address?.suburb || result.address?.district || null,
                        city: result.address?.city || result.address?.town || result.address?.village || 'Unknown',
                        state: result.address?.state || 'Unknown',
                        postalCode: result.address?.postcode || null,
                        country: result.address?.address?.country || 'Nigeria'
                    }
                };
            }

            return {
                success: false,
                message: 'Location not found'
            };
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return {
                success: false,
                message: 'Failed to reverse geocode location'
            };
        }
    }

    /**
     * Calculate distance between two points in meters
     * @param {number} lat1 - Latitude of first point
     * @param {number} lon1 - Longitude of first point
     * @param {number} lat2 - Latitude of second point
     * @param {number} lon2 - Longitude of second point
     * @returns {number} Distance in meters
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
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
    }

    /**
     * Find vendors within a certain radius of a point
     * @param {number} userLat - User's latitude
     * @param {number} userLon - User's longitude
     * @param {number} radius - Search radius in meters
     * @param {Array} vendors - Array of vendors with location coordinates
     * @returns {Array} Vendors within the specified radius
     */
    findVendorsNearby(userLat, userLon, radius, vendors) {
        return vendors.filter(vendor => {
            if (!vendor.location || !vendor.location.coordinates) {
                return false;
            }
            
            const [vendorLon, vendorLat] = vendor.location.coordinates;
            const distance = this.calculateDistance(userLat, userLon, vendorLat, vendorLon);
            
            return distance <= radius;
        }).map(vendor => {
            const [vendorLon, vendorLat] = vendor.location.coordinates;
            const distance = this.calculateDistance(userLat, userLon, vendorLat, vendorLon);
            
            return {
                ...vendor,
                distance: Math.round(distance), // Distance in meters
                distanceText: this.formatDistance(distance)
            };
        }).sort((a, b) => a.distance - b.distance);
    }

    /**
     * Format distance for display
     * @param {number} distance - Distance in meters
     * @returns {string} Formatted distance string
     */
    formatDistance(distance) {
        if (distance < 1000) {
            return `${Math.round(distance)}m`;
        } else {
            return `${(distance / 1000).toFixed(1)}km`;
        }
    }
}

export default new GeocodingService();
