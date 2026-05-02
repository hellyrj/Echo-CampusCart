import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Filter, Star, Package, Clock, Navigation, X, ChevronDown, Map as MapIcon } from 'lucide-react';
import { useVendorSearch } from '../hooks/useVendorSearch';
import { vendorApi } from '../api/vendor.api';
import VendorMap from '../components/VendorMap';

const VendorSearch = () => {
  const navigate = useNavigate();
  const {
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
  } = useVendorSearch();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    searchItem: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'distance',
    radius: 3000
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await vendorApi.getCategories();
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await performSearch();
  };

  const performSearch = async (useCurrentLocation = false) => {
    try {
      const searchParams = {
        ...filters,
        searchItem: searchQuery || filters.searchItem
      };

      if (useCurrentLocation && searchLocation) {
        searchParams.lng = searchLocation.longitude;
        searchParams.lat = searchLocation.latitude;
        searchParams.radius = filters.radius;
      }

      await searchVendors(searchParams);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleUseMyLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    
    try {
      const location = await getUserLocation();
      setSearchLocation(location);
      
      // Search with user's location
      await searchNearbyVendors(filters.radius, {
        searchItem: searchQuery || filters.searchItem,
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sortBy: filters.sortBy
      });
    } catch (err) {
      setLocationError(err.message);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchItem: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'distance',
      radius: 3000
    });
    setSearchQuery('');
    clearSearch();
  };

  const handleLoadMore = async () => {
    const searchParams = {
      ...filters,
      searchItem: searchQuery || filters.searchItem
    };

    if (searchLocation) {
      searchParams.lng = searchLocation.longitude;
      searchParams.lat = searchLocation.latitude;
      searchParams.radius = filters.radius;
    }

    await loadMoreVendors(searchParams);
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Find Vendors</h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for vendors or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={handleUseMyLocation}
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
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                showMap ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              } hover:bg-opacity-80`}
            >
              <MapIcon className="w-5 h-5" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchLocation && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
              <MapPin className="w-4 h-4" />
              Using your location • {formatDistance(searchLocation.radius)} radius
            </div>
          )}

          {locationError && (
            <div className="mt-3 text-sm text-red-600">
              {locationError}
            </div>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  placeholder="1000"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="distance">Distance</option>
                  <option value="rating">Rating</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="products">Most Products</option>
                  <option value="name">Name</option>
                </select>
              </div>

              {searchLocation && (
                <div className="md:col-span-2 lg:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Radius: {formatDistance(filters.radius)}
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="500"
                    value={filters.radius}
                    onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading && vendors.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : vendors.length > 0 ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                Found {pagination.total} vendors
                {searchLocation && ` within ${formatDistance(filters.radius)}`}
              </p>
            </div>

            {/* Map View */}
            {showMap && (
              <div className="mb-6">
                <VendorMap
                  vendors={vendors}
                  userLocation={searchLocation}
                  onVendorSelect={(vendor) => navigate(`/vendors/${vendor._id}`)}
                  height="400px"
                  center={searchLocation}
                  zoom={13}
                  showUserLocation={true}
                />
              </div>
            )}

            <div className={`grid gap-6 ${showMap ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {vendors.map((vendor) => (
                <div
                  key={vendor._id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/vendors/${vendor._id}`)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {vendor.storeName}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {vendor.locationDetails?.placeName || vendor.locationDetails?.city}
                        </div>
                        {vendor.distance && (
                          <div className="text-sm text-blue-600 mt-1">
                            {formatDistance(vendor.distance)} away
                          </div>
                        )}
                      </div>
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium text-yellow-700">
                          {vendor.rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {vendor.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-1" />
                        {vendor.matchingProductCount || vendor.productCount || 0} items
                      </div>
                      {vendor.avgProductPrice && (
                        <div className="flex items-center">
                          Avg: {formatPrice(vendor.avgProductPrice)}
                        </div>
                      )}
                    </div>

                    {vendor.matchingProducts && vendor.matchingProducts.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Matching items:</p>
                        <div className="space-y-2">
                          {vendor.matchingProducts.map((product) => (
                            <div key={product._id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700 truncate">{product.name}</span>
                              <span className="text-gray-900 font-medium">
                                {formatPrice(product.basePrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-4 border-t">
                      {vendor.deliveryAvailable && (
                        <div className="flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                          <Clock className="w-3 h-3 mr-1" />
                          Delivery
                        </div>
                      )}
                      {vendor.pickupAvailable && (
                        <div className="flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          <Package className="w-3 h-3 mr-1" />
                          Pickup
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.page < pagination.pages && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More Vendors'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or location settings
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorSearch;
