import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { Heart, ShoppingCart, Package, User, Store, Shield, Plus, LogOut } from 'lucide-react';
import Notifications from './Notifications.jsx';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { wishlistCount } = useWishlist();
    const { totalQuantity } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Role checks
    const isStudent = isAuthenticated && (user?.role === 'student' || user?.role === 'user');
    const isVendor = isAuthenticated && user?.role === 'vendor';
    const isAdmin = isAuthenticated && user?.role === 'admin';

    return (
        <nav style={{ backgroundColor: '#FEFAE0', borderBottom: '1px solid #E5E5E5' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Navigation */}
                    <div className="flex items-center space-x-8">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link 
                                to="/" 
                                className="flex items-center space-x-2 text-xl font-bold transition-opacity hover:opacity-80"
                                style={{ color: '#283618' }}
                            >
                                <ShoppingCart className="w-6 h-6" style={{ color: '#606C38' }} />
                                <span>CampusCart</span>
                            </Link>
                        </div>

                        {/* Navigation - Icons Only with Hierarchy */}
                        <div className="hidden md:flex items-center">
                            {/* Primary Navigation */}
                            <div className="flex items-center space-x-3">
                                <Link 
                                    to="/" 
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                                        location.pathname === '/' ? 'bg-blue-100 text-blue-700' : ''
                                    }`}
                                    style={{ 
                                        color: location.pathname === '/' ? '#ffffff' : '#283618',
                                        backgroundColor: location.pathname === '/' ? '#606C38' : 'transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (location.pathname !== '/') {
                                            e.currentTarget.style.backgroundColor = '#DDA15E20';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (location.pathname !== '/') {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    Home
                                </Link>
                                <Link 
                                    to="/products" 
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                                        location.pathname === '/products' ? 'bg-blue-100 text-blue-700' : ''
                                    }`}
                                    style={{ 
                                        color: location.pathname === '/products' ? '#ffffff' : '#283618',
                                        backgroundColor: location.pathname === '/products' ? '#606C38' : 'transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (location.pathname !== '/products') {
                                            e.currentTarget.style.backgroundColor = '#DDA15E20';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (location.pathname !== '/products') {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    Products
                                </Link>
                            </div>
                            
                            {/* Divider */}
                            <div className="mx-2 h-6 w-px bg-gray-300" />
                            
                            {/* Role-specific Navigation */}
                            <div className="flex items-center space-x-3">
                                {/* Student-only items */}
                                {isStudent && (
                                    <>
                                        <NavIcon to="/orders" icon={<Package size={26} />} priority="secondary" title="My Orders" />
                                    </>
                                )}
                                
                                {/* Center Navigation - Vendor and Profile items */}
                                <div className="flex items-center space-x-3">
                                    {/* Vendor-only items */}
                                    {isVendor && (
                                        <>
                                            <NavIcon to="/vendor/dashboard" icon={<Store size={26} />} priority="secondary" title="Vendor Dashboard" />
                                            <NavIcon to="/vendor/orders" icon={<Package size={26} />} priority="secondary" title="Vendor Orders" />
                                        </>
                                    )}
                                    
                                    {/* Admin-only items */}
                                    {isAdmin && (
                                        <Link
                                            to="/admin/dashboard"
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                                                location.pathname === '/admin/dashboard' ? 'bg-blue-100 text-blue-700' : ''
                                            }`}
                                            style={{ 
                                                color: location.pathname === '/admin/dashboard' ? '#ffffff' : '#283618',
                                                backgroundColor: location.pathname === '/admin/dashboard' ? '#606C38' : 'transparent'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (location.pathname !== '/admin/dashboard') {
                                                    e.currentTarget.style.backgroundColor = '#DDA15E20';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (location.pathname !== '/admin/dashboard') {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }
                                            }}
                                        >
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    
                                    {/* Conditional items */}
                                    {isStudent && !isVendor && (
                                        <Link
                                            to="/vendor/apply"
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                                                location.pathname === '/vendor/apply' ? 'bg-blue-100 text-blue-700' : ''
                                            }`}
                                            style={{ 
                                                color: location.pathname === '/vendor/apply' ? '#ffffff' : '#283618',
                                                backgroundColor: location.pathname === '/vendor/apply' ? '#606C38' : 'transparent'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (location.pathname !== '/vendor/apply') {
                                                    e.currentTarget.style.backgroundColor = '#DDA15E20';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (location.pathname !== '/vendor/apply') {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }
                                            }}
                                        >
                                            Become a Vendor
                                        </Link>
                                    )}
                                    
                                    {/* Profile - always show for authenticated users */}
                                    {isAuthenticated && (
                                        <Link
                                            to="/profile"
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                                                location.pathname === '/profile' ? 'bg-blue-100 text-blue-700' : ''
                                            }`}
                                            style={{ 
                                                color: location.pathname === '/profile' ? '#ffffff' : '#283618',
                                                backgroundColor: location.pathname === '/profile' ? '#606C38' : 'transparent'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (location.pathname !== '/profile') {
                                                    e.currentTarget.style.backgroundColor = '#DDA15E20';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (location.pathname !== '/profile') {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }
                                            }}
                                        >
                                            Profile
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Auth with Responsive Design */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                {/* Mobile Menu Button */}
                                <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" style={{ color: '#283618' }}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                
                                {/* Desktop Auth */}
                                <div className="hidden md:flex items-center gap-3">
                                    {/* Cart and Wishlist for authenticated users */}
                                    {isAuthenticated && (
                                        <>
                                            <NavIcon 
                                                to="/cart" 
                                                icon={<ShoppingCart size={22} />} 
                                                badge={totalQuantity > 0 ? totalQuantity : null}
                                                priority="secondary"
                                                title="Cart"
                                            />
                                            <NavIcon 
                                                to="/wishlist" 
                                                icon={location.pathname === '/wishlist' ? <Heart size={22} fill="#ef4444" /> : <Heart size={22} />} 
                                                badge={wishlistCount > 0 ? wishlistCount : null}
                                                priority="secondary"
                                                title="Wishlist"
                                                isWishlist={true}
                                            />
                                        </>
                                    )}
                                    <Notifications />
                                    <div className="hidden lg:flex items-center gap-4">
                                    <span className="text-sm" style={{ color: '#283618' }}>
                                        Welcome,
                                    </span>
                                    <span className="text-sm font-medium" style={{ color: '#606C38' }}>
                                        {user?.name?.split(' ')[0]}
                                    </span>
                                </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2.5 rounded-lg transition-all duration-200 hover:scale-105"
                                        style={{ backgroundColor: '#DDA15E', color: '#FEFAE0' }}
                                        title="Logout"
                                    >
                                        <LogOut size={22} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                                    style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                                    style={{ backgroundColor: '#DDA15E', color: '#FEFAE0' }}
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

// Reusable NavIcon component with badge support and visual hierarchy
const NavIcon = ({ to, icon, badge, priority = 'primary', title = '', isWishlist = false }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    
    const priorityStyles = {
        primary: {
            color: isActive ? '#ffffff' : '#283618',
            hoverBg: isActive ? '#606C38' : '#DDA15E20',
            size: isActive ? 'w-10 h-10' : 'w-9 h-9',
            iconSize: isActive ? 28 : 26
        },
        secondary: {
            color: isActive && isWishlist ? '#ef4444' : (isActive ? '#ffffff' : '#606C38'),
            hoverBg: isActive ? 'transparent' : '#606C3820',
            size: isActive ? 'w-10 h-10' : 'w-9 h-9',
            iconSize: isActive ? 28 : 26
        },
        admin: {
            color: isActive ? '#ffffff' : '#606C38',
            hoverBg: isActive ? '#606C38' : '#606C3820',
            size: isActive ? 'w-10 h-10' : 'w-9 h-9',
            iconSize: isActive ? 28 : 26
        },
        action: {
            color: isActive ? '#ffffff' : '#DDA15E',
            hoverBg: isActive ? '#606C38' : '#DDA15E20',
            size: isActive ? 'w-10 h-10' : 'w-9 h-9',
            iconSize: isActive ? 28 : 26
        },
        tertiary: {
            color: isActive ? '#ffffff' : '#606C38',
            hoverBg: isActive ? '#606C38' : '#606C3820',
            size: isActive ? 'w-9 h-9' : 'w-8 h-8',
            iconSize: isActive ? 26 : 24
        }
    };
    
    const currentStyle = priorityStyles[priority] || priorityStyles.primary;
    
    return (
        <Link
            to={to}
            className={`relative flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 hover:scale-105 ${currentStyle.size}`}
            style={{ 
                color: currentStyle.color,
                backgroundColor: isActive && !isWishlist ? '#606C38' : 'transparent'
            }}
            title={title}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = currentStyle.hoverBg;
                }
            }}
            onMouseLeave={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }
            }}
        >
            <div style={{ fontSize: `${currentStyle.iconSize}px`, color: isWishlist && isActive ? '#ef4444' : currentStyle.color }}>
                {icon}
            </div>
            {badge && (
                <span 
                    className="absolute -top-1 -right-1 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold shadow-sm"
                    style={{ 
                        backgroundColor: '#DDA15E', 
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