import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Button from '../common/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const cartItemCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">CampusCart</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                isActivePath('/') ? 'text-blue-600 border-b-2 border-blue-600' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                isActivePath('/shop') ? 'text-blue-600 border-b-2 border-blue-600' : ''
              }`}
            >
              Shop
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/cart"
                  className={`relative text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                    isActivePath('/cart') ? 'text-blue-600 border-b-2 border-blue-600' : ''
                  }`}
                >
                  Cart
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                
                <Link
                  to="/profile"
                  className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                    isActivePath('/profile') ? 'text-blue-600 border-b-2 border-blue-600' : ''
                  }`}
                >
                  Profile
                </Link>
                
                {(user.role === 'vendor' || user.role === 'admin') && (
                  <Link
                    to="/dashboard"
                    className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                      isActivePath('/dashboard') ? 'text-blue-600 border-b-2 border-blue-600' : ''
                    }`}
                  >
                    Dashboard
                  </Link>
                )}
                
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                    isActivePath('/login') ? 'text-blue-600 border-b-2 border-blue-600' : ''
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                    isActivePath('/register') ? 'text-blue-600 border-b-2 border-blue-600' : ''
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                  isActivePath('/') ? 'text-blue-600 bg-blue-50' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                  isActivePath('/shop') ? 'text-blue-600 bg-blue-50' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop
              </Link>
              
              {user ? (
                <>
                  <Link
                    to="/cart"
                    className={`relative text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                      isActivePath('/cart') ? 'text-blue-600 bg-blue-50' : ''
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Cart
                    {cartItemCount > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                  
                  <Link
                    to="/profile"
                    className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                      isActivePath('/profile') ? 'text-blue-600 bg-blue-50' : ''
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  
                  {(user.role === 'vendor' || user.role === 'admin') && (
                    <Link
                      to="/dashboard"
                      className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                        isActivePath('/dashboard') ? 'text-blue-600 bg-blue-50' : ''
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="ml-3"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                      isActivePath('/login') ? 'text-blue-600 bg-blue-50' : ''
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                      isActivePath('/register') ? 'text-blue-600 bg-blue-50' : ''
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
