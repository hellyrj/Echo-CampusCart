import React, { useState, useEffect } from 'react';
import { useProductApi } from '../hooks/useProductApi';
import { useAuth } from '../context/AuthContext';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    const { getProducts, searchProducts, loading: apiLoading } = useProductApi();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        loadProducts();
    }, []);

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
            const result = await getProducts();
            console.log('API Response:', result); // Debug log
            if (result.success) {
                // Handle different possible response structures
                const productsData = result.data?.data || result.data || [];
                console.log('Products data:', productsData); // Debug log
                setProducts(Array.isArray(productsData) ? productsData : []);
            } else {
                console.error('Failed to load products:', result.message);
                setProducts([]);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            try {
                const result = await searchProducts(searchTerm);
                console.log('Search API Response:', result); // Debug log
                if (result.success) {
                    // Handle different possible response structures
                    const searchData = result.data?.data || result.data || [];
                    console.log('Search data:', searchData); // Debug log
                    setProducts(Array.isArray(searchData) ? searchData : []);
                } else {
                    console.error('Search failed:', result.message);
                    setProducts([]);
                }
            } catch (error) {
                console.error('Error searching products:', error);
                setProducts([]);
            }
        } else {
            loadProducts();
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (!e.target.value.trim()) {
            loadProducts();
        }
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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Products</h1>
                    
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="flex">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Search products..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={apiLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {apiLoading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </form>
                </div>

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
                                    <span className="text-2xl font-bold text-blue-600">${product.price}</span>
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
                        <p className="text-gray-600 text-lg">No products found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
