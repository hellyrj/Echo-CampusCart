import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleVendorApplication = () => {
        navigate('/vendor/apply');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Welcome to CampusCart
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100">
                            Your one-stop shop for campus essentials
                        </p>
                        {isAuthenticated ? (
                            <div className="space-x-4">
                                <Link 
                                    to="/products"
                                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block mr-4"
                                >
                                    Browse Products
                                </Link>
                                {user?.role === 'vendor' ? (
                                    <>
                                        <Link 
                                            to="/my-products"
                                            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-block mr-4"
                                        >
                                            My Products
                                        </Link>
                                        <Link 
                                            to="/vendor/dashboard"
                                            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-block"
                                        >
                                            Vendor Dashboard
                                        </Link>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleVendorApplication}
                                        className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors inline-block"
                                    >
                                        Become a Vendor
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link 
                                    to="/products"
                                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
                                >
                                    Start Shopping
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Vendor Application Section for Logged-in Users */}
            {isAuthenticated && user?.role !== 'vendor' && (
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="text-center">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Want to Sell on CampusCart?
                            </h2>
                            <p className="text-xl mb-8 text-orange-100">
                                Join our marketplace and reach thousands of campus students
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={handleVendorApplication}
                                    className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
                                >
                                    Apply to Become a Vendor
                                </button>
                                <Link 
                                    to="/vendors"
                                    className="bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-lg border-2 border-white"
                                >
                                    Browse Vendors
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">Why Choose CampusCart?</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center p-6 bg-white rounded-lg shadow-md">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                        <p className="text-gray-600">Quick and reliable delivery to your campus location</p>
                    </div>
                    
                    <div className="text-center p-6 bg-white rounded-lg shadow-md">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2m0 8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
                        <p className="text-gray-600">Affordable prices with student discounts</p>
                    </div>
                    
                    <div className="text-center p-6 bg-white rounded-lg shadow-md">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Student First</h3>
                        <p className="text-gray-600">Designed specifically for campus life</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
