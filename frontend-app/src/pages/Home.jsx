import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useProductApi } from '../hooks/useProductApi';
import { ShoppingCart, Store, Package, Heart, TrendingUp, Users, Star, Clock, MapPin, CheckCircle } from 'lucide-react';

const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const { theme } = useTheme();
    const { getProducts } = useProductApi();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        vendors: 150,
        products: 2500,
        users: 5000,
        deliveries: 10000
    });
    const [popularProducts, setPopularProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const handleVendorApplication = () => {
        navigate('/vendor/apply');
    };

    useEffect(() => {
        const loadPopularProducts = async () => {
            try {
                setLoadingProducts(true);
                const result = await getProducts();
                if (result.success && result.data) {
                    // Sort by rating and review count to get popular products
                    const sorted = result.data
                        .filter(p => p.averageRating > 0)
                        .sort((a, b) => {
                            if (b.averageRating !== a.averageRating) {
                                return b.averageRating - a.averageRating;
                            }
                            return (b.reviewCount || 0) - (a.reviewCount || 0);
                        })
                        .slice(0, 8); // Get top 8 products
                    setPopularProducts(sorted);
                }
            } catch (error) {
                console.error('Failed to load popular products:', error);
            } finally {
                setLoadingProducts(false);
            }
        };

        loadPopularProducts();
    }, []);

    return (
        <div className="min-h-screen" style={{ backgroundColor: theme.background }}>
            {/* Hero Section */}
            <div className="relative overflow-hidden" style={{ 
                background: theme.mode === 'dark' 
                    ? `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
                    : `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80') center/cover no-repeat`
            }}>
                {/* Animated gradient overlay for light mode */}
                {theme.mode === 'light' && (
                    <div className="absolute inset-0 animate-pulse" style={{ 
                        background: 'linear-gradient(45deg, rgba(96, 108, 56, 0.3) 0%, rgba(40, 54, 24, 0.2) 50%, rgba(221, 161, 94, 0.3) 100%)',
                        animationDuration: '8s'
                    }}></div>
                )}
                <div className="absolute inset-0" style={{ 
                    backgroundColor: theme.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.75)' 
                }}></div>
                <div className="relative px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full animate-pulse" style={{ backgroundColor: `${theme.accent}40` }}>
                                <ShoppingCart className="w-16 h-16" style={{ color: theme.accent }} />
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ color: theme.mode === 'dark' ? theme.text.inverse : '#283618' }}>
                            Welcome to CampusCart
                        </h1>
                        <p className="text-xl md:text-2xl mb-8" style={{ color: theme.mode === 'dark' ? theme.text.inverse : '#283618', opacity: theme.mode === 'dark' ? 0.9 : 1 }}>
                            Your one-stop shop for campus essentials. Connect, shop, and sell with ease.
                        </p>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            <div className="text-center">
                                <div className="text-3xl font-bold" style={{ color: theme.mode === 'dark' ? theme.accent : '#606C38' }}>{stats.vendors}+</div>
                                <div className="text-sm" style={{ color: theme.mode === 'dark' ? theme.text.inverse : '#283618', opacity: theme.mode === 'dark' ? 0.8 : 1 }}>Active Vendors</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold" style={{ color: theme.mode === 'dark' ? theme.accent : '#606C38' }}>{stats.products}+</div>
                                <div className="text-sm" style={{ color: theme.mode === 'dark' ? theme.text.inverse : '#283618', opacity: theme.mode === 'dark' ? 0.8 : 1 }}>Products</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold" style={{ color: theme.mode === 'dark' ? theme.accent : '#606C38' }}>{stats.users}+</div>
                                <div className="text-sm" style={{ color: theme.mode === 'dark' ? theme.text.inverse : '#283618', opacity: theme.mode === 'dark' ? 0.8 : 1 }}>Students</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold" style={{ color: theme.mode === 'dark' ? theme.accent : '#606C38' }}>{stats.deliveries}+</div>
                                <div className="text-sm" style={{ color: theme.mode === 'dark' ? theme.text.inverse : '#283618', opacity: theme.mode === 'dark' ? 0.8 : 1 }}>Deliveries</div>
                            </div>
                        </div>
                        {isAuthenticated ? (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link 
                                    to="/products"
                                    className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 inline-flex items-center gap-2"
                                    style={{ backgroundColor: theme.mode === 'dark' ? theme.text.inverse : '#606C38', color: theme.mode === 'dark' ? theme.primary : '#FEFAE0' }}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Browse Products
                                </Link>
                                {user?.role === 'vendor' ? (
                                    <>
                                        <Link 
                                            to="/vendor/dashboard"
                                            className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 inline-flex items-center gap-2"
                                            style={{ backgroundColor: theme.accent, color: theme.text.inverse }}
                                        >
                                            <Store className="w-5 h-5" />
                                            Vendor Dashboard
                                        </Link>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleVendorApplication}
                                        className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 inline-flex items-center gap-2"
                                        style={{ backgroundColor: theme.accent, color: theme.text.inverse }}
                                    >
                                        <Store className="w-5 h-5" />
                                        Become a Vendor
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link 
                                    to="/products"
                                    className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 inline-flex items-center gap-2"
                                    style={{ backgroundColor: theme.mode === 'dark' ? theme.text.inverse : '#606C38', color: theme.mode === 'dark' ? theme.primary : '#FEFAE0' }}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Start Shopping
                                </Link>
                                <Link 
                                    to="/register"
                                    className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 inline-flex items-center gap-2"
                                    style={{ backgroundColor: theme.secondary, color: theme.text.inverse }}
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Vendor Application Section for Logged-in Users */}
            {isAuthenticated && user?.role !== 'vendor' && (
                <div className="py-16" style={{ backgroundColor: theme.secondary }}>
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <div className="p-3 rounded-full" style={{ backgroundColor: `${theme.accent}40` }}>
                                    <Store className="w-12 h-12" style={{ color: theme.accent }} />
                                </div>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: theme.text.inverse }}>
                                Want to Sell on CampusCart?
                            </h2>
                            <p className="text-xl mb-8" style={{ color: theme.text.inverse, opacity: 0.9 }}>
                                Join our marketplace and reach thousands of campus students
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={handleVendorApplication}
                                    className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-lg inline-flex items-center gap-2"
                                    style={{ backgroundColor: theme.text.inverse, color: theme.primary }}
                                >
                                    <Store className="w-5 h-5" />
                                    Apply to Become a Vendor
                                </button>
                                <Link 
                                    to="/products"
                                    className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-lg inline-flex items-center gap-2"
                                    style={{ backgroundColor: theme.accent, color: theme.text.inverse }}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Browse Products
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Popular Products Section */}
            <div className="px-4 sm:px-6 lg:px-8 py-16" style={{ backgroundColor: theme.surface }}>
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-4" style={{ color: theme.text.primary }}>Popular Products</h2>
                    <p className="text-xl text-center mb-12" style={{ color: theme.text.secondary }}>Highly rated products loved by students</p>
                    
                    {loadingProducts ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: theme.secondary }}></div>
                            <p className="mt-4" style={{ color: theme.text.secondary }}>Loading popular products...</p>
                        </div>
                    ) : popularProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {popularProducts.map((product) => (
                                <Link 
                                    key={product._id} 
                                    to={`/products/${product._id}`}
                                    className="group"
                                >
                                    <div className="rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105" style={{ backgroundColor: theme.background }}>
                                        <div className="relative aspect-square">
                                            {product.images && product.images.length > 0 ? (
                                                <img 
                                                    src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000/uploads/${product.images[0]}`}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/400x400/e5e7eb/6b7280?text=Product';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${theme.secondary}20` }}>
                                                    <Package className="w-16 h-16" style={{ color: theme.secondary }} />
                                                </div>
                                            )}
                                            {product.averageRating > 0 && (
                                                <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1" style={{ backgroundColor: '#FFD700', color: '#000' }}>
                                                    <Star className="w-3 h-3 fill-current" />
                                                    {product.averageRating.toFixed(1)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold mb-2 line-clamp-2" style={{ color: theme.text.primary }}>{product.name}</h3>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold" style={{ color: theme.text.secondary }}>${product.basePrice || product.price}</span>
                                                {product.reviewCount > 0 && (
                                                    <span className="text-xs" style={{ color: theme.text.muted }}>{product.reviewCount} reviews</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p style={{ color: theme.text.secondary }}>No popular products available yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Features Section */}
            <div className="px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12" style={{ color: theme.text.primary }}>Why Choose CampusCart?</h2>
                    <p className="text-xl text-center mb-16" style={{ color: theme.text.secondary, opacity: 0.8 }}>Everything you need for campus life, all in one place</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center p-6 rounded-lg shadow-md border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 hover:scale-110" style={{ backgroundColor: `${theme.primary}20` }}>
                                <Clock className="w-10 h-10" style={{ color: theme.primary }} />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4" style={{ color: theme.text.primary }}>Lightning Fast Delivery</h3>
                            <p className="mb-4" style={{ color: theme.text.muted }}>Quick and reliable delivery to your campus location within minutes</p>
                            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: theme.text.secondary }}>
                                <CheckCircle className="w-4 h-4" />
                                <span>Same-day delivery available</span>
                            </div>
                        </div>
                        
                        <div className="text-center p-8 rounded-xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl" style={{ backgroundColor: theme.background }}>
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 hover:scale-110" style={{ backgroundColor: `${theme.secondary}20` }}>
                                <Star className="w-10 h-10" style={{ color: theme.secondary }} />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4" style={{ color: theme.text.primary }}>Student-First Pricing</h3>
                            <p className="mb-4" style={{ color: theme.text.muted }}>Affordable prices with exclusive student discounts and deals</p>
                            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: theme.text.secondary }}>
                                <CheckCircle className="w-4 h-4" />
                                <span>Price match guarantee</span>
                            </div>
                        </div>
                        
                        <div className="text-center p-8 rounded-xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl" style={{ backgroundColor: theme.background }}>
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 hover:scale-110" style={{ backgroundColor: `${theme.accent}20` }}>
                                <MapPin className="w-10 h-10" style={{ color: theme.accent }} />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4" style={{ color: theme.text.primary }}>Campus Focused</h3>
                            <p className="mb-4" style={{ color: theme.text.muted }}>Designed specifically for campus life and student needs</p>
                            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: theme.text.secondary }}>
                                <CheckCircle className="w-4 h-4" />
                                <span>Available at your campus</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action Section */}
            <div className="py-20" style={{ background: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.primary} 100%)` }}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6" style={{ color: theme.text.inverse }}>Ready to Get Started?</h2>
                    <p className="text-xl mb-8" style={{ color: theme.text.inverse, opacity: 0.9 }}>
                        Join thousands of students already using CampusCart for their campus needs
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                            to="/products"
                            className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 inline-flex items-center gap-2 text-lg"
                            style={{ backgroundColor: theme.text.inverse, color: theme.primary }}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Start Shopping
                        </Link>
                        {!isAuthenticated && (
                            <Link 
                                to="/register"
                                className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 inline-flex items-center gap-2 text-lg border-2"
                                style={{ borderColor: theme.text.inverse, color: theme.text.inverse }}
                            >
                                <Users className="w-5 h-5" />
                                Sign Up Free
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
