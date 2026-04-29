import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import FloatingVendorButton from './components/FloatingVendorButton';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import MyProducts from './pages/MyProducts';
import VendorDashboard from './pages/VendorDashboard';
import VendorApplication from './pages/VendorApplication';
import VendorPublicPage from './pages/VendorPublicPage';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';

const FallbackRoute = () => {
    const location = useLocation();
    
    // Exclude API routes and uploads from frontend routing
    if (location.pathname.startsWith('/api') || location.pathname.startsWith('/uploads')) {
        return null;
    }
    
    return <Navigate to="/" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <div className="container mx-auto">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/products" element={
                                <ErrorBoundary>
                                    <Products />
                                </ErrorBoundary>
                            } />
                            <Route path="/register" element={<Register />} />
                            <Route path="/vendor/apply" element={
                                <ErrorBoundary>
                                    <VendorApplication />
                                </ErrorBoundary>
                            } />
                            <Route path="/vendor/:vendorId" element={
                                <ErrorBoundary>
                                    <VendorPublicPage />
                                </ErrorBoundary>
                            } />
                            
                            {/* Protected Routes */}
                            <Route element={<PrivateRoute />}>
                                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                                 <Route path="/my-products" element={<MyProducts />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/wishlist" element={<Wishlist />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                                <Route path="/admin/dashboard" element={
                                    <ErrorBoundary>
                                        <AdminDashboard />
                                    </ErrorBoundary>
                                } />
                            </Route>
                            
                            {/* Fallback */}
                            <Route path="*" element={<FallbackRoute />} />
                        </Routes>
                    </div>
                    <FloatingVendorButton />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
