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
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    
                    {/* LEFT SECTION - Logo and Navigation */}
                    <div className="flex items-center space-x-8">
                        {/* Logo */}
                        <Link 
                            to="/" 
                            className="flex items-center space-x-2 text-xl font-bold transition-opacity hover:opacity-80 shrink-0"
                            style={{ color: '#283618' }}
                        >
                            <ShoppingCart className="w-6 h-6" style={{ color: '#606C38' }} />
                            <span>CampusCart</span>
                        </Link>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-2">
                            <NavLink to="/" label="Home" isActive={location.pathname === '/'} />
                            <NavLink to="/products" label="Products" isActive={location.pathname === '/products'} />
                            
                            {/* Divider */}
                            <div className="mx-1 h-6 w-px bg-gray-300" />
                            
                            {/* Student-only items */}
                            {isStudent && (
                                <NavIcon to="/orders" icon={<Package size={22} />} title="My Orders" isActive={location.pathname === '/orders'} />
                            )}
                            
                            {/* Vendor-only items */}
                            {isVendor && (
                                <>
                                    <NavIcon to="/vendor/dashboard" icon={<Store size={22} />} title="Vendor Dashboard" isActive={location.pathname === '/vendor/dashboard'} />
                                    <NavIcon to="/vendor/orders" icon={<Package size={22} />} title="Vendor Orders" isActive={location.pathname === '/vendor/orders'} />
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
                        {isAuthenticated ? (
                            <>
                                {/* Cart and Wishlist */}
                                <NavIcon 
                                    to="/cart" 
                                    icon={<ShoppingCart size={22} />} 
                                    badge={totalQuantity}
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
                                    <span className="text-sm" style={{ color: '#283618' }}>
                                        Hi,
                                    </span>
                                    <span className="text-sm font-medium" style={{ color: '#606C38' }}>
                                        {user?.name?.split(' ')[0]}
                                    </span>
                                </div>
                                
                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center"
                                    style={{ backgroundColor: '#DDA15E', color: '#FEFAE0', width: '38px', height: '38px' }}
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                                
                                {/* Mobile Menu Button */}
                                <button className="md:hidden p-2 rounded-lg" style={{ color: '#283618' }}>
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
                                    style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
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

// Text Navigation Link Component
const NavLink = ({ to, label, isActive = false }) => {
    return (
        <Link
            to={to}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{ 
                color: isActive ? '#ffffff' : '#283618',
                backgroundColor: isActive ? '#606C38' : 'transparent'
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#DDA15E20';
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
    return (
        <Link
            to={to}
            className="relative p-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center"
            style={{ 
                color: isActive ? '#ffffff' : '#283618',
                backgroundColor: isActive ? '#606C38' : 'transparent',
                width: '38px',
                height: '38px'
            }}
            title={title}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#DDA15E20';
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