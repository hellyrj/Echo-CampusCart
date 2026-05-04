import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Store, Package, Heart, TrendingUp, Users, Star, Clock, MapPin, CheckCircle } from 'lucide-react';

const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        vendors: 150,
        products: 2500,
        users: 5000,
        deliveries: 10000
    });

    const handleVendorApplication = () => {
        navigate('/vendor/apply');
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#FEFAE0' }}>
            {/* Hero Section */}
            <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #283618 0%, #606C38 100%)' }}>
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full animate-pulse" style={{ backgroundColor: '#DDA15E40' }}>
                                <ShoppingCart className="w-16 h-16" style={{ color: '#DDA15E' }} />
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ color: '#FEFAE0' }}>
                            Welcome to CampusCart
                        </h1>
                        <p className="text-xl md:text-2xl mb-8" style={{ color: '#FEFAE0', opacity: 0.9 }}>
                            Your one-stop shop for campus essentials. Connect, shop, and sell with ease.
                        </p>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            <div className="text-center">
                                <div className="text-3xl font-bold" style={{ color: '#DDA15E' }}>{stats.vendors}+</div>
                                <div className="text-sm" style={{ color: '#FEFAE0', opacity: 0.8 }}>Active Vendors</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold" style={{ color: '#DDA15E' }}>{stats.products}+</div>
                                <div className="text-sm" style={{ color: '#FEFAE0', opacity: 0.8 }}>Products</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold" style={{ color: '#DDA15E' }}>{stats.users}+</div>
                                <div className="text-sm" style={{ color: '#FEFAE0', opacity: 0.8 }}>Students</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold" style={{ color: '#DDA15E' }}>{stats.deliveries}+</div>
                                <div className="text-sm" style={{ color: '#FEFAE0', opacity: 0.8 }}>Deliveries</div>
                            </div>
                        </div>
                        {isAuthenticated ? (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link 
                                    to="/products"
                                    className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 inline-flex items-center gap-2"
                                    style={{ backgroundColor: '#FEFAE0', color: '#283618' }}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Browse Products
                                </Link>
                                {user?.role === 'vendor' ? (
                                    <>
                                        <Link 
                                            to="/vendor/dashboard"
                                            className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 inline-flex items-center gap-2"
                                            style={{ backgroundColor: '#DDA15E', color: '#FEFAE0' }}
                                        >
                                            <Store className="w-5 h-5" />
                                            Vendor Dashboard
                                        </Link>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleVendorApplication}
                                        className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 inline-flex items-center gap-2"
                                        style={{ backgroundColor: '#DDA15E', color: '#FEFAE0' }}
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
                                    style={{ backgroundColor: '#FEFAE0', color: '#283618' }}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Start Shopping
                                </Link>
                                <Link 
                                    to="/register"
                                    className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 inline-flex items-center gap-2"
                                    style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
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
                <div className="py-16" style={{ backgroundColor: '#606C38' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <div className="p-3 rounded-full" style={{ backgroundColor: '#DDA15E40' }}>
                                    <Store className="w-12 h-12" style={{ color: '#DDA15E' }} />
                                </div>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#FEFAE0' }}>
                                Want to Sell on CampusCart?
                            </h2>
                            <p className="text-xl mb-8" style={{ color: '#FEFAE0', opacity: 0.9 }}>
                                Join our marketplace and reach thousands of campus students
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={handleVendorApplication}
                                    className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-lg inline-flex items-center gap-2"
                                    style={{ backgroundColor: '#FEFAE0', color: '#283618' }}
                                >
                                    <Store className="w-5 h-5" />
                                    Apply to Become a Vendor
                                </button>
                                <Link 
                                    to="/products"
                                    className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-lg inline-flex items-center gap-2"
                                    style={{ backgroundColor: '#DDA15E', color: '#FEFAE0' }}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Browse Products
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Features Section */}
            <div className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center mb-4" style={{ color: '#283618' }}>Why Choose CampusCart?</h2>
                    <p className="text-xl text-center mb-16" style={{ color: '#606C38', opacity: 0.8 }}>Everything you need for campus life, all in one place</p>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-8 rounded-xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl" style={{ backgroundColor: '#FEFAE0' }}>
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 hover:scale-110" style={{ backgroundColor: '#28361820' }}>
                                <Clock className="w-10 h-10" style={{ color: '#283618' }} />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4" style={{ color: '#283618' }}>Lightning Fast Delivery</h3>
                            <p className="text-gray-600 mb-4">Quick and reliable delivery to your campus location within minutes</p>
                            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: '#606C38' }}>
                                <CheckCircle className="w-4 h-4" />
                                <span>Same-day delivery available</span>
                            </div>
                        </div>
                        
                        <div className="text-center p-8 rounded-xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl" style={{ backgroundColor: '#FEFAE0' }}>
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 hover:scale-110" style={{ backgroundColor: '#606C3820' }}>
                                <Star className="w-10 h-10" style={{ color: '#606C38' }} />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4" style={{ color: '#283618' }}>Student-First Pricing</h3>
                            <p className="text-gray-600 mb-4">Affordable prices with exclusive student discounts and deals</p>
                            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: '#606C38' }}>
                                <CheckCircle className="w-4 h-4" />
                                <span>Price match guarantee</span>
                            </div>
                        </div>
                        
                        <div className="text-center p-8 rounded-xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl" style={{ backgroundColor: '#FEFAE0' }}>
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 hover:scale-110" style={{ backgroundColor: '#DDA15E20' }}>
                                <MapPin className="w-10 h-10" style={{ color: '#DDA15E' }} />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4" style={{ color: '#283618' }}>Campus Focused</h3>
                            <p className="text-gray-600 mb-4">Designed specifically for campus life and student needs</p>
                            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: '#606C38' }}>
                                <CheckCircle className="w-4 h-4" />
                                <span>Available at your campus</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action Section */}
            <div className="py-20" style={{ background: 'linear-gradient(135deg, #606C38 0%, #283618 100%)' }}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6" style={{ color: '#FEFAE0' }}>Ready to Get Started?</h2>
                    <p className="text-xl mb-8" style={{ color: '#FEFAE0', opacity: 0.9 }}>
                        Join thousands of students already using CampusCart for their campus needs
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                            to="/products"
                            className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 inline-flex items-center gap-2 text-lg"
                            style={{ backgroundColor: '#FEFAE0', color: '#283618' }}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Start Shopping
                        </Link>
                        {!isAuthenticated && (
                            <Link 
                                to="/register"
                                className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 inline-flex items-center gap-2 text-lg border-2"
                                style={{ borderColor: '#FEFAE0', color: '#FEFAE0' }}
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
