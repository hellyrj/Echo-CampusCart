import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
    const { isAuthenticated, loading, user } = useAuth();
    
    console.log('PrivateRoute - Loading:', loading);
    console.log('PrivateRoute - IsAuthenticated:', isAuthenticated);
    console.log('PrivateRoute - User:', user);

    if (loading) {
        console.log('PrivateRoute - Showing loading spinner');
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        console.log('PrivateRoute - User authenticated, rendering outlet');
        return <Outlet />;
    } else {
        console.log('PrivateRoute - User not authenticated, redirecting to login');
        return <Navigate to="/login" />;
    }
};

export default PrivateRoute;
