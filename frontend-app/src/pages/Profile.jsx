import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuthApi } from '../hooks/useAuthApi';

const Profile = () => {
    const { user, isAuthenticated } = useAuth();
    const { getProfile, loading, error } = useAuthApi();
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        if (isAuthenticated && user) {
            const fetchProfile = async () => {
                try {
                    const result = await getProfile();
                    if (result.success) {
                        setProfileData(result.data);
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
                }
            };
            fetchProfile();
        }
    }, [isAuthenticated, user, getProfile]);

    if (!isAuthenticated || !user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Please login to view your profile</h2>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32"></div>
                <div className="px-6 pb-6">
                    <div className="flex items-center -mt-16">
                        <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white flex items-center justify-center">
                            <span className="text-3xl font-bold text-gray-600">
                                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="ml-6 mt-16">
                            <h1 className="text-3xl font-bold text-gray-900">{user.name || 'User'}</h1>
                            <p className="text-gray-600">{user.email}</p>
                            <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-800 bg-blue-100 rounded-full mt-2">
                                {user.role || 'user'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Role</p>
                                    <p className="font-medium capitalize">{user.role || 'user'}</p>
                                </div>
                                {profileData && (
                                    <>
                                        <div>
                                            <p className="text-sm text-gray-500">Member Since</p>
                                            <p className="font-medium">
                                                {new Date(profileData.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                {user.role === 'vendor' && (
                                    <button className="w-full text-left px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        Manage Vendor Store
                                    </button>
                                )}
                                <button className="w-full text-left px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                                    Order History
                                </button>
                                <button className="w-full text-left px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                                    Settings
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
