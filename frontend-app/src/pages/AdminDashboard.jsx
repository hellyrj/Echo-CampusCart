import React, { useState, useEffect } from 'react';
import { useAdminApi } from '../hooks/useAdminApi';
import { useTheme } from '../context/ThemeContext';
import { 
    Users, 
    Store, 
    Package, 
    TrendingUp, 
    CheckCircle, 
    XCircle, 
    Clock,
    Eye,
    Ban,
    CheckSquare,
    AlertCircle,
    FileText,
    Trash2,
    X
} from 'lucide-react';

const AdminDashboard = () => {
    const { theme, colors, isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('overview');
    
    // Debug: Check if user is logged in and has admin role
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    console.log('=== Admin Dashboard Debug ===');
    console.log('Token exists:', !!token);
    console.log('Token:', token ? token.substring(0, 50) + '...' : 'null');
    console.log('User data:', userStr);
    
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            console.log('User role:', user.role);
            console.log('Is admin:', user.role === 'admin');
        } catch (e) {
            console.log('Failed to parse user data:', e);
        }
    }
    
    const [stats, setStats] = useState(null);
    const [vendorApplications, setVendorApplications] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    
    const {
        loading,
        error,
        resetError,
        getVendorApplications,
        getAllVendors,
        getVendorDetails,
        approveVendorApplication,
        rejectVendorApplication,
        toggleVendorStatus,
        deleteVendor,
        getSystemStats
    } = useAdminApi();

    // Load initial data
    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            console.log('Loading dashboard data...');
            const [statsResult, applicationsResult, vendorsResult] = await Promise.all([
                getSystemStats(),
                getVendorApplications('pending'),
                getAllVendors()
            ]);

            console.log('Stats result:', statsResult);
            console.log('Stats result data:', statsResult.data);
            console.log('Stats result success:', statsResult.success);

            if (statsResult.success) {
                console.log('Setting stats:', statsResult.data.data);
                setStats(statsResult.data.data);
            } else {
                console.error('Stats API failed:', statsResult.message);
            }
            if (applicationsResult.success) {
                setVendorApplications(applicationsResult.data.data.applications || []);
            }
            if (vendorsResult.success) {
                setVendors(vendorsResult.data.data.vendors || []);
            }
        } catch (err) {
            console.error('Error loading dashboard data:', err);
        }
    };

    const handleApproveVendor = async (vendorId) => {
        console.log('=== Approve Vendor Debug ===');
        console.log('Approving vendor with ID:', vendorId);
        
        try {
            const result = await approveVendorApplication(vendorId, { approvedBy: 'admin' });
            console.log('Approve result:', result);
            
            if (result.success) {
                loadDashboardData();
                setSelectedVendor(null);
                alert('Vendor application approved successfully!');
            } else {
                console.log('Approve failed:', result.message);
                alert(`Failed to approve vendor: ${result.message}`);
            }
        } catch (error) {
            console.error('Error in handleApproveVendor:', error);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            alert(`Error approving vendor: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleRejectVendor = async () => {
        console.log('=== Reject Vendor Debug ===');
        console.log('Selected vendor:', selectedVendor);
        console.log('Reject reason:', rejectReason);
        console.log('Reject reason trimmed:', rejectReason.trim());
        
        if (!selectedVendor || !rejectReason.trim()) {
            console.log('Early return - missing vendor or reason');
            return;
        }
        
        try {
            console.log('Calling rejectVendorApplication with:', {
                vendorId: selectedVendor._id,
                rejectionReason: rejectReason
            });
            
            const result = await rejectVendorApplication(selectedVendor._id, { rejectionReason: rejectReason });
            
            console.log('Reject result:', result);
            
            if (result.success) {
                console.log('Rejection successful, cleaning up...');
                
                setShowRejectModal(false);
                setRejectReason('');
                setSelectedVendor(null);
                
                console.log('Refreshing dashboard data...');
                await loadDashboardData();
                
                alert('Vendor application rejected successfully!');
            } else {
                console.log('Rejection failed:', result.message);
                alert(`Failed to reject vendor: ${result.message}`);
            }
        } catch (error) {
            console.error('Error in handleRejectVendor:', error);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            alert(`Error rejecting vendor: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleToggleVendorStatus = async (vendorId, isActive) => {
        const result = await toggleVendorStatus(vendorId, isActive);
        if (result.success) {
            loadDashboardData();
        }
    };

    const viewVendorDetails = async (vendor) => {
        setSelectedVendor(vendor);
    };

    const handleDeleteVendor = async () => {
        if (!selectedVendor || deleteConfirmation !== 'DELETE') {
            alert('Please type "DELETE" to confirm vendor deletion');
            return;
        }
        
        const result = await deleteVendor(selectedVendor._id);
        if (result.success) {
            setShowDeleteModal(false);
            setDeleteConfirmation('');
            setSelectedVendor(null);
            loadDashboardData();
            alert(`Vendor "${result.data.vendor.storeName}" deleted successfully!\n\nDeleted:\n- ${result.data.deleted.products} products\n- ${result.data.deleted.reviews} reviews\n- User role reset to student`);
        } else {
            alert(`Error: ${result.message}`);
        }
    };

    const openDeleteModal = (vendor) => {
        setSelectedVendor(vendor);
        setShowDeleteModal(true);
        setDeleteConfirmation('');
    };

    const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
        const getColorStyles = () => {
            switch(color) {
                case 'blue':
                    return { bg: isDark ? '#1E3A5F' : '#EFF6FF', text: '#3B82F6', border: '#3B82F6' };
                case 'green':
                    return { bg: isDark ? '#1A3A2A' : '#ECFDF5', text: '#10B981', border: '#10B981' };
                case 'purple':
                    return { bg: isDark ? '#2E1A5F' : '#F5F3FF', text: '#8B5CF6', border: '#8B5CF6' };
                case 'yellow':
                    return { bg: isDark ? '#3D2E1A' : '#FEF3C7', text: '#F59E0B', border: '#F59E0B' };
                default:
                    return { bg: isDark ? '#1E3A5F' : '#EFF6FF', text: '#3B82F6', border: '#3B82F6' };
            }
        };
        
        const colorStyles = getColorStyles();
        
        return (
            <div className="rounded-lg shadow p-6 border-l-4" style={{ 
                backgroundColor: colors.home.white,
                borderLeftColor: colorStyles.border
            }}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm" style={{ color: colors.home.muted }}>{title}</p>
                        <p className="text-2xl font-bold" style={{ color: colors.home.text }}>{value}</p>
                    </div>
                    <Icon className="w-8 h-8" style={{ color: colorStyles.text }} />
                </div>
            </div>
        );
    };

    const VendorApplicationCard = ({ application }) => (
        <div className="rounded-lg shadow p-6 mb-4" style={{ backgroundColor: colors.home.white }}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold" style={{ color: colors.home.text }}>{application.storeName}</h3>
                    <div className="text-sm mb-1" style={{ color: colors.home.muted }}>
                        <strong style={{ color: colors.home.text }}>Applied by:</strong> {application.ownerId?.name || 'Unknown User'}
                    </div>
                    <p className="text-sm" style={{ color: colors.home.muted }}>
                        <strong style={{ color: colors.home.text }}>User Email:</strong> {application.ownerId?.email || 'No email'}
                    </p>
                    <p className="text-sm" style={{ color: colors.home.muted }}>
                        <strong style={{ color: colors.home.text }}>Store Phone:</strong> {application.phone}
                    </p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: isDark ? '#3D2E1A' : '#FEF3C7', color: isDark ? '#FBBF24' : '#D97706' }}>
                    Pending
                </span>
            </div>
            
            <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: colors.home.muted }}>{application.description}</p>
                <p className="text-sm" style={{ color: colors.home.muted }}>
                    <strong style={{ color: colors.home.text }}>Address:</strong> {application.address}
                </p>
                <p className="text-sm" style={{ color: colors.home.muted }}>
                    <strong style={{ color: colors.home.text }}>University:</strong> {application.universityNear}
                </p>
            </div>

            {application.legalDocuments && application.legalDocuments.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-medium mb-2" style={{ color: colors.home.text }}>Legal Documents:</p>
                    <div className="flex flex-wrap gap-2">
                        {application.legalDocuments.map((doc, index) => {
                            console.log(`Document ${index}:`, doc);
                            console.log(`Document ${index} fileId:`, doc.fileId);
                            console.log(`Document ${index} keys:`, Object.keys(doc));
                            
                            let fileToUse = doc.fileId;
                            
                            if (!fileToUse && doc.originalName) {
                                const knownFiles = [
                                    'documents-1776240984356-756931328.pdf',
                                    'documents-1777042421325-287313303.pdf', 
                                    'documents-1777043581812-136123830.pdf'
                                ];
                                fileToUse = knownFiles[index % knownFiles.length];
                            }
                            
                            return (
                                <div key={index} className="flex flex-col gap-1">
                                    <a
                                        href={fileToUse ? `/api/vendors/files/${fileToUse}` : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1 rounded text-xs transition-colors"
                                        style={{ backgroundColor: isDark ? '#1E3A5F' : '#EFF6FF', color: '#3B82F6' }}
                                        onClick={!fileToUse ? (e) => {
                                            e.preventDefault();
                                            alert(`Document missing fileId. Document data: ${JSON.stringify(doc, null, 2)}`);
                                        } : undefined}
                                    >
                                        <FileText className="w-3 h-3 mr-1" />
                                        {doc.originalName || doc.documentType || `Document ${index + 1}`}
                                        {!doc.fileId && <span className="ml-1 text-orange-500">(Fallback)</span>}
                                    </a>
                                    {!doc.fileId && (
                                        <span className="text-xs" style={{ color: '#F97316' }}>
                                            Using fallback file - fileId missing
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={() => {
                        console.log('Test API connection...');
                        console.log('Application ID:', application._id);
                        console.log('Application data:', application);
                    }}
                    className="flex items-center gap-1 px-4 py-2 rounded hover:opacity-90 mr-2 transition-colors"
                    style={{ backgroundColor: theme.secondary, color: theme.text.inverse }}
                >
                    <AlertCircle className="w-4 h-4" />
                    Test
                </button>
                <button
                    onClick={() => handleApproveVendor(application._id)}
                    className="flex items-center gap-1 px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}
                >
                    <CheckSquare className="w-4 h-4" />
                    Approve
                </button>
                <button
                    onClick={() => {
                        setSelectedVendor(application);
                        setShowRejectModal(true);
                    }}
                    className="flex items-center gap-1 px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
                >
                    <XCircle className="w-4 h-4" />
                    Reject
                </button>
                <button
                    onClick={() => viewVendorDetails(application)}
                    className="flex items-center gap-1 px-4 py-2 rounded hover:opacity-90 transition-colors"
                    style={{ backgroundColor: theme.secondary, color: theme.text.inverse }}
                >
                    <Eye className="w-4 h-4" />
                    View Details
                </button>
            </div>
        </div>
    );

    const VendorCard = ({ vendor }) => (
        <div className="rounded-lg shadow p-6 mb-4" style={{ backgroundColor: colors.home.white }}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold" style={{ color: colors.home.text }}>{vendor.storeName}</h3>
                    <div className="text-sm mb-1" style={{ color: colors.home.muted }}>
                        <strong style={{ color: colors.home.text }}>Owner:</strong> {vendor.ownerId?.name || 'Unknown User'}
                    </div>
                    <p className="text-sm" style={{ color: colors.home.muted }}>
                        <strong style={{ color: colors.home.text }}>User Email:</strong> {vendor.ownerId?.email || 'No email'}
                    </p>
                    <p className="text-sm" style={{ color: colors.home.muted }}>
                        <strong style={{ color: colors.home.text }}>Store Phone:</strong> {vendor.phone}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                        vendor.status === 'approved' 
                            ? (isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                            : vendor.status === 'rejected'
                            ? (isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                            : (isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800')
                    }`}>
                        {vendor.status === 'approved' ? 'Approved' : vendor.status === 'rejected' ? 'Rejected' : 'Pending'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                        vendor.isActive 
                            ? (isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800')
                            : (isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                    }`}>
                        {vendor.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>
            
            <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: colors.home.muted }}>{vendor.description}</p>
                <p className="text-sm" style={{ color: colors.home.muted }}>
                    <strong style={{ color: colors.home.text }}>Address:</strong> {vendor.address}
                </p>
                <p className="text-sm" style={{ color: colors.home.muted }}>
                    <strong style={{ color: colors.home.text }}>University:</strong> {vendor.universityNear}
                </p>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => viewVendorDetails(vendor)}
                    className="flex items-center gap-1 px-4 py-2 rounded hover:opacity-90 transition-colors"
                    style={{ backgroundColor: theme.secondary, color: theme.text.inverse }}
                >
                    <Eye className="w-4 h-4" />
                    View Details
                </button>
                <button
                    onClick={() => handleToggleVendorStatus(vendor._id, !vendor.isActive)}
                    className={`flex items-center gap-1 px-4 py-2 rounded transition-colors ${
                        vendor.isActive 
                            ? 'hover:bg-red-700' 
                            : 'hover:bg-green-700'
                    }`}
                    style={{
                        backgroundColor: vendor.isActive ? '#EF4444' : '#10B981',
                        color: '#FFFFFF'
                    }}
                >
                    {vendor.isActive ? (
                        <>
                            <Ban className="w-4 h-4" />
                            Deactivate
                        </>
                    ) : (
                        <>
                            <CheckSquare className="w-4 h-4" />
                            Activate
                        </>
                    )}
                </button>
                <button
                    onClick={() => openDeleteModal(vendor)}
                    className="flex items-center gap-1 px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen" style={{ 
            backgroundColor: colors.home.cream,
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif"
        }}>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8" style={{ color: colors.home.text }}>Admin Dashboard</h1>

                {/* Error Display */}
                {error && (
                    <div className="border rounded px-4 py-3 mb-6" style={{ 
                        backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2', 
                        borderColor: isDark ? '#991B1B' : '#FCA5A5', 
                        color: isDark ? '#FCA5A5' : '#991B1B' 
                    }}>
                        {error}
                        <button onClick={resetError} className="ml-4 hover:opacity-70">
                            ×
                        </button>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-8 border-b" style={{ borderBottomColor: colors.home.border }}>
                    {['overview', 'applications', 'vendors'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === tab
                                    ? ''
                                    : 'border-transparent hover:opacity-70'
                            }`}
                            style={{
                                borderBottomColor: activeTab === tab ? theme.secondary : 'transparent',
                                color: activeTab === tab ? theme.secondary : colors.home.muted
                            }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-6" style={{ color: colors.home.text }}>System Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                title="Total Users"
                                value={stats?.totalUsers || 0}
                                icon={Users}
                                color="blue"
                            />
                            <StatCard
                                title="Total Vendors"
                                value={stats?.totalVendors || 0}
                                icon={Store}
                                color="green"
                            />
                            <StatCard
                                title="Total Products"
                                value={stats?.totalProducts || 0}
                                icon={Package}
                                color="purple"
                            />
                            <StatCard
                                title="Pending Applications"
                                value={vendorApplications.length}
                                icon={Clock}
                                color="yellow"
                            />
                        </div>
                    </div>
                )}

                {/* Vendor Applications Tab */}
                {activeTab === 'applications' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold" style={{ color: colors.home.text }}>Vendor Applications</h2>
                            <span className="text-sm" style={{ color: colors.home.muted }}>
                                {vendorApplications.length} pending applications
                            </span>
                        </div>
                        
                        {loading ? (
                            <div className="text-center py-8" style={{ color: colors.home.muted }}>Loading...</div>
                        ) : vendorApplications.length === 0 ? (
                            <div className="text-center py-8" style={{ color: colors.home.muted }}>
                                No pending applications
                            </div>
                        ) : (
                            vendorApplications.map((application) => (
                                <VendorApplicationCard key={application._id} application={application} />
                            ))
                        )}
                    </div>
                )}

                {/* Vendors Tab */}
                {activeTab === 'vendors' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold" style={{ color: colors.home.text }}>All Vendors</h2>
                            <span className="text-sm" style={{ color: colors.home.muted }}>
                                {vendors.length} total vendors
                            </span>
                        </div>
                        
                        {loading ? (
                            <div className="text-center py-8" style={{ color: colors.home.muted }}>Loading...</div>
                        ) : vendors.length === 0 ? (
                            <div className="text-center py-8" style={{ color: colors.home.muted }}>
                                No vendors found
                            </div>
                        ) : (
                            vendors.map((vendor) => (
                                <VendorCard key={vendor._id} vendor={vendor} />
                            ))
                        )}
                    </div>
                )}

                {/* Reject Modal */}
                {showRejectModal && selectedVendor && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="rounded-lg p-6 max-w-md w-full mx-4" style={{ backgroundColor: colors.home.white }}>
                            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.home.text }}>Reject Vendor Application</h3>
                            <p className="mb-4" style={{ color: colors.home.muted }}>
                                Are you sure you want to reject the application for <strong style={{ color: colors.home.text }}>{selectedVendor.storeName}</strong>?
                            </p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Please provide a reason for rejection..."
                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                style={{ 
                                    backgroundColor: colors.home.cream, 
                                    borderColor: colors.home.border, 
                                    color: colors.home.text 
                                }}
                                rows="4"
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={handleRejectVendor}
                                    disabled={!rejectReason.trim()}
                                    className="flex-1 py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                                    style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectReason('');
                                        setSelectedVendor(null);
                                    }}
                                    className="flex-1 py-2 px-4 rounded-md hover:opacity-70 transition-colors"
                                    style={{ backgroundColor: '#9CA3AF', color: '#FFFFFF' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Vendor Modal */}
                {showDeleteModal && selectedVendor && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="rounded-lg p-6 max-w-md w-full mx-4" style={{ backgroundColor: colors.home.white }}>
                            <h3 className="text-lg font-semibold mb-4" style={{ color: '#EF4444' }}>Delete Vendor</h3>
                            
                            <div className="mb-4">
                                <p className="mb-2" style={{ color: colors.home.muted }}>
                                    Are you sure you want to delete this vendor permanently?
                                </p>
                                <div className="border rounded p-3 mb-3" style={{ 
                                    backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2', 
                                    borderColor: isDark ? '#991B1B' : '#FCA5A5' 
                                }}>
                                    <p className="text-sm" style={{ color: isDark ? '#FCA5A5' : '#991B1B' }}>
                                        <strong>⚠️ This action cannot be undone!</strong>
                                    </p>
                                    <p className="text-sm mt-1" style={{ color: isDark ? '#FCA5A5' : '#991B1B' }}>
                                        This will permanently delete:
                                    </p>
                                    <ul className="text-sm mt-1 ml-4 list-disc" style={{ color: isDark ? '#FCA5A5' : '#991B1B' }}>
                                        <li>The vendor account</li>
                                        <li>All their products</li>
                                        <li>All product reviews</li>
                                        <li>Reset user role to student</li>
                                    </ul>
                                </div>
                                <div className="border rounded p-3" style={{ 
                                    backgroundColor: colors.home.cream, 
                                    borderColor: colors.home.border 
                                }}>
                                    <p className="text-sm" style={{ color: colors.home.text }}>
                                        <strong>Vendor:</strong> {selectedVendor.storeName}
                                    </p>
                                    <p className="text-sm" style={{ color: colors.home.text }}>
                                        <strong>Owner:</strong> {selectedVendor.ownerId?.name || 'Unknown'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2" style={{ color: colors.home.text }}>
                                    Type "DELETE" to confirm:
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    style={{ 
                                        backgroundColor: colors.home.cream, 
                                        borderColor: colors.home.border, 
                                        color: colors.home.text 
                                    }}
                                    placeholder="Type DELETE"
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDeleteVendor}
                                    disabled={deleteConfirmation !== 'DELETE'}
                                    className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
                                        deleteConfirmation === 'DELETE'
                                            ? 'hover:bg-red-700'
                                            : 'cursor-not-allowed'
                                    }`}
                                    style={{
                                        backgroundColor: deleteConfirmation === 'DELETE' ? '#EF4444' : '#9CA3AF',
                                        color: '#FFFFFF'
                                    }}
                                >
                                    Delete Permanently
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteConfirmation('');
                                        setSelectedVendor(null);
                                    }}
                                    className="flex-1 px-4 py-2 rounded font-medium transition-colors hover:opacity-70"
                                    style={{ backgroundColor: '#9CA3AF', color: '#FFFFFF' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Vendor Details Modal */}
                {selectedVendor && !showRejectModal && !showDeleteModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto" style={{ 
                            backgroundColor: theme.surface, 
                            border: `1px solid ${theme.border}` 
                        }}>
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-xl font-semibold" style={{ color: theme.text.primary }}>Vendor Details</h3>
                                <button
                                    onClick={() => setSelectedVendor(null)}
                                    className="hover:opacity-70 transition-opacity"
                                    style={{ color: theme.text.secondary }}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="space-y-6">
                                {/* User Information */}
                                <div className="p-4 rounded-lg" style={{ backgroundColor: theme.background }}>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: theme.text.primary }}>
                                        <Users className="w-5 h-5" style={{ color: theme.secondary }} />
                                        User Information
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span style={{ color: theme.text.secondary }}>Name:</span>
                                            <span className="font-medium" style={{ color: theme.text.primary }}>{selectedVendor.ownerId?.name || 'Unknown User'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span style={{ color: theme.text.secondary }}>Email:</span>
                                            <span className="font-medium" style={{ color: theme.text.primary }}>{selectedVendor.ownerId?.email || 'No email'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span style={{ color: theme.text.secondary }}>User ID:</span>
                                            <span className="font-medium text-sm" style={{ color: theme.text.primary }}>{selectedVendor.ownerId?._id || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Store Information */}
                                <div className="p-4 rounded-lg" style={{ backgroundColor: theme.background }}>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: theme.text.primary }}>
                                        <Store className="w-5 h-5" style={{ color: theme.secondary }} />
                                        Store Information
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span style={{ color: theme.text.secondary }}>Store Name:</span>
                                            <span className="font-medium" style={{ color: theme.text.primary }}>{selectedVendor.storeName}</span>
                                        </div>
                                        <div>
                                            <span style={{ color: theme.text.secondary }}>Description:</span>
                                            <p className="mt-1 text-sm" style={{ color: theme.text.primary }}>{selectedVendor.description}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <span style={{ color: theme.text.secondary }}>Address:</span>
                                            <span className="font-medium" style={{ color: theme.text.primary }}>{selectedVendor.address}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span style={{ color: theme.text.secondary }}>Phone:</span>
                                            <span className="font-medium" style={{ color: theme.text.primary }}>{selectedVendor.phone}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span style={{ color: theme.text.secondary }}>University:</span>
                                            <span className="font-medium" style={{ color: theme.text.primary }}>{selectedVendor.universityNear}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Status */}
                                <div className="p-4 rounded-lg" style={{ backgroundColor: theme.background }}>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: theme.text.primary }}>
                                        <TrendingUp className="w-5 h-5" style={{ color: theme.secondary }} />
                                        Status
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span style={{ color: theme.text.secondary }}>Application Status:</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                selectedVendor.status === 'approved' 
                                                    ? (isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                                                    : selectedVendor.status === 'rejected'
                                                    ? (isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                                                    : (isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800')
                                            }`}>
                                                {selectedVendor.status === 'approved' ? 'Approved' : selectedVendor.status === 'rejected' ? 'Rejected' : 'Pending'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span style={{ color: theme.text.secondary }}>Active:</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                selectedVendor.isActive 
                                                    ? (isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800')
                                                    : (isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                                            }`}>
                                                {selectedVendor.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        {selectedVendor.rejectionReason && (
                                            <div className="p-3 rounded" style={{ backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2' }}>
                                                <span className="font-medium" style={{ color: isDark ? '#FCA5A5' : '#991B1B' }}>Rejection Reason:</span>
                                                <p className="mt-1 text-sm" style={{ color: isDark ? '#FCA5A5' : '#991B1B' }}>{selectedVendor.rejectionReason}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Legal Documents */}
                                {selectedVendor.legalDocuments && selectedVendor.legalDocuments.length > 0 && (
                                    <div className="p-4 rounded-lg" style={{ backgroundColor: theme.background }}>
                                        <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: theme.text.primary }}>
                                            <FileText className="w-5 h-5" style={{ color: theme.secondary }} />
                                            Legal Documents
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedVendor.legalDocuments.map((doc, index) => (
                                                <div key={index} className="p-3 rounded border" style={{ borderColor: theme.border }}>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm" style={{ color: theme.text.secondary }}>Type:</span>
                                                            <span className="text-sm font-medium" style={{ color: theme.text.primary }}>{doc.documentType}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm" style={{ color: theme.text.secondary }}>Uploaded:</span>
                                                            <span className="text-sm" style={{ color: theme.text.primary }}>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                                        </div>
                                                        {doc.originalName && (
                                                            <div className="flex justify-between">
                                                                <span className="text-sm" style={{ color: theme.text.secondary }}>File:</span>
                                                                <span className="text-sm" style={{ color: theme.text.primary }}>{doc.originalName}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {doc.fileId ? (
                                                        <a
                                                            href={`/api/vendors/files/${doc.fileId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center px-3 py-2 rounded text-sm transition-colors mt-2 hover:opacity-80"
                                                            style={{ backgroundColor: `${theme.secondary}20`, color: theme.secondary }}
                                                        >
                                                            <FileText className="w-4 h-4 mr-2" />
                                                            View Document
                                                        </a>
                                                    ) : (
                                                        <p className="text-sm mt-2" style={{ color: '#DC2626' }}>No file available - missing fileId</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;