import React from 'react';
import { useAuth } from '../context/AuthContext';

const AuthDebug = () => {
    const { user, isAuthenticated, loading } = useAuth();
    
    return (
        <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm">
            <h3 className="font-bold mb-2">Auth Debug Info</h3>
            <div className="space-y-1">
                <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
                <p><strong>User ID:</strong> {user?._id || 'None'}</p>
                <p><strong>User Name:</strong> {user?.name || 'None'}</p>
                <p><strong>User Role:</strong> {user?.role || 'None'}</p>
                <p><strong>User Email:</strong> {user?.email || 'None'}</p>
                <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Exists' : 'None'}</p>
            </div>
        </div>
    );
};

export default AuthDebug;
