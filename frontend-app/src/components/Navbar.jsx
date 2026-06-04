import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { Heart, ShoppingCart, Package, User, Store, Shield, Plus, LogOut } from 'lucide-react';
import Notifications from './Notifications.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme } = useTheme();
    const { wishlistCount } = useWishlist();
    const { totalQuantity, itemCount, cart } = useCart(); // Updated to use correct cart properties
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Role checks
    const isStudent = isAuthenticated && (user?.role === 'student' || user?.role === 'user');
    const isVendor = isAuthenticated && user?.role === 'vendor';
    const isAdmin = isAuthenticated && user?.role === 'admin';

    // Get cart item count - use totalQuantity or itemCount or calculate from cart.items
    const cartItemCount = totalQuantity || itemCount || cart?.totalQuantity || cart?.itemCount || 0;

    return (
        <nav style={{ backgroundColor: theme.surface, borderBottom: `1px solid ${theme.border}` }}>
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    
                    {/* LEFT SECTION - Logo and Navigation */}
                    <div className="flex items-center space-x-8">
                        {/* Logo */}
                        <Link 
                            to="/" 
                            className="flex items-center space-x-2 text-2xl font-bold transition-opacity hover:opacity-50 shrink-0"
                            style={{ color: theme.text.primary }}
                        >
                            <ShoppingCart className="w-6 h-6" style={{ color: theme.text.secondary }} />
                            <span>CampusCart</span>
                        </Link>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-2">
                            <NavLink to="/" label="Home" isActive={location.pathname === '/'} />
                            <NavLink to="/products" label="Products" isActive={location.pathname === '/products'} />
                            
                            {/* Divider */}
                            <div className="mx-1 h-6 w-px" style={{ backgroundColor: theme.border }} />
                            
                            {/* Student-only items */}
                            {isStudent && (
                                <NavIcon to="/orders" icon={<Package size={22} />} title="My Orders" isActive={location.pathname === '/orders'} />
                            )}
                            
                            {/* Vendor-only items */}
                            {isVendor && (
                                <>
                                    <NavLink to="/vendor/dashboard" label="Dashboard" isActive={location.pathname === '/vendor/dashboard'} />
                                    <NavLink to="/vendor/orders" label="Orders" isActive={location.pathname === '/vendor/orders'} />
                                </>
                            )}
                            
                            {/* Admin-only items */}
                            {isAdmin && (
                                <NavLink to="/admin/dashboard" label="Admin" isActive={location.pathname === '/admin/dashboard'} />
                            )}
                            
                            {/* Become Vendor */}
                            {isStudent && !isVendor && (
                                <NavLink to="/vendor/apply" label="Become a Vendor" isActive={location.pathname === '/vendor/apply'} />
                            )}
                            
                            {/* Profile */}
                            {isAuthenticated && (
                                <NavLink to="/profile" label="Profile" isActive={location.pathname === '/profile'} />
                            )}
                        </div>
                    </div>

                    {/* RIGHT SECTION - Pushed to far right corner */}
                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        <ThemeToggle />
                        
                        {isAuthenticated ? (
                            <>
                                {/* Cart and Wishlist */}
                                <NavIcon 
                                    to="/cart" 
                                    icon={<ShoppingCart size={22} />} 
                                    badge={cartItemCount}
                                    title="Cart"
                                    isActive={location.pathname === '/cart'}
                                />
                                <NavIcon 
                                    to="/wishlist" 
                                    icon={<Heart size={22} />} 
                                    badge={wishlistCount}
                                    title="Wishlist"
                                    isActive={location.pathname === '/wishlist'}
                                />
                                
                                <Notifications />
                                
                                {/* User greeting */}
                                <div className="hidden lg:flex items-center gap-2">
                                    <span className="text-sm" style={{ color: theme.text.primary }}>
                                        Hi,
                                    </span>
                                    <span className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                                        {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
                                    </span>
                                </div>
                                
                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center"
                                    style={{ backgroundColor: theme.accent, color: theme.text.inverse, width: '38px', height: '38px' }}
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                                
                                {/* Mobile Menu Button */}
                                <button className="md:hidden p-2 rounded-lg" style={{ color: theme.text.primary }}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </>
                        ) : (
                            /* Login/Register - Pushed to far right corner */
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                                    style={{ backgroundColor: theme.secondary, color: theme.text.inverse }}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                                    style={{ backgroundColor: theme.accent, color: theme.text.inverse }}
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

// Text Navigation Link Component
const NavLink = ({ to, label, isActive = false }) => {
    const { theme } = useTheme();
    return (
        <Link
            to={to}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{ 
                color: isActive ? theme.text.inverse : theme.text.primary,
                backgroundColor: isActive ? theme.secondary : 'transparent'
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = `${theme.accent}20`;
                }
            }}
            onMouseLeave={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }
            }}
        >
            {label}
        </Link>
    );
};

// Icon Navigation Component
const NavIcon = ({ to, icon, badge, title = '', isActive = false }) => {
    const { theme } = useTheme();
    return (
        <Link
            to={to}
            className="relative p-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center"
            style={{ 
                color: isActive ? theme.text.inverse : theme.text.primary,
                backgroundColor: isActive ? theme.secondary : 'transparent',
                width: '38px',
                height: '38px'
            }}
            title={title}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = `${theme.accent}20`;
                }
            }}
            onMouseLeave={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }
            }}
        >
            {icon}
            {badge > 0 && (
                <span 
                    className="absolute -top-1 -right-1 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold shadow-sm"
                    style={{ 
                        backgroundColor: theme.accent, 
                        fontSize: '10px',
                        lineHeight: '1'
                    }}
                >
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </Link>
    );
};

export default Navbar;