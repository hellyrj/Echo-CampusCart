import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { Heart, ShoppingCart } from 'lucide-react';
import Notifications from './Notifications.jsx';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { wishlistCount } = useWishlist();
    const { totalQuantity } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-blue-600">
                            CampusCart
                        </Link>
                    </div>

                    {/* Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Home
                        </Link>
                        
                        <Link
                            to="/products"
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Products
                        </Link>
                        
                        {isAuthenticated && (
                            <Link
                                to="/cart"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                            >
                                <ShoppingCart className="w-4 h-4 mr-1" />
                                Cart
                                {totalQuantity > 0 && (
                                    <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                                        {totalQuantity}
                                    </span>
                                )}
                            </Link>
                        )}
                        
                        {isAuthenticated && (
                            <Link
                                to="/wishlist"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                            >
                                <Heart className="w-4 h-4 mr-1" />
                                Wishlist
                                {wishlistCount > 0 && (
                                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>
                        )}
                        
                        {isAuthenticated && user?.role === 'vendor' && (
                            <Link
                                to="/my-products"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                My Products
                            </Link>
                        )}
                        
                        {isAuthenticated && user?.role === 'vendor' && (
                            <Link
                                to="/vendor/dashboard"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Vendor Dashboard
                            </Link>
                        )}
                        
                        {isAuthenticated && user?.role === 'admin' && (
                            <Link
                                to="/admin/dashboard"
                                className="text-purple-700 hover:text-purple-800 px-3 py-2 rounded-md text-sm font-medium font-semibold"
                            >
                                Admin Dashboard
                            </Link>
                        )}
                        
                        {isAuthenticated && user?.role !== 'vendor' && user?.role !== 'admin' && (
                            <Link
                                to="/vendor/apply"
                                className="text-orange-600 hover:text-orange-700 px-3 py-2 rounded-md text-sm font-medium font-semibold"
                            >
                                Become a Vendor
                            </Link>
                        )}
                        
                        {isAuthenticated && (
                            <Link
                                to="/profile"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Profile
                            </Link>
                        )}
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <Notifications />
                                <span className="text-gray-700">Welcome, {user?.name}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
