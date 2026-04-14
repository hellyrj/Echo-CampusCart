import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductApi } from '../hooks/useProductApi';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { getProducts, searchProducts, loading: apiLoading } = useProductApi();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const handleVendorApplication = () => {
        navigate('/vendor/apply');
    };

    useEffect(() => {
        loadProducts();
        loadCategories();
        loadUniversities();
    }, []);

    const loadCategories = async () => {
        try {
            // For now, using default categories. Later we can fetch from API
            const defaultCategories = [
                "Stationery",
                "Food & Drinks", 
                "Printing Services",
                "Electronics",
                "Dorm Supplies",
                "Books"
            ];
            setCategories(defaultCategories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadUniversities = async () => {
        try {
            const response = await axiosInstance.get('/universities');
            console.log('Universities API response:', response.data); // Debug log
            if (response.data.success) {
                console.log('Universities data:', response.data.data); // Debug log
                setUniversities(response.data.data);
            } else {
                console.error('Failed to load universities:', response.data.message);
                setUniversities([]);
            }
        } catch (error) {
            console.error('Error loading universities:', error);
            setUniversities([]);
        }
    };

    const handleAddToCart = (product) => {
        if (!isAuthenticated) {
            alert('Please login to add items to cart');
            return;
        }
        // TODO: Implement cart functionality
        alert('Cart functionality coming soon!');
    };

    const loadProducts = async () => {
        try {
            setError(null);
            console.log('Attempting to fetch products...');
            const result = await getProducts();
            console.log('API Response:', result);
            if (result.success) {
                const productsData = result.data?.data || result.data || [];
                console.log('Products data:', productsData);
                setProducts(Array.isArray(productsData) ? productsData : []);
            } else {
                console.error('Failed to load products:', result.message);
                setError(result.message || 'Failed to load products');
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
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = async () => {
        try {
            setLoading(true);
            setError(null);
            
            let filteredProducts = [];
            
            // If no filters, load all products
            if (!searchTerm.trim() && !selectedCategory && !selectedUniversity) {
                const result = await getProducts();
                if (result.success) {
                    filteredProducts = result.data?.data || result.data || [];
                }
            } else {
                // Apply filters
                const result = await getProducts();
                if (result.success) {
                    filteredProducts = result.data?.data || result.data || [];
                    
                    // Filter by search term
                    if (searchTerm.trim()) {
                        filteredProducts = filteredProducts.filter(product =>
                            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                    }
                    
                    // Filter by category
                    if (selectedCategory) {
                        filteredProducts = filteredProducts.filter(product =>
                            product.category === selectedCategory
                        );
                    }
                    
                    // Filter by university (would need vendor data)
                    if (selectedUniversity) {
                        // This would require joining with vendor data
                        // For now, we'll skip this filter
                        console.log('University filter not yet implemented:', selectedUniversity);
                    }
                }
            }
            
            setProducts(Array.isArray(filteredProducts) ? filteredProducts : []);
        } catch (error) {
            console.error('Error applying filters:', error);
            setError('Failed to filter products');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = () => {
        applyFilters();
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (!e.target.value.trim() && !selectedCategory && !selectedUniversity) {
            loadProducts();
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedUniversity('');
        loadProducts();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-lg mb-4">Error: {error}</div>
                    <button 
                        onClick={loadProducts}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Products</h1>
                    
                    {/* Filters Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search Bar */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Search by name or description..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            
                            {/* Category Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(e.target.value);
                                        handleFilterChange();
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* University Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                                <select
                                    value={selectedUniversity}
                                    onChange={(e) => {
                                        setSelectedUniversity(e.target.value);
                                        handleFilterChange();
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">All Universities</option>
                                    {universities.map((university) => (
                                        <option key={university._id || university.name} value={university.name || university}>
                                            {university.name || university}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {/* Search Button and Clear Filters */}
                        <div className="flex justify-between items-center mt-4">
                            <button
                                type="button"
                                onClick={handleSearch}
                                disabled={apiLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {apiLoading ? 'Searching...' : 'Search'}
                            </button>
                            
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Vendor Application Section for Logged-in Non-Vendor Users */}
                {isAuthenticated && user?.role !== 'vendor' && (
                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg shadow-md p-6 mb-8">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold mb-3">Want to Sell Your Products?</h3>
                            <p className="text-orange-100 mb-6">Join our marketplace and start selling to thousands of campus students</p>
                            <button
                                onClick={handleVendorApplication}
                                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                            >
                                Apply to Become a Vendor
                            </button>
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.isArray(products) && products.map((product) => (
                        <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                                <img
                                    src={product.image || 'https://via.placeholder.com/300x200?text=Product'}
                                    alt={product.name}
                                    className="w-full h-48 object-cover"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                                <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-blue-600">${product.basePrice || product.price}</span>
                                    <button 
                                        onClick={() => handleAddToCart(product)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {products.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
