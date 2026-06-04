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
    const { theme } = useTheme();
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
                setStats(statsResult.data.data); // Nested data structure
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
                
                // Close modal and reset form
                setShowRejectModal(false);
                setRejectReason('');
                setSelectedVendor(null);
                
                // Force refresh all data
                console.log('Refreshing dashboard data...');
                await loadDashboardData();
                
                // Show success message
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

    const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
        <div className={`bg-white rounded-lg shadow p-6 border-l-4 border-${color}-500`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm">{title}</p>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                </div>
                <Icon className={`w-8 h-8 text-${color}-500`} />
            </div>
        </div>
    );

    const VendorApplicationCard = ({ application }) => (
        <div className="bg-white rounded-lg shadow p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold">{application.storeName}</h3>
                    <div className="text-sm text-gray-600 mb-1">
                        <strong>Applied by:</strong> {application.ownerId?.name || 'Unknown User'}
                    </div>
                    <p className="text-gray-600 text-sm">
                        <strong>User Email:</strong> {application.ownerId?.email || 'No email'}
                    </p>
                    <p className="text-sm text-gray-500">
                        <strong>Store Phone:</strong> {application.phone}
                    </p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    Pending
                </span>
            </div>
            
            <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">{application.description}</p>
                <p className="text-sm text-gray-500">
                    <strong>Address:</strong> {application.address}
                </p>
                <p className="text-sm text-gray-500">
                    <strong>University:</strong> {application.universityNear}
                </p>
            </div>

            {application.legalDocuments && application.legalDocuments.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Legal Documents:</p>
                    <div className="flex flex-wrap gap-2">
                        {application.legalDocuments.map((doc, index) => {
                            console.log(`Document ${index}:`, doc);
                            console.log(`Document ${index} fileId:`, doc.fileId);
                            console.log(`Document ${index} keys:`, Object.keys(doc));
                            
                            // Use fileId if available, otherwise create a fallback based on index
                            let fileToUse = doc.fileId;
                            
                            if (!fileToUse && doc.originalName) {
                                // Try to match by original name pattern (this is a fallback)
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
                                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
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
                                        <span className="text-xs text-orange-500">
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
                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    <CheckSquare className="w-4 h-4" />
                    Approve
                </button>
                <button
                    onClick={() => {
                        setSelectedVendor(application);
                        setShowRejectModal(true);
                    }}
                    className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    <XCircle className="w-4 h-4" />
                    Reject
                </button>
                <button
                    onClick={() => viewVendorDetails(application)}
                    className="flex items-center gap-1 px-4 py-2 rounded hover:opacity-90 transition-colors"
                    style={{ backgroundColor: '#52B788', color: '#FEFAE0' }}
                >
                    <Eye className="w-4 h-4" />
                    View Details
                </button>
            </div>
        </div>
    );

    const VendorCard = ({ vendor }) => (
        <div className="bg-white rounded-lg shadow p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold">{vendor.storeName}</h3>
                    <div className="text-sm text-gray-600 mb-1">
                        <strong>Owner:</strong> {vendor.ownerId?.name || 'Unknown User'}
                    </div>
                    <p className="text-gray-600 text-sm">
                        <strong>User Email:</strong> {vendor.ownerId?.email || 'No email'}
                    </p>
                    <p className="text-sm text-gray-500">
                        <strong>Store Phone:</strong> {vendor.phone}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                        vendor.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : vendor.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        {vendor.status === 'approved' ? 'Approved' : vendor.status === 'rejected' ? 'Rejected' : 'Pending'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                        vendor.isActive 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {vendor.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>
            
            <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">{vendor.description}</p>
                <p className="text-sm text-gray-500">
                    <strong>Address:</strong> {vendor.address}
                </p>
                <p className="text-sm text-gray-500">
                    <strong>University:</strong> {vendor.universityNear}
                </p>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => viewVendorDetails(vendor)}
                    className="flex items-center gap-1 px-4 py-2 rounded hover:opacity-90 transition-colors"
                    style={{ backgroundColor: '#52B788', color: '#FEFAE0' }}
                >
                    <Eye className="w-4 h-4" />
                    View Details
                </button>
                <button
                    onClick={() => handleToggleVendorStatus(vendor._id, !vendor.isActive)}
                    className={`flex items-center gap-1 px-4 py-2 rounded ${
                        vendor.isActive 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
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
                    className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                        <button onClick={resetError} className="ml-4 text-red-500 hover:text-red-700">
                            ×
                        </button>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-8 border-b">
                    {['overview', 'applications', 'vendors'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === tab
                                    ? ''
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                            style={activeTab === tab ? { borderColor: theme.secondary, color: theme.secondary } : { borderColor: 'transparent' }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-6">System Overview</h2>
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
                            <h2 className="text-xl font-semibold">Vendor Applications</h2>
                            <span className="text-sm text-gray-500">
                                {vendorApplications.length} pending applications
                            </span>
                        </div>
                        
                        {loading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : vendorApplications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
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
                            <h2 className="text-xl font-semibold">All Vendors</h2>
                            <span className="text-sm text-gray-500">
                                {vendors.length} total vendors
                            </span>
                        </div>
                        
                        {loading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : vendors.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
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
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4">Reject Vendor Application</h3>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to reject the application for <strong>{selectedVendor.storeName}</strong>?
                            </p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Please provide a reason for rejection..."
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows="4"
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={handleRejectVendor}
                                    disabled={!rejectReason.trim()}
                                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectReason('');
                                        setSelectedVendor(null);
                                    }}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
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
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4 text-red-600">Delete Vendor</h3>
                            
                            <div className="mb-4">
                                <p className="text-gray-700 mb-2">
                                    Are you sure you want to delete this vendor permanently?
                                </p>
                                <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                                    <p className="text-sm text-red-800">
                                        <strong>⚠️ This action cannot be undone!</strong>
                                    </p>
                                    <p className="text-sm text-red-700 mt-1">
                                        This will permanently delete:
                                    </p>
                                    <ul className="text-sm text-red-700 mt-1 ml-4 list-disc">
                                        <li>The vendor account</li>
                                        <li>All their products</li>
                                        <li>All product reviews</li>
                                        <li>Reset user role to student</li>
                                    </ul>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                                    <p className="text-sm text-gray-700">
                                        <strong>Vendor:</strong> {selectedVendor.storeName}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        <strong>Owner:</strong> {selectedVendor.ownerId?.name || 'Unknown'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type "DELETE" to confirm:
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Type DELETE"
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDeleteVendor}
                                    disabled={deleteConfirmation !== 'DELETE'}
                                    className={`flex-1 px-4 py-2 rounded font-medium ${
                                        deleteConfirmation === 'DELETE'
                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Delete Permanently
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteConfirmation('');
                                        setSelectedVendor(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Vendor Details Modal */}
                {selectedVendor && !showRejectModal && !showDeleteModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: `${theme.text.primary}40` }}>
                        <div className="rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}>
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
                                                    ? 'bg-green-100 text-green-800' 
                                                    : selectedVendor.status === 'rejected'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {selectedVendor.status === 'approved' ? 'Approved' : selectedVendor.status === 'rejected' ? 'Rejected' : 'Pending'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span style={{ color: theme.text.secondary }}>Active:</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                selectedVendor.isActive 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {selectedVendor.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        {selectedVendor.rejectionReason && (
                                            <div className="p-3 rounded" style={{ backgroundColor: '#FEE2E2' }}>
                                                <span className="font-medium" style={{ color: '#991B1B' }}>Rejection Reason:</span>
                                                <p className="mt-1 text-sm" style={{ color: '#991B1B' }}>{selectedVendor.rejectionReason}</p>
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
                                                            className="inline-flex items-center px-3 py-2 rounded text-sm transition-colors mt-2"
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