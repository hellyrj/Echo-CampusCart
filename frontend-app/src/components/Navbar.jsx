import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { Heart, ShoppingCart, Package, User, Store, Shield, Plus, LogOut, X, Menu } from 'lucide-react';
import Notifications from './Notifications.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme } = useTheme();
    const { wishlistCount } = useWishlist();
    const { totalQuantity, itemCount, cart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Close mobile menu when window resizes to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            logout();
            navigate('/');
            setIsMobileMenuOpen(false);
        }
    };

    // Role checks
    const isStudent = isAuthenticated && (user?.role === 'student' || user?.role === 'user');
    const isVendor = isAuthenticated && user?.role === 'vendor';
    const isAdmin = isAuthenticated && user?.role === 'admin';

    // Get cart item count
    const cartItemCount = totalQuantity || itemCount || cart?.totalQuantity || cart?.itemCount || 0;

    return (
        <>
            <nav style={{ backgroundColor: theme.surface, borderBottom: `1px solid ${theme.border}`, position: 'sticky', top: 0, zIndex: 1000 }}>
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

                            {/* Desktop Navigation Links */}
                            <div className="hidden md:flex items-center space-x-2">
                                <NavLink to="/" label="Home" isActive={location.pathname === '/'} />
                                <NavLink to="/products" label="Products" isActive={location.pathname === '/products'} />
                                
                                {/* Divider */}
                                <div className="mx-1 h-6 w-px" style={{ backgroundColor: theme.border }} />
                                
                                {/* Student-only items */}
                                {isStudent && (
                                    <>
                                        <NavIcon to="/orders" icon={<Package size={22} />} title="My Orders" isActive={location.pathname === '/orders'} />
                                        <NavIcon to="/my-bookings" icon={<User size={22} />} title="My Bookings" isActive={location.pathname === '/my-bookings'} />
                                    </>
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

                        {/* RIGHT SECTION */}
                        <div className="flex items-center gap-2">
                            {/* Theme Toggle */}
                            <ThemeToggle />
                            
                            {isAuthenticated ? (
                                <>
                                    {/* Desktop Icons */}
                                    <div className="hidden md:flex items-center gap-2">
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
                                        <div className="flex items-center gap-2">
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
                                    </div>
                                    
                                    {/* Mobile Menu Button - Always visible on mobile */}
                                    <button 
                                        className="md:hidden p-2 rounded-lg transition-all duration-200"
                                        style={{ color: theme.text.primary }}
                                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                        aria-label="Menu"
                                    >
                                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                    </button>
                                </>
                            ) : (
                                /* Login/Register for desktop and mobile */
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

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && isAuthenticated && (
                <div className="fixed inset-0 z-[999] md:hidden" style={{ backgroundColor: `${theme.surface}`, overflowY: 'auto' }}>
                    {/* Mobile Menu Content */}
                    <div className="flex flex-col min-h-screen">
                        {/* Header with logo and close button */}
                        <div className="flex justify-between items-center p-4 border-b" style={{ borderBottomColor: theme.border }}>
                            <Link 
                                to="/" 
                                className="flex items-center space-x-2 text-xl font-bold"
                                style={{ color: theme.text.primary }}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <ShoppingCart className="w-5 h-5" style={{ color: theme.text.secondary }} />
                                <span>CampusCart</span>
                            </Link>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 rounded-lg"
                                style={{ color: theme.text.primary }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex-1 py-4 px-4 space-y-1">
                            {/* Main Navigation */}
                            <div className="mb-4">
                                <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-3" style={{ color: theme.text.muted }}>
                                    Main
                                </div>
                                <MobileNavLink to="/" label="Home" isActive={location.pathname === '/'} onClick={() => setIsMobileMenuOpen(false)} />
                                <MobileNavLink to="/products" label="Products" isActive={location.pathname === '/products'} onClick={() => setIsMobileMenuOpen(false)} />
                            </div>

                            {/* Student-only items */}
                            {isStudent && (
                                <div className="mb-4">
                                    <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-3" style={{ color: theme.text.muted }}>
                                        Shopping
                                    </div>
                                    <MobileNavLink to="/cart" label={`Cart (${cartItemCount})`} isActive={location.pathname === '/cart'} onClick={() => setIsMobileMenuOpen(false)} />
                                    <MobileNavLink to="/wishlist" label={`Wishlist (${wishlistCount})`} isActive={location.pathname === '/wishlist'} onClick={() => setIsMobileMenuOpen(false)} />
                                    <MobileNavLink to="/orders" label="My Orders" isActive={location.pathname === '/orders'} onClick={() => setIsMobileMenuOpen(false)} />
                                    <MobileNavLink to="/my-bookings" label="My Bookings" isActive={location.pathname === '/my-bookings'} onClick={() => setIsMobileMenuOpen(false)} />
                                </div>
                            )}
                            
                            {/* Vendor-only items */}
                            {isVendor && (
                                <div className="mb-4">
                                    <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-3" style={{ color: theme.text.muted }}>
                                        Vendor
                                    </div>
                                    <MobileNavLink to="/vendor/dashboard" label="Dashboard" isActive={location.pathname === '/vendor/dashboard'} onClick={() => setIsMobileMenuOpen(false)} />
                                    <MobileNavLink to="/vendor/orders" label="Orders" isActive={location.pathname === '/vendor/orders'} onClick={() => setIsMobileMenuOpen(false)} />
                                    
                                </div>
                            )}
                            
                            {/* Admin-only items */}
                            {isAdmin && (
                                <div className="mb-4">
                                    <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-3" style={{ color: theme.text.muted }}>
                                        Admin
                                    </div>
                                    <MobileNavLink to="/admin/dashboard" label="Admin Dashboard" isActive={location.pathname === '/admin/dashboard'} onClick={() => setIsMobileMenuOpen(false)} />
                                </div>
                            )}
                            
                            {/* Common items */}
                            <div className="mb-4">
                                <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-3" style={{ color: theme.text.muted }}>
                                    Account
                                </div>
                                <MobileNavLink to="/profile" label="Profile" isActive={location.pathname === '/profile'} onClick={() => setIsMobileMenuOpen(false)} />
                                
                                {/* Become Vendor */}
                                {isStudent && !isVendor && (
                                    <MobileNavLink to="/vendor/apply" label="Become a Vendor" isActive={location.pathname === '/vendor/apply'} onClick={() => setIsMobileMenuOpen(false)} />
                                )}
                            </div>
                        </div>

                        {/* User Info and Logout */}
                        <div className="border-t p-4 space-y-3" style={{ borderTopColor: theme.border }}>
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ backgroundColor: theme.background }}>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.secondary, color: theme.text.inverse }}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <div className="font-medium" style={{ color: theme.text.primary }}>
                                        {user?.name || user?.email?.split('@')[0] || 'User'}
                                    </div>
                                    <div className="text-xs" style={{ color: theme.text.muted }}>
                                        {user?.email}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all"
                                style={{ backgroundColor: theme.accent, color: theme.text.inverse }}
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
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

// Icon Navigation Component (Desktop only)
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

// Mobile Navigation Link Component
const MobileNavLink = ({ to, label, isActive = false, onClick }) => {
    const { theme } = useTheme();
    return (
        <Link
            to={to}
            onClick={onClick}
            className="block px-3 py-3 rounded-lg text-base font-medium transition-all"
            style={{ 
                color: isActive ? theme.text.inverse : theme.text.primary,
                backgroundColor: isActive ? theme.secondary : 'transparent'
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = `${theme.accent}10`;
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

export default Navbar;