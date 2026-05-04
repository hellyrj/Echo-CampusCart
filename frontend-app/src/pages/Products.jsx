import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProductApi } from '../hooks/useProductApi';
import { useServiceApi } from '../hooks/useServiceApi';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { Heart, ShoppingCart, Filter, MapPin, Navigation, X, ChevronLeft, ChevronRight, Wrench, Package, Store } from 'lucide-react';
import axiosInstance from '../api/axios';
import { vendorApi } from '../api/vendor.api';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // Store all products for client-side filtering
    const [allServices, setAllServices] = useState([]); // Store all services for client-side filtering
    const [categories, setCategories] = useState([]);
    const [serviceCategories, setServiceCategories] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [contentType, setContentType] = useState('all'); // 'all', 'products', 'services'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTimeout, setSearchTimeout] = useState(null);
    
    // New state for enhanced filtering
    const [sidebarOpen, setSidebarOpen] = useState(true); // Changed to true by default for desktop
    const [isFilterVisible, setIsFilterVisible] = useState(true); // New state for filter visibility
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [searchRadius, setSearchRadius] = useState(3000);
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [locationSearchQuery, setLocationSearchQuery] = useState('');
    const [locationSearchResults, setLocationSearchResults] = useState([]);
    const [locationSearchLoading, setLocationSearchLoading] = useState(false);
    const [locationSearchTimeout, setLocationSearchTimeout] = useState(null);
    const [productImageIndexes, setProductImageIndexes] = useState({});
    
    const { getProducts, searchProducts, loading: productLoading } = useProductApi();
    const { getAllServices, searchServices, getServiceCategories, loading: serviceLoading } = useServiceApi();
    const { isAuthenticated, user } = useAuth();
    const { toggleWishlistItem, isProductInWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleVendorApplication = () => {
        navigate('/vendor/apply');
    };

    // Toggle filter sidebar
    const toggleFilterSidebar = () => {
        setIsFilterVisible(!isFilterVisible);
    };

    // Debounced search function
    const debouncedSearch = useCallback((value) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        const timeout = setTimeout(() => {
            setSearchTerm(value);
        }, 500); // Increased to 500ms delay for better performance
        
        setSearchTimeout(timeout);
    }, [searchTimeout]);

    useEffect(() => {
        loadProducts();
        loadServices();
        loadCategories();
        loadServiceCategories();
        loadUniversities();
        loadVendors();
    }, []);

    // Trigger client-side filtering when any filter changes
    useEffect(() => {
        applyClientSideFilters();
    }, [searchTerm, selectedCategory, selectedUniversity, selectedVendors, priceRange, locationEnabled, userLocation, allProducts]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    const loadCategories = async () => {
        try {
            console.log('Loading categories from API...');
            // Fetch categories from API instead of hardcoded
            const response = await axiosInstance.get('/vendors/categories');
            console.log('Categories API response:', response.data);
            if (response.data.success) {
                const categoriesData = response.data.data || [];
                console.log('Categories loaded:', categoriesData);
                console.log('Categories length:', categoriesData.length);
                setCategories(categoriesData);
            } else {
                console.error('Failed to load categories:', response.data.message);
                setCategories([]);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            // Fallback to hardcoded categories if API fails
            const fallbackCategories = [
                "Stationery",
                "Food & Drinks", 
                "Printing Services",
                "Electronics",
                "Dorm Supplies",
                "Books"
            ];
            console.log('Using fallback categories:', fallbackCategories);
            setCategories(fallbackCategories);
        }
    };

    const loadUniversities = async () => {
        try {
            const response = await axiosInstance.get('/vendors/universities');
            console.log('Universities API response:', response.data); // Debug log
            if (response.data.success) {
                console.log('Universities data:', response.data.data); // Debug log
                setUniversities(response.data.data || []);
            } else {
                console.error('Failed to load universities:', response.data.message);
                setUniversities([]);
            }
        } catch (error) {
            console.error('Error loading universities:', error);
            setUniversities([]);
        }
    };

    const handleAddToCart = async (product) => {
        if (!isAuthenticated) {
            alert('Please login to add items to cart');
            return;
        }
        try {
            await addToCart(product._id, 1);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add to cart');
        }
    };

    const handleWishlistToggle = async (product) => {
        if (!isAuthenticated) {
            alert('Please login to add items to wishlist');
            return;
        }

        try {
            await toggleWishlistItem(product._id);
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        }
    };

    // Load vendors for filtering
    const loadVendors = async () => {
        try {
            const response = await vendorApi.getApprovedVendors();
            if (response.data.success) {
                setVendors(response.data.data || []);
            }
        } catch (error) {
            console.error('Error loading vendors:', error);
        }
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
            (position) => {
                const { latitude, longitude } = position.coords;
                const location = { lat: latitude, lng: longitude };
                
                console.log('User location obtained:', location);
                setUserLocation(location);
                setLocationEnabled(true);
                setLocationLoading(false);
                
                // Load nearby vendors
                loadNearbyVendors(location);
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

    // Load nearby vendors based on user location
    const loadNearbyVendors = async (location) => {
        try {
            const response = await vendorApi.searchVendors({
                lng: location.lng,
                lat: location.lat,
                radius: searchRadius
            });
            
            if (response.data.success) {
                const nearbyVendors = response.data.data.vendors || [];
                setVendors(nearbyVendors);
                console.log('Nearby vendors loaded:', nearbyVendors.length);
            }
        } catch (error) {
            console.error('Error loading nearby vendors:', error);
        }
    };

    // Toggle location-based filtering
    const toggleLocationFilter = () => {
        if (locationEnabled) {
            setLocationEnabled(false);
            setUserLocation(null);
            loadVendors(); // Load all vendors again
        } else {
            getUserLocation();
        }
    };

    // Handle vendor selection
    const handleVendorToggle = (vendorId) => {
        setSelectedVendors(prev => 
            prev.includes(vendorId) 
                ? prev.filter(id => id !== vendorId)
                : [...prev, vendorId]
        );
    };

    // Handle price range change
    const handlePriceRangeChange = (type, value) => {
        setPriceRange(prev => ({
            ...prev,
            [type]: value
        }));
    };

    // Search for locations using Nominatim
    const searchLocations = async (query) => {
        if (!query.trim() || query.length < 2) {
            setLocationSearchResults([]);
            return;
        }

        setLocationSearchLoading(true);
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
            
            setLocationSearchResults(results);
        } catch (error) {
            console.error('Location search error:', error);
            setLocationSearchResults([]);
        } finally {
            setLocationSearchLoading(false);
        }
    };

    // Handle location search input with debouncing
    const handleLocationSearchChange = (e) => {
        const query = e.target.value;
        setLocationSearchQuery(query);
        
        // Clear previous timeout
        if (locationSearchTimeout) {
            clearTimeout(locationSearchTimeout);
        }
        
        // Set new timeout for debouncing
        const timeoutId = setTimeout(() => {
            searchLocations(query);
        }, 500);
        setLocationSearchTimeout(timeoutId);
    };

    // Select a location from search results
    const selectLocation = (place) => {
        const location = { lat: place.lat, lng: place.lng };
        console.log('Location selected:', place);
        
        setUserLocation(location);
        setLocationEnabled(true);
        setLocationSearchQuery(place.display_name);
        setLocationSearchResults([]);
        setLocationError('');
        
        // Load nearby vendors for this location
        loadNearbyVendors(location);
    };

    // Helper function to get image URL
    const getImageUrl = (image) => {
        if (!image) return 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image';
        
        if (image.url) return image.url;
        if (image.startsWith('http')) return image;
        if (image.startsWith('/')) return `http://localhost:5000${image}`;
        return `http://localhost:5000/uploads/${image}`;
    };

    // Carousel navigation functions
    const nextImage = (productId, totalImages) => {
        setProductImageIndexes(prev => ({
            ...prev,
            [productId]: (prev[productId] || 0) >= totalImages - 1 ? 0 : (prev[productId] || 0) + 1
        }));
    };

    const prevImage = (productId, totalImages) => {
        setProductImageIndexes(prev => ({
            ...prev,
            [productId]: (prev[productId] || 0) <= 0 ? totalImages - 1 : (prev[productId] || 0) - 1
        }));
    };

    const goToImage = (productId, imageIndex) => {
        setProductImageIndexes(prev => ({
            ...prev,
            [productId]: imageIndex
        }));
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedUniversity('');
        setSelectedVendors([]);
        setPriceRange({ min: '', max: '' });
        setLocationEnabled(false);
        setUserLocation(null);
        setLocationSearchQuery('');
        setLocationSearchResults([]);
        setLocationError('');
        loadVendors();
    };

    const loadProducts = async () => {
        try {
            setError(null);
            console.log('Loading all products...');
            const result = await getProducts();
            console.log('API Response:', result);
            if (result.success) {
                const productsData = result.data?.data || result.data || [];
                console.log('Products data:', productsData);
                console.log('First product structure:', productsData[0]);
                console.log('First product vendorId:', productsData[0]?.vendorId);
                console.log('First product vendorId universityNear:', productsData[0]?.vendorId?.universityNear);
                console.log('First product categories:', productsData[0]?.categories);
                console.log('First product category:', productsData[0]?.category);
                
                // Store all products for client-side filtering
                setAllProducts(Array.isArray(productsData) ? productsData : []);
                setProducts(Array.isArray(productsData) ? productsData : []);
            } else {
                console.error('Failed to load products:', result.message);
                setError(result.message || 'Failed to load products');
                setAllProducts([]);
                setProducts([]);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            if (error.response) {
                console.error('Error response:', error.response.status, error.response.data);
                if (error.response.status === 401) {
                    setError('Authentication required. The backend may require authentication for this endpoint.');
                } else if (error.response.status === 404) {
                    setError('Products endpoint not found. Is the backend running?');
                } else {
                    setError(error.response.data?.message || `Server error: ${error.response.status}`);
                }
            } else if (error.request) {
                console.error('Error request:', error.request);
                setError('Network error. Cannot connect to backend server. Is it running on http://localhost:5000?');
            } else {
                console.error('General error:', error.message);
                setError(error.message || 'Failed to load products');
            }
            setAllProducts([]);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const loadServices = async () => {
        try {
            console.log('Loading all services...');
            const result = await getAllServices();
            console.log('Services API Response:', result);
            if (result.success) {
                const servicesData = result.data?.services || result.data || [];
                console.log('Services data:', servicesData);
                
                // Store all services for client-side filtering
                setAllServices(Array.isArray(servicesData) ? servicesData : []);
                setServices(Array.isArray(servicesData) ? servicesData : []);
            } else {
                console.error('Failed to load services:', result.message);
                // Don't set error for services failing, just log it
                setAllServices([]);
                setServices([]);
            }
        } catch (error) {
            console.error('Error loading services:', error);
            // Don't set error for services failing, just log it
            setAllServices([]);
            setServices([]);
        }
    };

    const loadServiceCategories = async () => {
        try {
            console.log('Loading service categories...');
            const result = await getServiceCategories();
            console.log('Service categories API Response:', result);
            if (result.success) {
                const categoriesData = result.data || [];
                console.log('Service categories loaded:', categoriesData);
                setServiceCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } else {
                console.error('Failed to load service categories:', result.message);
                setServiceCategories([]);
            }
        } catch (error) {
            console.error('Error loading service categories:', error);
            setServiceCategories([]);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedUniversity('');
        debouncedSearch('');
    };

    const applyClientSideFilters = () => {
        console.log('Applying client-side filters:', {
            searchTerm: searchTerm,
            selectedCategory,
            selectedUniversity,
            selectedVendors,
            priceRange,
            locationEnabled,
            totalProducts: allProducts.length
        });
        
        let filteredProducts = [...allProducts];
        
        // If no filters, show all products
        if (!searchTerm.trim() && !selectedCategory && !selectedUniversity && 
            selectedVendors.length === 0 && !priceRange.min && !priceRange.max && !locationEnabled) {
            console.log('No filters applied, showing all products');
            setProducts(filteredProducts);
            return;
        }
        
        // Filter by search term
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            const beforeSearch = filteredProducts.length;
            filteredProducts = filteredProducts.filter(product => {
                // Search in product name and description
                const nameMatch = product.name && product.name.toLowerCase().includes(searchLower);
                const descriptionMatch = product.description && product.description.toLowerCase().includes(searchLower);
                
                // Also search in vendor information if available
                let vendorMatch = false;
                if (product.vendorId) {
                    const vendorNameMatch = product.vendorId.storeName && product.vendorId.storeName.toLowerCase().includes(searchLower);
                    const vendorDescMatch = product.vendorId.description && product.vendorId.description.toLowerCase().includes(searchLower);
                    vendorMatch = vendorNameMatch || vendorDescMatch;
                }
                
                return nameMatch || descriptionMatch || vendorMatch;
            });
            console.log(`Search filter: "${searchTerm}" - ${beforeSearch} → ${filteredProducts.length} products`);
        }
        
        // Filter by category
        if (selectedCategory) {
            const beforeCategory = filteredProducts.length;
            filteredProducts = filteredProducts.filter(product => {
                // Handle different category structures
                if (Array.isArray(product.categories)) {
                    return product.categories.some(cat => 
                        (typeof cat === 'string' ? cat : cat.name) === selectedCategory
                    );
                } else if (product.category) {
                    return product.category === selectedCategory;
                }
                return false;
            });
            console.log(`Category filter: "${selectedCategory}" - ${beforeCategory} → ${filteredProducts.length} products`);
        }
        
        // Filter by university
        if (selectedUniversity) {
            const beforeUniversity = filteredProducts.length;
            filteredProducts = filteredProducts.filter(product => {
                // Check if product has vendor with universityNear
                if (product.vendorId && product.vendorId.universityNear) {
                    console.log(`Checking university: ${product.vendorId.universityNear} === ${selectedUniversity}`);
                    return product.vendorId.universityNear === selectedUniversity;
                }
                // Also check if vendorId is just a string (not populated)
                else if (typeof product.vendorId === 'string') {
                    console.log('Product vendorId is not populated, skipping university filter for this product');
                    return false; // Can't filter if vendor not populated
                }
                console.log('Product has no vendorId or universityNear field');
                return false;
            });
            console.log(`University filter: "${selectedUniversity}" - ${beforeUniversity} → ${filteredProducts.length} products`);
        }
        
        // Filter by selected vendors
        if (selectedVendors.length > 0) {
            const beforeVendors = filteredProducts.length;
            filteredProducts = filteredProducts.filter(product => {
                if (product.vendorId && product.vendorId._id) {
                    return selectedVendors.includes(product.vendorId._id.toString());
                }
                return false;
            });
            console.log(`Vendor filter: ${selectedVendors.length} vendors - ${beforeVendors} → ${filteredProducts.length} products`);
        }
        
        // Filter by price range
        if (priceRange.min || priceRange.max) {
            const beforePrice = filteredProducts.length;
            filteredProducts = filteredProducts.filter(product => {
                // Handle different price field names
                const price = parseFloat(product.basePrice || product.price || 0);
                const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
                const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
                
                // Debug logging
                console.log(`Price check - Product: ${product.name}, Price: ${price}, Min: ${minPrice}, Max: ${maxPrice}`);
                
                return price >= minPrice && price <= maxPrice;
            });
            console.log(`Price filter: ${priceRange.min} - ${priceRange.max} - ${beforePrice} → ${filteredProducts.length} products`);
        }
        
        // Filter by location (if enabled, only show products from nearby vendors)
        if (locationEnabled && userLocation) {
            const beforeLocation = filteredProducts.length;
            filteredProducts = filteredProducts.filter(product => {
                if (product.vendorId && product.vendorId.location) {
                    // Simple distance check (you could implement more sophisticated distance calculation)
                    return true; // For now, assume all vendors in the vendors list are nearby
                }
                return false;
            });
            console.log(`Location filter: enabled - ${beforeLocation} → ${filteredProducts.length} products`);
        }
        
        console.log('Final filtered products:', filteredProducts.length);
        setProducts(filteredProducts);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEFAE0' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#606C38' }}></div>
                    <p style={{ color: '#283618' }}>Loading products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEFAE0' }}>
                <div className="text-center">
                    <div className="text-red-600 text-lg mb-4">Error: {error}</div>
                    <button 
                        onClick={loadProducts}
                        className="px-6 py-2 rounded-md transition-all duration-200 hover:scale-105"
                        style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#FEFAE0' }}>
            {/* Header with Search Bar */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold" style={{ color: '#283618' }}>Products</h1>
                        </div>
                        
                        {/* Search Bar with Filter Icon */}
                        <div className="relative mt-4">
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search products, vendors, or descriptions..."
                                        value={searchTerm}
                                        onChange={(e) => debouncedSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                                        style={{ focusRingColor: '#606C38', borderColor: '#DDA15E' }}
                                    />
                                    <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                
                                {/* Filter Toggle Button */}
                                <button
                                    onClick={toggleFilterSidebar}
                                    className={`px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
                                        isFilterVisible ? 'text-white' : 'text-gray-700'
                                    }`}
                                    style={{ 
                                        backgroundColor: isFilterVisible ? '#606C38' : '#DDA15E20',
                                        color: isFilterVisible ? '#FEFAE0' : '#283618'
                                    }}
                                    title={isFilterVisible ? "Hide Filters" : "Show Filters"}
                                >
                                    <Filter className="w-5 h-5" />
                                    <span className="hidden sm:inline">Filters</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Content Type Selector */}
                    <div className="flex items-center space-x-2 mt-6">
                        <button
                            onClick={() => setContentType('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                                contentType === 'all' 
                                    ? 'text-white' 
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            style={{ 
                                backgroundColor: contentType === 'all' ? '#606C38' : '#FEFAE0',
                                color: contentType === 'all' ? '#FEFAE0' : '#283618'
                            }}
                        >
                            <Package className="w-4 h-4 inline mr-2" />
                            All
                        </button>
                        <button
                            onClick={() => setContentType('products')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                                contentType === 'products' 
                                    ? 'text-white' 
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            style={{ 
                                backgroundColor: contentType === 'products' ? '#606C38' : '#FEFAE0',
                                color: contentType === 'products' ? '#FEFAE0' : '#283618'
                            }}
                        >
                            <Package className="w-4 h-4 inline mr-2" />
                            Products
                        </button>
                        <button
                            onClick={() => setContentType('services')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                                contentType === 'services' 
                                    ? 'text-white' 
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            style={{ 
                                backgroundColor: contentType === 'services' ? '#606C38' : '#FEFAE0',
                                color: contentType === 'services' ? '#FEFAE0' : '#283618'
                            }}
                        >
                            <Wrench className="w-4 h-4 inline mr-2" />
                            Services
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-6">
                    {/* Sidebar Filters - Toggle based on isFilterVisible */}
                    {isFilterVisible && (
                        <div className="w-80 flex-shrink-0 transition-all duration-300 ease-in-out">
                            <div className="rounded-lg shadow-md p-6 sticky top-6" style={{ backgroundColor: '#FEFAE0' }}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold" style={{ color: '#283618' }}>Filters</h2>
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-sm hover:opacity-70"
                                        style={{ color: '#606C38' }}
                                    >
                                        Clear All
                                    </button>
                                </div>

                                {/* Location Filter */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium mb-3 flex items-center" style={{ color: '#283618' }}>
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Location-Based
                                    </h3>
                                    
                                    {/* Location Search Input */}
                                    <div className="relative mb-3">
                                        <input
                                            type="text"
                                            placeholder="Search for a location..."
                                            value={locationSearchQuery}
                                            onChange={handleLocationSearchChange}
                                            className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:border-transparent text-sm"
                                            style={{ borderColor: '#DDA15E', focusRingColor: '#606C38' }}
                                        />
                                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        {locationSearchQuery && (
                                            <button
                                                onClick={() => {
                                                    setLocationSearchQuery('');
                                                    setLocationSearchResults([]);
                                                }}
                                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Location Search Results */}
                                    {locationSearchResults.length > 0 && (
                                        <div className="mb-3 border border-gray-200 rounded-md shadow-sm max-h-40 overflow-y-auto" style={{ backgroundColor: '#FEFAE0' }}>
                                            {locationSearchResults.map((place, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => selectLocation(place)}
                                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                                            style={{ hoverBackgroundColor: '#DDA15E20' }}
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

                                    {locationSearchLoading && (
                                        <div className="mb-3 border border-gray-200 rounded-md shadow-sm p-3 text-center" style={{ backgroundColor: '#FEFAE0' }}>
                                            <div className="inline-block w-4 h-4 border-2 rounded-full animate-spin mr-2" style={{ borderColor: '#606C38', borderTopColor: 'transparent' }} />
                                            <span className="text-sm text-gray-600">Searching...</span>
                                        </div>
                                    )}

                                    {/* Use My Location Button */}
                                    <button
                                        onClick={toggleLocationFilter}
                                        disabled={locationLoading}
                                        className={'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ' + (
                                            locationEnabled 
                                                ? 'text-green-700' 
                                                : 'text-gray-700'
                                        ) + (locationLoading ? ' opacity-50 cursor-not-allowed' : '')}
                                        style={{ 
                                            backgroundColor: locationEnabled ? '#DDA15E40' : '#606C3820'
                                        }}
                                    >
                                        {locationLoading ? (
                                            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: '#606C38', borderTopColor: 'transparent' }} />
                                        ) : locationEnabled ? (
                                            <><Navigation className="w-4 h-4" />Location Enabled</>
                                        ) : (
                                            <><Navigation className="w-4 h-4" />Use My Location</>
                                        )}
                                    </button>
                                    
                                    {locationError && (
                                        <p className="mt-2 text-sm text-red-600">{locationError}</p>
                                    )}
                                    {locationEnabled && userLocation && (
                                        <p className="mt-2 text-sm text-green-600">
                                            Showing nearby vendors within {searchRadius}m
                                        </p>
                                    )}
                                </div>

                                {/* Category Filter */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium mb-3" style={{ color: '#283618' }}>Category</h3>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent"
                                        style={{ borderColor: '#DDA15E', focusRingColor: '#606C38' }}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((category, idx) => {
                                            const categoryValue = typeof category === 'string' ? category : category.name || category;
                                            const categoryId = typeof category === 'string'
                                                ? category
                                                : (category._id || category.name || JSON.stringify(category) || 'cat-' + idx);
                                            return (
                                                <option key={`cat-${categoryId}`} value={categoryValue}>
                                                    {categoryValue}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                {/* University Filter */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium mb-3" style={{ color: '#283618' }}>University</h3>
                                    <select
                                        value={selectedUniversity}
                                        onChange={(e) => setSelectedUniversity(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent"
                                        style={{ borderColor: '#DDA15E', focusRingColor: '#606C38' }}
                                    >
                                        <option value="">All Universities</option>
                                        {universities.map((university) => (
                                            <option key={university._id || university} value={university.name || university}>
                                                {university.name || university}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price Range Filter */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium mb-3" style={{ color: '#283618' }}>Price Range</h3>
                                    <div className="flex gap-2 w-full">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={priceRange.min}
                                            onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                                            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent min-w-0"
                                            style={{ borderColor: '#DDA15E', focusRingColor: '#606C38' }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={priceRange.max}
                                            onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                                            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent min-w-0"
                                            style={{ borderColor: '#DDA15E', focusRingColor: '#606C38' }}
                                        />
                                    </div>
                                </div>

                                {/* Vendors Filter */}
                                {vendors.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-medium mb-3" style={{ color: '#283618' }}>Vendors</h3>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {vendors.map((vendor) => (
                                                <label key={vendor._id} className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedVendors.includes(vendor._id)}
                                                        onChange={() => handleVendorToggle(vendor._id)}
                                                        className="rounded border-gray-300 focus:ring-2 focus:border-transparent"
                                                        style={{ accentColor: '#606C38', focusRingColor: '#606C38' }}
                                                    />
                                                    <span className="text-sm truncate" style={{ color: '#283618' }}>
                                                        {vendor.storeName}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Main Content - Adjust width based on filter visibility */}
                    <div className={`flex-1 transition-all duration-300 ease-in-out ${isFilterVisible ? '' : 'w-full'}`}>
                        {/* Results Summary */}
                        <div className="mb-6 flex items-center justify-between">
                            <p style={{ color: '#283618' }}>
                                Showing {products.length} products
                                {locationEnabled && userLocation && ' nearby'}
                            </p>
                            
                            {/* Mobile Filter Button - only show if filter is hidden on mobile */}
                            <button
                                onClick={toggleFilterSidebar}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                                style={{ backgroundColor: '#606C3820', color: '#283618' }}
                            >
                                <Filter className="w-5 h-5" />
                                Filters
                            </button>
                        </div>

                        {/* Content Grid - Products or Services */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {/* Render Products */}
                            {(contentType === 'all' || contentType === 'products') && products.map((product) => (
                                <div 
                                    key={product._id}
                                    onClick={() => {
                                        console.log('Product clicked:', product._id);
                                        console.log('Product data:', product);
                                        navigate(`/products/${product._id}`);
                                    }}
                                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                >
                                    {/* Product Image Carousel */}
                                    <div className="relative">
                                        <div className="aspect-w-16 aspect-h-9 bg-gray-200 h-48">
                                            {product.images && product.images.length > 0 ? (
                                                <>
                                                    {/* Main Image */}
                                                    <img
                                                        src={getImageUrl(product.images[productImageIndexes[product._id] || 0])}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover rounded-t-lg"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image';
                                                        }}
                                                    />
                                                    
                                                    {/* Carousel Controls - Only show if multiple images */}
                                                    {product.images.length > 1 && (
                                                        <>
                                                            {/* Previous Button */}
                                                            <button
                                                                onClick={() => prevImage(product._id, product.images.length)}
                                                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all"
                                                            >
                                                                <ChevronLeft className="w-4 h-4" />
                                                            </button>
                                                            
                                                            {/* Next Button */}
                                                            <button
                                                                onClick={() => nextImage(product._id, product.images.length)}
                                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all"
                                                            >
                                                                <ChevronRight className="w-4 h-4" />
                                                            </button>
                                                            
                                                            {/* Image Indicators */}
                                                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                                                                {product.images.map((_, index) => (
                                                                    <button
                                                                        key={index}
                                                                        onClick={() => goToImage(product._id, index)}
                                                                        className={'w-2 h-2 rounded-full transition-all ' + (
                                                                            index === (productImageIndexes[product._id] || 0)
                                                                                ? 'bg-white w-6'
                                                                                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                                                        )}
                                                                    />
                                                                ))}
                                                            </div>
                                                            
                                                            {/* Image Counter */}
                                                            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                                                                {(productImageIndexes[product._id] || 0) + 1} / {product.images.length}
                                                            </div>
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg">
                                                    <span className="text-gray-400 text-sm font-medium">No Image</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Wishlist Button Overlay */}
                                        <button
                                            onClick={() => handleWishlistToggle(product)}
                                            className={'absolute top-2 right-2 p-2 rounded-full transition-colors ' + (
                                                isProductInWishlist(product._id) 
                                                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                                    : 'bg-white text-gray-400 hover:bg-gray-200'
                                            )}
                                        >
                                            <Heart className={'w-5 h-5 ' + (isProductInWishlist(product._id) ? 'fill-current' : '')} />
                                        </button>
                                    </div>
                                    
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold mb-2" style={{ color: '#283618' }}>{product.name}</h3>
                                        <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                                        
                                        {/* Category Tags */}
                                        {product.categories && product.categories.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {product.categories.map((category, index) => (
                                                    <span 
                                                        key={index} 
                                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                                        style={{ backgroundColor: '#606C3820', color: '#606C38' }}
                                                    >
                                                        {typeof category === 'string' ? category : category.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Vendor Information */}
                                        {product.vendorId ? (
                                            <div className="mb-3 p-2 rounded-md" style={{ backgroundColor: '#FEFAE0' }}>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#606C3820' }}>
                                                        <Store className="w-4 h-4" style={{ color: '#606C38' }} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs" style={{ color: '#606C38' }}>Sold by</p>
                                                        {product.vendorId._id ? (
                                                            <Link 
                                                                to={`/vendor/${product.vendorId._id}`}
                                                                className="text-sm font-medium hover:opacity-70"
                                                                style={{ color: '#283618' }}
                                                            >
                                                                {product.vendorId.storeName || 'Unknown Vendor'}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-sm font-medium" style={{ color: '#283618' }}>
                                                                {product.vendorId.storeName || 'Unknown Vendor'}
                                                            </span>
                                                        )}
                                                        {product.vendorId.universityNear && (
                                                            <span className="text-xs block" style={{ color: '#606C38' }}>
                                                                📍 {product.vendorId.universityNear}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Delivery Options */}
                                                <div className="flex gap-2 mt-2">
                                                    {product.vendorId.deliveryAvailable && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#28361820', color: '#283618' }}>
                                                            Delivery
                                                        </span>
                                                    )}
                                                    {product.vendorId.pickupAvailable && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#DDA15E20', color: '#DDA15E' }}>
                                                            Pickup
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-3 p-2 rounded-md" style={{ backgroundColor: '#FEFAE0' }}>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#606C3820' }}>
                                                        <Store className="w-4 h-4" style={{ color: '#606C38' }} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs" style={{ color: '#606C38' }}>Sold by</p>
                                                        <span className="text-sm font-medium" style={{ color: '#283618' }}>
                                                            Vendor information loading...
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Stock Status */}
                                        {product.stock !== undefined && (
                                            <div className="mb-3">
                                                <span className={'text-sm font-medium ' + (
                                                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                                                )}>
                                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold" style={{ color: '#283618' }}>${product.basePrice || product.price}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(product);
                                                }}
                                                className="px-4 py-2 rounded-md transition-all duration-200 hover:scale-105 flex items-center"
                                                style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                                            >
                                                <ShoppingCart className="w-4 h-4 mr-1" />
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Render Services */}
                            {(contentType === 'all' || contentType === 'services') && services.map((service) => (
                                <div 
                                    key={service._id}
                                    onClick={() => navigate(`/services/${service._id}`)}
                                    className="rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                                    style={{ backgroundColor: '#FEFAE0' }}
                                >
                                    {/* Service Image */}
                                    <div className="relative">
                                        <div className="aspect-w-16 aspect-h-9 bg-gray-200 h-48">
                                            {service.images && service.images.length > 0 ? (
                                                <img
                                                    src={service.images[0].startsWith('http') ? service.images[0] : `http://localhost:5000/uploads/${service.images[0]}`}
                                                    alt={service.title}
                                                    className="w-full h-full object-cover rounded-t-lg"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Service';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full" style={{ background: 'linear-gradient(135deg, #606C38 0%, #283618 100%)' }}>
                                                    <Wrench className="w-12 h-12" style={{ color: '#FEFAE0' }} />
                                                </div>
                                            )}
                                            
                                            {/* Service Type Badge */}
                                            <div className="absolute top-2 left-2">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#DDA15E20', color: '#DDA15E' }}>
                                                    Service
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4">
                                        {/* Service Title */}
                                        <h3 className="text-lg font-semibold mb-2 line-clamp-2" style={{ color: '#283618' }}>
                                            {service.title}
                                        </h3>
                                        
                                        {/* Service Category */}
                                        <div className="mb-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#606C3820', color: '#606C38' }}>
                                                {service.serviceCategory?.charAt(0).toUpperCase() + service.serviceCategory?.slice(1).replace('_', ' ') || 'General'}
                                            </span>
                                        </div>
                                        
                                        {/* Service Description */}
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {service.description}
                                        </p>
                                        
                                        {/* Vendor Info */}
                                        {service.vendorId ? (
                                            <div className="mb-3 p-2 rounded-md" style={{ backgroundColor: '#FEFAE0' }}>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#606C3820' }}>
                                                        <Store className="w-4 h-4" style={{ color: '#606C38' }} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs" style={{ color: '#606C38' }}>Offered by</p>
                                                        {service.vendorId._id ? (
                                                            <Link 
                                                                to={`/vendor/${service.vendorId._id}`}
                                                                className="text-sm font-medium hover:opacity-70"
                                                                style={{ color: '#283618' }}
                                                            >
                                                                {service.vendorId.storeName || 'Unknown Vendor'}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-sm font-medium" style={{ color: '#283618' }}>
                                                                {service.vendorId.storeName || 'Unknown Vendor'}
                                                            </span>
                                                        )}
                                                        {service.vendorId.universityNear && (
                                                            <span className="text-xs block" style={{ color: '#606C38' }}>
                                                                📍 {service.vendorId.universityNear}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-3 p-2 rounded-md" style={{ backgroundColor: '#FEFAE0' }}>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#606C3820' }}>
                                                        <Store className="w-4 h-4" style={{ color: '#606C38' }} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs" style={{ color: '#606C38' }}>Offered by</p>
                                                        <span className="text-sm font-medium" style={{ color: '#283618' }}>
                                                            Vendor information loading...
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Service Location & Pricing */}
                                        <div className="flex gap-2 mb-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {service.serviceLocation === 'online' ? 'Online' : service.serviceLocation === 'in_person' ? 'In-person' : 'Both'}
                                            </span>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {service.pricingModel === 'hourly' ? `${service.basePrice}/hr` : service.pricingModel === 'fixed' ? `Fixed: ${service.basePrice}` : service.pricingModel === 'package' ? `Package: ${service.basePrice}` : 'Contact for quote'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-2xl font-bold text-blue-600">
                                                    {service.pricingModel === 'hourly' ? `${service.basePrice}/hr` : service.basePrice ? `$${service.basePrice}` : 'Quote'}
                                                </span>
                                                {service.averageRating > 0 && (
                                                    <div className="flex items-center mt-1">
                                                        <span className="text-yellow-400 text-sm">★</span>
                                                        <span className="text-sm text-gray-600 ml-1">
                                                            {service.averageRating.toFixed(1)} ({service.reviewCount})
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Handle service booking/contact (future implementation)
                                                    alert('Service booking feature coming soon!');
                                                }}
                                                className="text-white px-4 py-2 rounded-md flex items-center transition-colors"
                                                style={{ backgroundColor: '#606C38' }}
                                            >
                                                <Wrench className="w-4 h-4 mr-1" />
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {((contentType === 'all' || contentType === 'products') && products.length === 0 && (contentType === 'all' || contentType === 'services') && services.length === 0) && !loading && (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">
                                    {contentType === 'services' ? 'No services found matching your criteria.' : 
                                     contentType === 'products' ? 'No products found matching your criteria.' : 
                                     'No products or services found matching your criteria.'}
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4"
                                    style={{ color: '#606C38' }}
                                >
                                    Clear filters and try again
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;