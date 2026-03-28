import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vendorApi } from '../api/vendor.api';
import { useProductApi } from '../hooks/useProductApi';
import VendorApplicationForm from '../components/VendorApplicationForm';

const VendorDashboard = () => {
    const { user } = useAuth();
    const { getProducts, createProduct, updateProduct, deleteProduct } = useProductApi();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [products, setProducts] = useState([]);
    const [showProductForm, setShowProductForm] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState('none'); // 'none', 'pending', 'approved', 'rejected'
    const [applicationData, setApplicationData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkVendorStatus();
        if (user?.role === 'vendor') {
            fetchUserProducts();
        }
    }, [user]);

    const fetchUserProducts = async () => {
        try {
            const result = await getProducts();
            if (result.success) {
                // Handle different possible response structures
                const productsData = result.data?.data || result.data || [];
                console.log('Products data:', productsData);
                
                // Filter products by current user
                const userProducts = Array.isArray(productsData) 
                    ? productsData.filter(product => product.vendorId === user._id)
                    : [];
                setProducts(userProducts);
            }
        } catch (error) {
            console.error('Error fetching user products:', error);
        }
    };

    const checkVendorStatus = async () => {
        try {
            if (user?.role === 'vendor') {
                // User is already a vendor, try to get vendor profile
                try {
                    const result = await vendorApi.getVendor(user._id);
                    console.log('Vendor profile response:', result);
                    if (result.data.success) {
                        const vendorData = result.data.data || result.data;
                        setVendor(vendorData);
                        setApplicationStatus('approved');
                    } else {
                        // User has vendor role but no vendor profile, show create form
                        console.log('No vendor profile found, showing create form');
                        setShowCreateForm(true);
                    }
                } catch (error) {
                    console.error('Error fetching vendor profile:', error);
                    if (error.response?.status === 404) {
                        // Vendor profile doesn't exist, show create form
                        setShowCreateForm(true);
                    } else {
                        // Other error, still show create form
                        setShowCreateForm(true);
                    }
                }
            } else if (user?.role === 'student') {
                // User is a student, check if they have a pending application
                // For now, we'll assume they need to apply
                setApplicationStatus('none');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Error checking vendor status:', error);
            if (user?.role === 'vendor') {
                setShowCreateForm(true);
            }
        }
    };

    const handleVendorApplicationSubmit = async (applicationData) => {
        try {
            setLoading(true);
            const response = await vendorApi.submitVendorApplication(applicationData);
            
            if (response.data.success) {
                setApplicationData(response.data.data);
                setApplicationStatus('pending');
                setShowCreateForm(false);
                alert('Vendor application submitted successfully! Please wait for admin approval.');
            } else {
                alert(`Failed to submit application: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error submitting vendor application:', error);
            alert('Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = async (productData) => {
        try {
            const result = await createProduct(productData);
            if (result.success) {
                setShowProductForm(false);
                fetchUserProducts();
                alert('Product created successfully!');
            } else {
                alert(`Failed to create product: ${result.message}`);
            }
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product. Please try again.');
        }
    };

    const handleUpdateProduct = async (productId, productData) => {
        try {
            const result = await updateProduct(productId, productData);
            if (result.success) {
                fetchUserProducts();
                alert('Product updated successfully!');
            } else {
                alert(`Failed to update product: ${result.message}`);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product. Please try again.');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const result = await deleteProduct(productId);
                if (result.success) {
                    fetchUserProducts();
                    alert('Product deleted successfully!');
                } else {
                    alert(`Failed to delete product: ${result.message}`);
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product. Please try again.');
            }
        }
    };

    const renderApplicationStatus = () => {
        switch (applicationStatus) {
            case 'pending':
                return (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <div className="text-yellow-800">
                            <h3 className="text-lg font-semibold mb-2">Application Under Review</h3>
                            <p className="mb-4">Your vendor application is being reviewed by our admin team.</p>
                            <p className="text-sm text-yellow-600">You will be notified once a decision is made.</p>
                        </div>
                    </div>
                );
            
            case 'rejected':
                return (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <div className="text-red-800">
                            <h3 className="text-lg font-semibold mb-2">Application Rejected</h3>
                            <p className="mb-4">
                                Your application was rejected. 
                                {applicationData?.rejectionReason && (
                                    <span className="block mt-2 text-sm">
                                        Reason: {applicationData.rejectionReason}
                                    </span>
                                )}
                            </p>
                            <button
                                onClick={() => setApplicationStatus('none')}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Submit New Application
                            </button>
                        </div>
                    </div>
                );
            
            case 'approved':
                return (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="text-green-800">
                            <h3 className="text-lg font-semibold mb-2">Vendor Account Approved!</h3>
                            <p className="mb-4">Congratulations! Your vendor account has been approved.</p>
                            <p className="text-sm text-green-600">You can now start adding products to your store.</p>
                        </div>
                    </div>
                );
            
            default:
                return null;
        }
    };

    if (applicationStatus === 'pending' || applicationStatus === 'rejected') {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Vendor Dashboard</h1>
                    {renderApplicationStatus()}
                </div>
            </div>
        );
    }

    if (showCreateForm && applicationStatus === 'none') {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Vendor Dashboard</h1>
                    <VendorApplicationForm 
                        onSubmit={handleVendorApplicationSubmit} 
                        loading={loading}
                    />
                </div>
            </div>
        );
    }

    if (!vendor && user?.role !== 'vendor') {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Vendor Dashboard</h1>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Become a Vendor</h3>
                        <p className="text-gray-600 mb-6">
                            Start selling your products to students by becoming a vendor on CampusCart.
                        </p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Apply to Become a Vendor
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Vendor Dashboard</h1>
                
                {applicationStatus === 'approved' && renderApplicationStatus()}
                
                {vendor && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Store</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Store Name</p>
                                <p className="font-medium">{vendor.storeName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="font-medium text-green-600">Active</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Your Products</h2>
                        <button
                            onClick={() => setShowProductForm(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Add New Product
                        </button>
                    </div>

                    {products.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600">You haven't added any products yet.</p>
                            <button
                                onClick={() => setShowProductForm(true)}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Add Your First Product
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div key={product._id} className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                                    <p className="text-lg font-bold text-blue-600 mb-4">${product.basePrice || product.price}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateProduct(product._id, product)}
                                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product._id)}
                                            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
