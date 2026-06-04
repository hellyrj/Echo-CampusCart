import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProductApi } from '../hooks/useProductApi';
import { useServiceApi } from '../hooks/useServiceApi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { Heart, ShoppingCart, Filter, MapPin, Navigation, X, ChevronLeft, ChevronRight, Wrench, Package, Store, Check } from 'lucide-react';
import axiosInstance from '../api/axios';
import { vendorApi } from '../api/vendor.api';
import RatingComponent from '../components/RatingComponent';

const Products = () => {
    const { theme } = useTheme();
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [serviceCategories, setServiceCategories] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [contentType, setContentType] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTimeout, setSearchTimeout] = useState(null);
    
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
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
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [addingToCart, setAddingToCart] = useState({});
    const [showToast, setShowToast] = useState({ show: false, message: '', type: '' });
    
    const { getProducts, searchProducts, loading: productLoading } = useProductApi();
    const { getAllServices, searchServices, getServiceCategories, loading: serviceLoading } = useServiceApi();
    const { isAuthenticated, user } = useAuth();
    const { toggleWishlistItem, isProductInWishlist } = useWishlist();
    const { 
        addToCart, 
        removeFromCart, 
        updateProductQuantity,  // ← Added this for removing items
        isInCart, 
        loading: cartLoading,
        items: cartItems  // ← Added to access cart items if needed
    } = useCart();
    const navigate = useNavigate();

    const showToastMessage = (message, type = 'success') => {
        setShowToast({ show: true, message, type });
        setTimeout(() => {
            setShowToast({ show: false, message: '', type: '' });
        }, 3000);
    };

    const toggleFilterSidebar = () => {
        setIsFilterVisible(!isFilterVisible);
    };

    const debouncedSearch = useCallback((value) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        const timeout = setTimeout(() => {
            setSearchTerm(value);
        }, 500);
        
        setSearchTimeout(timeout);
    }, [searchTimeout]);

    useEffect(() => {
        loadProducts();
        loadServices();
        loadServiceCategories();
        setTimeout(() => {
            loadCategories();
            loadUniversities();
        }, 100);
    }, []);

    useEffect(() => {
        applyClientSideFilters();
    }, [searchTerm, selectedCategory, selectedUniversity, selectedVendors, priceRange, locationEnabled, userLocation, allProducts, sortBy, sortOrder]);

    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            if (locationSearchTimeout) {
                clearTimeout(locationSearchTimeout);
            }
        };
    }, [searchTimeout, locationSearchTimeout]);

    const loadCategories = async () => {
        try {
            const response = await axiosInstance.get('/vendors/categories');
            if (response.data.success) {
                const categoriesData = response.data.data || [];
                setCategories(categoriesData);
            } else {
                setCategories([]);
            }
        } catch (error) {
            const fallbackCategories = [
                "Stationery",
                "Food & Drinks", 
                "Printing Services",
                "Electronics",
                "Dorm Supplies",
                "Books"
            ];
            setCategories(fallbackCategories);
        }
    };

    const loadUniversities = async () => {
        try {
            const response = await axiosInstance.get('/vendors/universities');
            if (response.data.success) {
                setUniversities(response.data.data || []);
            } else {
                setUniversities([]);
            }
        } catch (error) {
            setUniversities([]);
        }
    };

    const handleAddToCart = async (product, e) => {
        e.stopPropagation();
        
        if (!isAuthenticated) {
            const shouldLogin = window.confirm('Please login to add items to cart. Would you like to login now?');
            if (shouldLogin) {
                sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
                navigate('/login');
            }
            return;
        }
        
        setAddingToCart(prev => ({ ...prev, [product._id]: true }));
        
        try {
            await addToCart(product._id, 1);
            showToastMessage('Item added to cart!', 'success');
        } catch (err) {
            console.error('Error adding to cart:', err);
            showToastMessage(err.response?.data?.message || 'Failed to add to cart', 'error');
        } finally {
            setTimeout(() => {
                setAddingToCart(prev => ({ ...prev, [product._id]: false }));
            }, 500);
        }
    };

    // Updated handleRemoveFromCart to use updateProductQuantity
    const handleRemoveFromCart = async (productId, e) => {
        e.stopPropagation();
        
        if (!isAuthenticated) {
            const shouldLogin = window.confirm('Please login to manage your cart. Would you like to login now?');
            if (shouldLogin) {
                sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
                navigate('/login');
            }
            return;
        }
        
        setAddingToCart(prev => ({ ...prev, [productId]: true }));
        
        try {
            // Using updateProductQuantity with quantity 0 removes the item
            await updateProductQuantity(productId, 0);
            showToastMessage('Item removed from cart', 'success');
        } catch (err) {
            console.error('Error removing from cart:', err);
            showToastMessage(err.response?.data?.message || 'Failed to remove from cart', 'error');
        } finally {
            setTimeout(() => {
                setAddingToCart(prev => ({ ...prev, [productId]: false }));
            }, 500);
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

    const handleRatingUpdate = (productId, newRating) => {
        setAllProducts(prev => prev.map(product => 
            product._id === productId 
                ? { ...product, averageRating: newRating.averageRating, reviewCount: newRating.reviewCount }
                : product
        ));
        setProducts(prev => prev.map(product => 
            product._id === productId 
                ? { ...product, averageRating: newRating.averageRating, reviewCount: newRating.reviewCount }
                : product
        ));
    };

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
                setUserLocation(location);
                setLocationEnabled(true);
                setLocationLoading(false);
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
                maximumAge: 300000
            }
        );
    };

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
            }
        } catch (error) {
            console.error('Error loading nearby vendors:', error);
        }
    };

    const toggleLocationFilter = () => {
        if (locationEnabled) {
            setLocationEnabled(false);
            setUserLocation(null);
            loadVendors();
        } else {
            getUserLocation();
        }
    };

    const handleVendorToggle = (vendorId) => {
        setSelectedVendors(prev => 
            prev.includes(vendorId) 
                ? prev.filter(id => id !== vendorId)
                : [...prev, vendorId]
        );
    };

    const handlePriceRangeChange = (type, value) => {
        if (value && (isNaN(value) || value < 0)) return;
        setPriceRange(prev => ({
            ...prev,
            [type]: value
        }));
    };

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

    const handleLocationSearchChange = (e) => {
        const query = e.target.value;
        setLocationSearchQuery(query);
        
        if (locationSearchTimeout) {
            clearTimeout(locationSearchTimeout);
        }
        
        const timeoutId = setTimeout(() => {
            searchLocations(query);
        }, 500);
        setLocationSearchTimeout(timeoutId);
    };

    const selectLocation = (place) => {
        const location = { lat: place.lat, lng: place.lng };
        setUserLocation(location);
        setLocationEnabled(true);
        setLocationSearchQuery(place.display_name);
        setLocationSearchResults([]);
        setLocationError('');
        loadNearbyVendors(location);
    };

    const getImageUrl = (image) => {
        if (!image) return 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image';
        
        if (image.url) return image.url;
        if (image.startsWith('http')) return image;
        if (image.startsWith('/')) return `http://localhost:5000${image}`;
        return `http://localhost:5000/uploads/${image}`;
    };

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
        setSortBy('createdAt');
        setSortOrder('desc');
        loadVendors();
    };

    const loadProducts = async () => {
        try {
            setError(null);
            const result = await getProducts();
            if (result.success) {
                const productsData = result.data?.data || result.data || [];
                setAllProducts(Array.isArray(productsData) ? productsData : []);
                setProducts(Array.isArray(productsData) ? productsData : []);
            } else {
                setError(result.message || 'Failed to load products');
                setAllProducts([]);
                setProducts([]);
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    setError('Authentication required. The backend may require authentication for this endpoint.');
                } else if (error.response.status === 404) {
                    setError('Products endpoint not found. Is the backend running?');
                } else {
                    setError(error.response.data?.message || `Server error: ${error.response.status}`);
                }
            } else if (error.request) {
                setError('Network error. Cannot connect to backend server. Is it running on http://localhost:5000?');
            } else {
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
            const result = await getAllServices();
            if (result.success) {
                const servicesData = result.data?.services || result.data || [];
                setAllServices(Array.isArray(servicesData) ? servicesData : []);
                setServices(Array.isArray(servicesData) ? servicesData : []);
            } else {
                setAllServices([]);
                setServices([]);
            }
        } catch (error) {
            setAllServices([]);
            setServices([]);
        }
    };

    const loadServiceCategories = async () => {
        try {
            const result = await getServiceCategories();
            if (result.success) {
                const categoriesData = result.data || [];
                setServiceCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } else {
                setServiceCategories([]);
            }
        } catch (error) {
            setServiceCategories([]);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedUniversity('');
        debouncedSearch('');
    };

    const applyClientSideFilters = useCallback(() => {
        let filteredProducts = [...allProducts];
        
        if (!searchTerm.trim() && !selectedCategory && !selectedUniversity && 
            selectedVendors.length === 0 && !priceRange.min && !priceRange.max && !locationEnabled) {
            setProducts(filteredProducts);
            return;
        }
        
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filteredProducts = filteredProducts.filter(product => {
                const nameMatch = product.name && product.name.toLowerCase().includes(searchLower);
                const descriptionMatch = product.description && product.description.toLowerCase().includes(searchLower);
                let vendorMatch = false;
                if (product.vendorId) {
                    const vendorNameMatch = product.vendorId.storeName && product.vendorId.storeName.toLowerCase().includes(searchLower);
                    const vendorDescMatch = product.vendorId.description && product.vendorId.description.toLowerCase().includes(searchLower);
                    vendorMatch = vendorNameMatch || vendorDescMatch;
                }
                return nameMatch || descriptionMatch || vendorMatch;
            });
        }
        
        if (selectedCategory) {
            filteredProducts = filteredProducts.filter(product => {
                if (Array.isArray(product.categories)) {
                    return product.categories.some(cat => 
                        (typeof cat === 'string' ? cat : cat.name) === selectedCategory
                    );
                } else if (product.category) {
                    return product.category === selectedCategory;
                }
                return false;
            });
        }
        
        if (selectedUniversity) {
            filteredProducts = filteredProducts.filter(product => {
                if (product.vendorId && product.vendorId.universityNear) {
                    return product.vendorId.universityNear === selectedUniversity;
                }
                return false;
            });
        }
        
        if (selectedVendors.length > 0) {
            filteredProducts = filteredProducts.filter(product => {
                if (product.vendorId && product.vendorId._id) {
                    return selectedVendors.includes(product.vendorId._id.toString());
                }
                return false;
            });
        }
        
        if (priceRange.min || priceRange.max) {
            filteredProducts = filteredProducts.filter(product => {
                const price = parseFloat(product.basePrice || product.price || 0);
                const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
                const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
                return price >= minPrice && price <= maxPrice;
            });
        }
        
        if (locationEnabled && userLocation) {
            filteredProducts = filteredProducts.filter(product => {
                return product.vendorId && product.vendorId.location;
            });
        }
        
        filteredProducts.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'averageRating':
                    aValue = a.averageRating || 0;
                    bValue = b.averageRating || 0;
                    break;
                case 'basePrice':
                    aValue = a.basePrice || a.price || 0;
                    bValue = b.basePrice || b.price || 0;
                    break;
                case 'name':
                    aValue = a.name || '';
                    bValue = b.name || '';
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt || 0);
                    bValue = new Date(b.createdAt || 0);
                    break;
                default:
                    aValue = a.createdAt || 0;
                    bValue = b.createdAt || 0;
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        setProducts(filteredProducts);
    }, [searchTerm, selectedCategory, selectedUniversity, selectedVendors, priceRange, locationEnabled, userLocation, allProducts, sortBy, sortOrder]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: theme.secondary }}></div>
                    <p style={{ color: theme.text.primary }}>Loading products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
                <div className="text-center">
                    <div className="text-lg mb-4" style={{ color: theme.error }}>Error: {error}</div>
                    <button 
                        onClick={loadProducts}
                        className="px-6 py-2 rounded-md transition-all duration-200 hover:scale-105"
                        style={{ backgroundColor: theme.secondary, color: theme.text.inverse }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: theme.background }}>
            {/* Toast Notification */}
            {showToast.show && (
                <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
                    <div className={`px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 ${
                        showToast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                        {showToast.type === 'success' ? (
                            <Check className="w-5 h-5" />
                        ) : (
                            <X className="w-5 h-5" />
                        )}
                        {showToast.message}
                    </div>
                </div>
            )}

            {/* Header with Search Bar */}
            <div className="shadow-sm border-b" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold" style={{ color: theme.text.primary }}>Products</h1>
                        </div>
                        
                        <div className="relative mt-4">
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search products, vendors, or descriptions..."
                                        value={searchTerm}
                                        onChange={(e) => debouncedSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                                        style={{ borderColor: theme.border, focusRingColor: theme.secondary }}
                                    />
                                    <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                
                                <button
                                    onClick={toggleFilterSidebar}
                                    className={`px-4 py-3 rounded-lg border border-gray-300 transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
                                        isFilterVisible ? 'text-white' : 'text-gray-700'
                                    }`}
                                    style={{ 
                                        backgroundColor: isFilterVisible ? theme.secondary : 'transparent',
                                        color: isFilterVisible ? theme.text.inverse : theme.text.primary
                                    }}
                                    title={isFilterVisible ? "Hide Filters" : "Show Filters"}
                                >
                                    <Filter className="w-5 h-5" />
                                    <span className="hidden sm:inline">Filters</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-6">
                        <button
                            onClick={() => setContentType('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                                contentType === 'all' 
                                    ? 'text-white' 
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            style={{ 
                                backgroundColor: contentType === 'all' ? theme.secondary : 'transparent',
                                color: contentType === 'all' ? theme.text.inverse : theme.text.primary
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
                                backgroundColor: contentType === 'products' ? theme.secondary : 'transparent',
                                color: contentType === 'products' ? theme.text.inverse : theme.text.primary
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
                                backgroundColor: contentType === 'services' ? theme.secondary : 'transparent',
                                color: contentType === 'services' ? theme.text.inverse : theme.text.primary
                            }}
                        >
                            <Wrench className="w-4 h-4 inline mr-2" />
                            Services
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-6">
                    {isFilterVisible && (
                        <div className="w-80 flex-shrink-0 transition-all duration-300 ease-in-out">
                            <div className="rounded-lg shadow-md p-6 sticky top-6 border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold" style={{ color: theme.text.primary }}>Filters</h2>
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-sm hover:opacity-70"
                                        style={{ color: theme.text.secondary }}
                                    >
                                        Clear All
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-medium mb-3 flex items-center" style={{ color: theme.text.primary }}>
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Location-Based
                                    </h3>
                                    
                                    <div className="relative mb-3">
                                        <input
                                            type="text"
                                            placeholder="Search for a location..."
                                            value={locationSearchQuery}
                                            onChange={handleLocationSearchChange}
                                            className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:border-transparent text-sm"
                                            style={{ borderColor: theme.accent, focusRingColor: theme.secondary }}
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

                                    {locationSearchResults.length > 0 && (
                                        <div className="mb-3 border rounded-md shadow-sm max-h-40 overflow-y-auto" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
                                            {locationSearchResults.map((place, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => selectLocation(place)}
                                                    className="w-full px-3 py-2 text-left border-b transition-colors hover:opacity-80"
                                                    style={{ borderColor: theme.border }}
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
                                        <div className="mb-3 border rounded-md shadow-sm p-3 text-center" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
                                            <div className="inline-block w-4 h-4 border-2 rounded-full animate-spin mr-2" style={{ borderColor: theme.secondary, borderTopColor: 'transparent' }} />
                                            <span className="text-sm text-gray-600">Searching...</span>
                                        </div>
                                    )}

                                    <button
                                        onClick={toggleLocationFilter}
                                        disabled={locationLoading}
                                        className={'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ' + (
                                            locationEnabled 
                                                ? 'text-green-700' 
                                                : 'text-gray-700'
                                        ) + (locationLoading ? ' opacity-50 cursor-not-allowed' : '')}
                                        style={{ 
                                            backgroundColor: locationEnabled ? `${theme.accent}40` : `${theme.secondary}20`
                                        }}
                                    >
                                        {locationLoading ? (
                                            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: theme.secondary, borderTopColor: 'transparent' }} />
                                        ) : locationEnabled ? (
                                            <><Navigation className="w-4 h-4" />Location Enabled</>
                                        ) : (
                                            <><Navigation className="w-4 h-4" />Use My Location</>
                                        )}
                                    </button>
                                    
                                    {locationError && (
                                        <p className="mt-2 text-sm" style={{ color: theme.error }}>{locationError}</p>
                                    )}
                                    {locationEnabled && userLocation && (
                                        <p className="mt-2 text-sm" style={{ color: theme.success }}>
                                            Showing nearby vendors within {searchRadius}m
                                        </p>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-medium mb-3" style={{ color: theme.text.primary }}>Category</h3>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent"
                                        style={{ borderColor: theme.accent, focusRingColor: theme.secondary }}
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

                                <div className="mb-6">
                                    <h3 className="text-sm font-medium mb-3" style={{ color: theme.text.primary }}>University</h3>
                                    <select
                                        value={selectedUniversity}
                                        onChange={(e) => setSelectedUniversity(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent"
                                        style={{ borderColor: theme.accent, focusRingColor: theme.secondary }}
                                    >
                                        <option value="">All Universities</option>
                                        {universities.map((university) => (
                                            <option key={university._id || university} value={university.name || university}>
                                                {university.name || university}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-medium mb-3" style={{ color: theme.text.primary }}>Price Range</h3>
                                    <div className="flex gap-2 w-full">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={priceRange.min}
                                            onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                                            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent min-w-0"
                                            style={{ borderColor: theme.accent, focusRingColor: theme.secondary }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={priceRange.max}
                                            onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                                            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent min-w-0"
                                            style={{ borderColor: theme.accent, focusRingColor: theme.secondary }}
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-medium mb-3" style={{ color: theme.text.primary }}>Sort By</h3>
                                    <div className="space-y-2">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent"
                                            style={{ borderColor: theme.accent, focusRingColor: theme.secondary }}
                                        >
                                            <option value="averageRating">Rating (High to Low)</option>
                                            <option value="basePrice">Price</option>
                                            <option value="name">Name</option>
                                            <option value="createdAt">Date Added</option>
                                        </select>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent"
                                            style={{ borderColor: theme.accent, focusRingColor: theme.secondary }}
                                        >
                                            <option value="desc">Descending</option>
                                            <option value="asc">Ascending</option>
                                        </select>
                                    </div>
                                </div>

                                {vendors.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-medium mb-3" style={{ color: theme.text.primary }}>Vendors</h3>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {vendors.map((vendor) => (
                                                <label key={vendor._id} className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedVendors.includes(vendor._id)}
                                                        onChange={() => handleVendorToggle(vendor._id)}
                                                        className="rounded border-gray-300 focus:ring-2 focus:border-transparent"
                                                        style={{ accentColor: theme.secondary, focusRingColor: theme.secondary }}
                                                    />
                                                    <span className="text-sm truncate" style={{ color: theme.text.primary }}>
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
                    
                    <div className={`flex-1 transition-all duration-300 ease-in-out ${isFilterVisible ? '' : 'w-full'}`}>
                        <div className="mb-6 flex items-center justify-between">
                            <p style={{ color: theme.text.primary }}>
                                Showing {products.length} products
                                {locationEnabled && userLocation && ' nearby'}
                            </p>
                            
                            <button
                                onClick={toggleFilterSidebar}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                                style={{ backgroundColor: `${theme.secondary}20`, color: theme.text.primary }}
                            >
                                <Filter className="w-5 h-5" />
                                Filters
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                            {(contentType === 'all' || contentType === 'products') && products.map((product) => {
                                const inCart = isInCart(product._id);
                                const isAdding = addingToCart[product._id];

                                return (
                                    <div
                                        key={product._id}
                                        onClick={() => navigate(`/products/${product._id}`)}
                                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-200"
                                    >
                                        <div className="relative">
                                            <div className="h-40 bg-gray-100 flex items-center justify-center">
                                                {product.images && product.images.length > 0 ? (
                                                    <>
                                                        <img
                                                            src={getImageUrl(product.images[productImageIndexes[product._id] || 0])}
                                                            alt={product.name}
                                                            className="w-full h-full object-contain rounded-t-lg p-2"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://via.placeholder.com/200x150/e5e7eb/6b7280?text=No+Image';
                                                            }}
                                                        />

                                                        {product.images.length > 1 && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        prevImage(product._id, product.images.length);
                                                                    }}
                                                                    className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all"
                                                                >
                                                                    <ChevronLeft className="w-3 h-3" />
                                                                </button>

                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        nextImage(product._id, product.images.length);
                                                                    }}
                                                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all"
                                                                >
                                                                    <ChevronRight className="w-3 h-3" />
                                                                </button>

                                                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                                                                    {product.images.map((_, index) => (
                                                                        <button
                                                                            key={index}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                goToImage(product._id, index);
                                                                            }}
                                                                            className={'w-1.5 h-1.5 rounded-full transition-all ' + (
                                                                                index === (productImageIndexes[product._id] || 0)
                                                                                    ? 'bg-white w-4'
                                                                                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                                                            )}
                                                                        />
                                                                    ))}
                                                                </div>

                                                                <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded-full">
                                                                    {(productImageIndexes[product._id] || 0) + 1} / {product.images.length}
                                                                </div>
                                                            </>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg">
                                                        <span className="text-gray-400 text-xs font-medium">No Image</span>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleWishlistToggle(product);
                                                }}
                                                className={'absolute top-1 right-1 p-1.5 rounded-full transition-colors ' + (
                                                    isProductInWishlist(product._id)
                                                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                        : 'bg-white text-gray-400 hover:bg-gray-200'
                                                )}
                                            >
                                                <Heart className={'w-4 h-4 ' + (isProductInWishlist(product._id) ? 'fill-current' : '')} />
                                            </button>
                                        </div>

                                        <div className="p-3">
                                            <h3 className="text-sm font-semibold mb-1 truncate" style={{ color: theme.text.primary }} title={product.name}>{product.name}</h3>

                                            {product.vendorId ? (
                                                <div className="mb-2 p-1.5 rounded-md" style={{ backgroundColor: theme.surface }}>
                                                    <div className="flex items-center space-x-1.5">
                                                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.secondary}20` }}>
                                                            <Store className="w-2.5 h-2.5" style={{ color: theme.text.primary }} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            {product.vendorId._id ? (
                                                                <Link
                                                                    to={`/vendor/${product.vendorId._id}`}
                                                                    className="text-xs font-medium hover:opacity-70 truncate block"
                                                                    style={{ color: theme.text.primary }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {product.vendorId.storeName || 'Unknown Vendor'}
                                                                </Link>
                                                            ) : (
                                                                <span className="text-xs font-medium truncate block" style={{ color: theme.text.primary }}>
                                                                    {product.vendorId.storeName || 'Unknown Vendor'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mb-2 p-1.5 rounded-md" style={{ backgroundColor: theme.surface }}>
                                                    <div className="flex items-center space-x-1.5">
                                                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.secondary}20` }}>
                                                            <Store className="w-2.5 h-2.5" style={{ color: theme.text.primary }} />
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-medium" style={{ color: theme.text.primary }}>
                                                                Vendor loading...
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {product.inventory && (
                                                <div className="mb-2">
                                                    <div className={'flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ' + (
                                                        product.inventory.totalStock > 0
                                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                                            : 'bg-red-50 text-red-700 border border-red-200'
                                                    )}>
                                                        {product.inventory.totalStock > 0 ? (
                                                            <>
                                                                <Package className="w-3 h-3" />
                                                                <span>{product.inventory.totalStock} in stock</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <X className="w-3 h-3" />
                                                                <span>Out of stock</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mb-2" onClick={(e) => e.stopPropagation()}>
                                                <RatingComponent
                                                    productId={product._id}
                                                    currentRating={product.averageRating}
                                                    reviewCount={product.reviewCount}
                                                    onRatingUpdate={(newRating) => handleRatingUpdate(product._id, newRating)}
                                                    size="small"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-base font-bold" style={{ color: theme.text.primary }}>
                                                    ${product.basePrice || product.price}
                                                </span>

                                                {cartLoading && isAdding ? (
                                                    <button
                                                        disabled
                                                        className="px-2 py-1 rounded-md flex items-center gap-1 text-xs opacity-70"
                                                        style={{ backgroundColor: theme.secondary, color: theme.text.inverse }}
                                                    >
                                                        <div className="w-3 h-3 border-2 border-white rounded-full animate-spin border-t-transparent" />
                                                        {inCart ? '...' : '...'}
                                                    </button>
                                                ) : inCart ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveFromCart(product._id, e);
                                                        }}
                                                        disabled={isAdding}
                                                        className="px-2 py-1 rounded-md transition-all duration-200 hover:scale-105 flex items-center gap-1 text-xs disabled:opacity-50"
                                                        style={{ backgroundColor: '#10b981', color: 'white' }}
                                                    >
                                                        <Check className="w-3 h-3" />
                                                        Added
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => handleAddToCart(product, e)}
                                                        disabled={isAdding || (product.inventory && product.inventory.totalStock === 0)}
                                                        className="px-2 py-1 rounded-md transition-all duration-200 hover:scale-105 flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                                        style={{ backgroundColor: theme.secondary, color: theme.text.inverse }}
                                                    >
                                                        <ShoppingCart className="w-3 h-3" />
                                                        Add
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {(contentType === 'all' || contentType === 'services') && services.map((service) => (
                                <div
                                    key={service._id}
                                    onClick={() => navigate(`/services/${service._id}`)}
                                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-200"
                                >
                                    <div className="relative">
                                        <div className="h-40 bg-gray-100 flex items-center justify-center">
                                            {service.images && service.images.length > 0 ? (
                                                <img
                                                    src={service.images[0].startsWith('http') ? service.images[0] : `http://localhost:5000/uploads/${service.images[0]}`}
                                                    alt={service.title}
                                                    className="w-full h-full object-contain rounded-t-lg p-2"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/200x150/e5e7eb/6b7280?text=Service';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full" style={{ background: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.primary} 100%)` }}>
                                                    <Wrench className="w-8 h-8" style={{ color: theme.text.inverse }} />
                                                </div>
                                            )}

                                            <div className="absolute top-1 left-1">
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
                                                    Service
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3">
                                        <h3 className="text-sm font-semibold mb-1 truncate" style={{ color: theme.text.primary }} title={service.title}>
                                            {service.title}
                                        </h3>

                                        <div className="mb-2">
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${theme.secondary}20`, color: theme.secondary }}>
                                                {service.serviceCategory?.charAt(0).toUpperCase() + service.serviceCategory?.slice(1).replace('_', ' ') || 'General'}
                                            </span>
                                        </div>

                                        {service.vendorId ? (
                                            <div className="mb-2 p-1.5 rounded-md" style={{ backgroundColor: theme.surface }}>
                                                <div className="flex items-center space-x-1.5">
                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.secondary}20` }}>
                                                        <Store className="w-2.5 h-2.5" style={{ color: theme.text.primary }} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        {service.vendorId._id ? (
                                                            <Link
                                                                to={`/vendor/${service.vendorId._id}`}
                                                                className="text-xs font-medium hover:opacity-70 truncate block"
                                                                style={{ color: theme.text.primary }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {service.vendorId.storeName || 'Unknown Vendor'}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-xs font-medium truncate block" style={{ color: theme.text.primary }}>
                                                                {service.vendorId.storeName || 'Unknown Vendor'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-2 p-1.5 rounded-md" style={{ backgroundColor: theme.surface }}>
                                                <div className="flex items-center space-x-1.5">
                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.secondary}20` }}>
                                                        <Store className="w-2.5 h-2.5" style={{ color: theme.text.primary }} />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-medium" style={{ color: theme.text.primary }}>
                                                            Vendor loading...
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mb-2">
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                <Package className="w-3 h-3" />
                                                <span>Available</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-1.5 mb-2">
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {service.serviceLocation === 'online' ? 'Online' : service.serviceLocation === 'in_person' ? 'In-person' : 'Both'}
                                            </span>
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {service.pricingModel === 'hourly' ? `${service.basePrice}/hr` : service.pricingModel === 'fixed' ? `Fixed: ${service.basePrice}` : service.pricingModel === 'package' ? `Package: ${service.basePrice}` : 'Quote'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-base font-bold" style={{ color: theme.text.secondary }}>
                                                    {service.pricingModel === 'hourly' ? `${service.basePrice}/hr` : service.basePrice ? `$${service.basePrice}` : 'Quote'}
                                                </span>
                                                {service.averageRating > 0 && (
                                                    <div className="flex items-center mt-0.5">
                                                        <span className="text-yellow-400 text-xs">★</span>
                                                        <span className="text-xs text-gray-600 ml-1">
                                                            {service.averageRating.toFixed(1)} ({service.reviewCount})
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!isAuthenticated) {
                                                        alert('Please login to book services');
                                                        navigate('/login');
                                                        return;
                                                    }
                                                    navigate(`/book-service/${service._id}`);
                                                }}
                                                className="text-white px-2 py-1 rounded-md flex items-center text-xs transition-colors"
                                                style={{ backgroundColor: theme.secondary, color: theme.text.inverse }}
                                            >
                                                <Wrench className="w-3 h-3 mr-1" />
                                                Book
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {((contentType === 'all' || contentType === 'products') && products.length === 0 && (contentType === 'all' || contentType === 'services') && services.length === 0) && !loading && (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">
                                    {contentType === 'services' ? 'No services found matching your criteria.' : 
                                     contentType === 'products' ? 'No products found matching your criteria.' : 
                                     'No products or services found matching your criteria.'}
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 px-4 py-2 rounded-md transition-all duration-200 hover:scale-105"
                                    style={{ backgroundColor: theme.secondary, color: theme.text.inverse }}
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