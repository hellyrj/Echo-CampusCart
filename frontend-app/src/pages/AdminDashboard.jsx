import React, { useState, useEffect } from 'react';
import { useAdminApi } from '../hooks/useAdminApi';
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
    FileText
} from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [vendorApplications, setVendorApplications] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    
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
        getSystemStats
    } = useAdminApi();

    // Load initial data
    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [statsResult, applicationsResult, vendorsResult] = await Promise.all([
                getSystemStats(),
                getVendorApplications('pending'),
                getAllVendors()
            ]);

            console.log('Stats result:', statsResult);
            console.log('Applications result:', applicationsResult);
            console.log('Vendors result:', vendorsResult);

            if (statsResult.success) {
                setStats(statsResult.data);
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
        const result = await approveVendorApplication(vendorId);
        if (result.success) {
            loadDashboardData();
            setSelectedVendor(null);
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
            alert(`Error rejecting vendor: ${error.message}`);
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
                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
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

                {/* Vendor Details Modal */}
                {selectedVendor && !showRejectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-semibold">Vendor Details</h3>
                                <button
                                    onClick={() => setSelectedVendor(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-700">User Information</h4>
                                    <p><strong>Name:</strong> {selectedVendor.ownerId?.name || 'Unknown User'}</p>
                                    <p><strong>Email:</strong> {selectedVendor.ownerId?.email || 'No email'}</p>
                                    <p><strong>User ID:</strong> {selectedVendor.ownerId?._id || 'N/A'}</p>
                                </div>
                                
                                <div>
                                    <h4 className="font-medium text-gray-700">Store Information</h4>
                                    <p><strong>Store Name:</strong> {selectedVendor.storeName}</p>
                                    <p><strong>Description:</strong> {selectedVendor.description}</p>
                                    <p><strong>Address:</strong> {selectedVendor.address}</p>
                                    <p><strong>Phone:</strong> {selectedVendor.phone}</p>
                                    <p><strong>University:</strong> {selectedVendor.universityNear}</p>
                                </div>
                                
                                <div>
                                    <h4 className="font-medium text-gray-700">Status</h4>
                                    <p><strong>Application Status:</strong> 
                                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                            selectedVendor.status === 'approved' 
                                                ? 'bg-green-100 text-green-800' 
                                                : selectedVendor.status === 'rejected'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {selectedVendor.status === 'approved' ? 'Approved' : selectedVendor.status === 'rejected' ? 'Rejected' : 'Pending'}
                                        </span>
                                    </p>
                                    <p><strong>Active:</strong> {selectedVendor.isActive ? 'Yes' : 'No'}</p>
                                    {selectedVendor.rejectionReason && (
                                        <p><strong>Rejection Reason:</strong> {selectedVendor.rejectionReason}</p>
                                    )}
                                </div>
                                
                                {selectedVendor.legalDocuments && selectedVendor.legalDocuments.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-700">Legal Documents</h4>
                                        {selectedVendor.legalDocuments.map((doc, index) => (
                                            <div key={index} className="border-l-2 border-gray-200 pl-4 mb-2">
                                                <p><strong>Type:</strong> {doc.documentType}</p>
                                                <p><strong>Uploaded:</strong> {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                                {doc.originalName && (
                                                    <p><strong>File:</strong> {doc.originalName}</p>
                                                )}
                                                <p><strong>Debug - Full document:</strong></p>
                                                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                                                    {JSON.stringify(doc, null, 2)}
                                                </pre>
                                                {doc.fileId ? (
                                                    <a
                                                        href={`/api/vendors/files/${doc.fileId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors mt-2"
                                                    >
                                                        <FileText className="w-3 h-3 mr-1" />
                                                        View Document
                                                    </a>
                                                ) : (
                                                    <p className="text-red-500 text-xs mt-2">No file available - missing fileId</p>
                                                )}
                                            </div>
                                        ))}
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
