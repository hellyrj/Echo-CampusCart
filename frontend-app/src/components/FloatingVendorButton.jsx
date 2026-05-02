import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FloatingVendorButton = () => {
    const { user } = useAuth();
    const [isHovered, setIsHovered] = useState(false);

    // Only show if user is logged in and not already a vendor or admin
    if (!user || user.role === 'vendor' || user.role === 'admin') {
        return null;
    }

    return (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
            <Link
                to="/vendor/apply"
                className="group relative inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-orange-300"
                title="Apply to Become a Vendor"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Plus Icon */}
                <svg
                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${isHovered ? 'rotate-45' : 'rotate-0'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                </svg>

                {/* Tooltip - Hidden on mobile */}
                <div className={`hidden sm:block absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap transition-all duration-300 pointer-events-none ${
                    isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}>
                    <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                    Apply to Become a Vendor
                </div>

                {/* Pulse Animation */}
                <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-75"></span>
                
                {/* Ring Animation on Hover */}
                {isHovered && (
                    <span className="absolute inset-0 rounded-full bg-orange-300 animate-ping"></span>
                )}
            </Link>
        </div>
    );
};

export default FloatingVendorButton;
