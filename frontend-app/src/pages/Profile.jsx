import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAuthApi } from '../hooks/useAuthApi';
import { Camera, Edit2, Save, X, Settings, Package, Store } from 'lucide-react';
import { userApi } from '../api/user.api';

const Profile = () => {
    const { user, isAuthenticated, checkAuth } = useAuth();
    const { theme } = useTheme();
    const { getProfile, loading: authLoading } = useAuthApi();
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState('');
    
    // Editing state
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({ name: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated && user) {
            const fetchProfile = async () => {
                try {
                    const result = await getProfile();
                    if (result.success) {
                        setProfileData(result.data.user || result.data);
                        setFormData({ name: result.data.user?.name || result.data?.name || user.name });
                        setPreviewUrl(result.data.user?.profilePicture || result.data?.profilePicture || user.profilePicture || '');
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
                }
            };
            fetchProfile();
        }
    }, [isAuthenticated, user]); // Removed getProfile from dependency

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            const data = new FormData();
            data.append('name', formData.name);
            if (selectedFile) {
                data.append('profilePicture', selectedFile);
            }
            
            const res = await userApi.updateProfile(data);
            if (res.data.success) {
                setIsEditing(false);
                setSelectedFile(null);
                setProfileData(res.data.data.user);
                await checkAuth(); // Make sure context is synced
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isAuthenticated || !user) {
        return (
            <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: theme.background }}>
                <div className="text-center">
                    <h2 className="text-2xl font-bold" style={{ color: theme.text.primary }}>Please login to view your profile</h2>
                </div>
            </div>
        );
    }

    if (authLoading && !profileData) {
        return (
            <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: theme.background }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto" style={{ borderBottomColor: theme.secondary }}></div>
                    <p className="mt-4" style={{ color: theme.text.secondary }}>Loading profile...</p>
                </div>
            </div>
        );
    }

    const initials = (profileData?.name || user.name || 'U').charAt(0).toUpperCase();
    const displayImage = previewUrl || profileData?.profilePicture || user.profilePicture;

    return (
        <div className="min-h-screen pt-8 pb-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: theme.background }}>
            <div className="max-w-4xl mx-auto shadow-xl rounded-2xl overflow-hidden" style={{ backgroundColor: theme.surface }}>
                <div className="h-40 relative" style={{ background: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.primary} 100%)` }}>
                    {/* Header actions */}
                    <div className="absolute top-4 right-4 space-x-2">
                        {!isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 hover:opacity-80 rounded-lg backdrop-blur-sm transition-all flex items-center gap-2"
                                style={{ backgroundColor: `${theme.text.inverse}30`, color: theme.text.inverse }}
                            >
                                <Edit2 size={16} />
                                <span>Edit Profile</span>
                            </button>
                        ) : (
                            <button 
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({ name: profileData?.name || user.name });
                                    setPreviewUrl(profileData?.profilePicture || user.profilePicture || '');
                                    setSelectedFile(null);
                                }}
                                className="px-4 py-2 hover:opacity-80 rounded-lg backdrop-blur-sm transition-all flex items-center gap-2"
                                style={{ backgroundColor: `${theme.text.inverse}30`, color: theme.text.inverse }}
                            >
                                <X size={16} />
                                <span>Cancel</span>
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="px-6 sm:px-10 pb-10">
                    <form onSubmit={handleSave}>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start -mt-20 gap-6">
                            <div className="relative group">
                                <div 
                                    className="w-40 h-40 rounded-full border-4 shadow-lg flex items-center justify-center overflow-hidden bg-white"
                                    style={{ borderColor: theme.surface, backgroundColor: theme.background }}
                                >
                                    {displayImage ? (
                                        <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-5xl font-bold" style={{ color: theme.text.muted }}>
                                            {initials}
                                        </span>
                                    )}
                                </div>
                                
                                {isEditing && (
                                    <div 
                                        className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Camera className="text-white w-10 h-10" />
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                            
                            <div className="mt-20 sm:mt-24 text-center sm:text-left flex-1 w-full">
                                {isEditing ? (
                                    <div className="space-y-4 max-w-md">
                                        <div>
                                            <label className="block text-sm font-medium mb-1" style={{ color: theme.text.primary }}>Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                                                style={{ backgroundColor: theme.background, color: theme.text.primary, borderColor: theme.border, focusRingColor: theme.secondary }}
                                                required
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-3xl font-bold" style={{ color: theme.text.primary }}>{profileData?.name || user.name || 'User'}</h1>
                                        <p className="mt-1" style={{ color: theme.text.secondary }}>{profileData?.email || user.email}</p>
                                        <span className="inline-block px-4 py-1.5 text-sm font-semibold rounded-full mt-3 uppercase tracking-wide shadow-sm"
                                              style={{ backgroundColor: `${theme.accent}15`, color: theme.accent, border: `1px solid ${theme.accent}30` }}>
                                            {profileData?.role || user.role || 'student'}
                                        </span>
                                    </>
                                )}
                            </div>

                            {isEditing && (
                                <div className="mt-20 sm:mt-24 sm:self-center">
                                    <button 
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-2.5 rounded-lg font-medium text-white shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center gap-2"
                                        style={{ backgroundColor: theme.success }}
                                    >
                                        {isSaving ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : (
                                            <Save size={18} />
                                        )}
                                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: `${theme.error}15`, color: theme.error, border: `1px solid ${theme.error}30` }}>
                            <div className="font-medium">{error}</div>
                        </div>
                    )}

                    {!isEditing && (
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Account Details */}
                            <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: theme.text.primary }}>
                                    <Settings className="w-5 h-5" style={{ color: theme.secondary }} />
                                    Account Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between pb-4 border-b" style={{ borderColor: theme.border }}>
                                        <span className="text-sm font-medium" style={{ color: theme.text.muted }}>Email Address</span>
                                        <span className="text-sm font-medium" style={{ color: theme.text.primary }}>{profileData?.email || user.email}</span>
                                    </div>
                                    <div className="flex justify-between pb-4 border-b" style={{ borderColor: theme.border }}>
                                        <span className="text-sm font-medium" style={{ color: theme.text.muted }}>Account Role</span>
                                        <span className="text-sm font-medium capitalize" style={{ color: theme.text.primary }}>{profileData?.role || user.role || 'student'}</span>
                                    </div>
                                    {profileData && profileData.createdAt && (
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium" style={{ color: theme.text.muted }}>Member Since</span>
                                            <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
                                                {new Date(profileData.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
                                <h3 className="text-xl font-bold mb-6" style={{ color: theme.text.primary }}>Quick Actions</h3>
                                <div className="space-y-3">
                                    {(profileData?.role || user.role) === 'vendor' && (
                                        <button className="w-full text-left px-5 py-3.5 text-white rounded-lg transition-all shadow hover:shadow-md flex items-center gap-3 font-medium"
                                                style={{ backgroundColor: theme.secondary }}>
                                            <Store size={18} />
                                            Manage Vendor Store
                                        </button>
                                    )}
                                    <button 
                                        className="w-full text-left px-5 py-3.5 rounded-lg transition-all shadow-sm hover:shadow border flex items-center gap-3 font-medium"
                                        style={{ backgroundColor: theme.surface, color: theme.text.primary, borderColor: theme.border }}
                                    >
                                        <Package size={18} style={{ color: theme.secondary }} />
                                        Order History
                                    </button>
                                    <button 
                                        className="w-full text-left px-5 py-3.5 rounded-lg transition-all shadow-sm hover:shadow border flex items-center gap-3 font-medium"
                                        style={{ backgroundColor: theme.surface, color: theme.text.primary, borderColor: theme.border }}
                                    >
                                        <Settings size={18} style={{ color: theme.secondary }} />
                                        Account Settings
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
