import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import AuthDebug from './components/AuthDebug';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import MyProducts from './pages/MyProducts';
import VendorDashboard from './pages/VendorDashboard';
import VendorApplication from './pages/VendorApplication';
import Profile from './pages/Profile';

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
                            
                            {/* Protected Routes */}
                            <Route element={<PrivateRoute />}>
                                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                                 <Route path="/my-products" element={<MyProducts />} />
                                <Route path="/profile" element={<Profile />} />
                            </Route>
                            
                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                    <AuthDebug />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
