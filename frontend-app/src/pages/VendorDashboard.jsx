import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVendorApi } from '../hooks/useVendorApi';
import { useProductApi } from '../hooks/useProductApi';
import { useCategoryApi } from '../hooks/useCategoryApi';
import VendorApplicationForm from '../components/VendorApplicationForm';
import ProductForm from '../components/ProductForm';
import VendorProfile from '../components/VendorProfile';

const VendorDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    
    const { getVendorProducts, createProduct, updateProduct, deleteProduct } = useProductApi();
    const { getCategories } = useCategoryApi();
    const { 
        getMyVendorProfile, 
        submitVendorApplication,
        updateVendor,
        loading: vendorLoading,
        error: vendorError,
        resetError: resetVendorError
    } = useVendorApi();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [applicationStatus, setApplicationStatus] = useState('none'); // 'none', 'pending', 'approved', 'rejected'
    const [applicationData, setApplicationData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkVendorStatus();
        if (user?.role === 'vendor') {
            fetchUserProducts();
            loadCategories();
        }
    }, [user]);

    const loadCategories = async () => {
        try {
            const result = await getCategories();
            if (result.success) {
                const categoriesData = result.data.data || result.data || [];
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const getCategoryNames = (categoryIds) => {
        if (!categoryIds || !Array.isArray(categoryIds)) {
            return 'Uncategorized';
        }
        
        // Debug: log the structure to understand what we're getting
        console.log('Category IDs structure:', categoryIds);
        console.log('Available categories:', categories);
        
        const categoryNames = categoryIds.map(catItem => {
            // Handle different possible structures
            let categoryId;
            
            if (typeof catItem === 'string') {
                categoryId = catItem;
            } else if (typeof catItem === 'object') {
                // It might be a populated category object or an ObjectId wrapper
                if (catItem._id) {
                    // If it's already a populated category object with name, use the name
                    if (catItem.name) {
                        return catItem.name;
                    }
                    categoryId = catItem._id.toString();
                } else if (catItem.toString && catItem.toString() !== '[object Object]') {
                    categoryId = catItem.toString();
                } else {
                    console.log('Unknown category object structure:', catItem);
                    return 'Unknown Category';
                }
            } else {
                console.log('Unknown category type:', typeof catItem, catItem);
                return 'Unknown Category';
            }
            
            // Find category by _id from the loaded categories
            const category = categories.find(cat => {
                const catIdStr = cat._id?.toString() || cat._id;
                return catIdStr === categoryId;
            });
            
            return category?.name || categoryId.substring(0, 8) + '...';
        }).filter(Boolean);
        
        const result = categoryNames.length > 0 ? categoryNames.join(', ') : 'Uncategorized';
        console.log('Final category names:', result);
        return result;
    };

    const fetchUserProducts = async () => {
        try {
            const result = await getVendorProducts();
            if (result.success) {
                // Handle different possible response structures
                const productsData = result.data.data || result.data || [];
                setProducts(Array.isArray(productsData) ? productsData : []);
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
                    const result = await getMyVendorProfile();
                    if (result.success) {
                        const vendorData = result.data.data || result.data;
                        setVendor(vendorData);
                        setApplicationStatus('approved');
                    } else {
                        // User has vendor role but no vendor profile, show create form
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
            
            // Handle FormData (file uploads) vs JSON data
            const result = await submitVendorApplication(applicationData);
            
            if (result.success) {
                setApplicationData(result.data);
                setApplicationStatus('pending');
                setShowCreateForm(false);
                alert('Vendor application submitted successfully! Please wait for admin approval.');
            } else {
                alert(`Failed to submit application: ${result.message}`);
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

    const handleUpdateVendorProfile = async (profileData) => {
        try {
            const result = await updateVendor(vendor._id, profileData);
            if (result.success) {
                const updatedVendor = result.data.data || result.data;
                setVendor(updatedVendor);
                alert('Profile updated successfully!');
            } else {
                alert(`Failed to update profile: ${result.message}`);
            }
        } catch (error) {
            console.error('Error updating vendor profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowProductForm(true);
    };

    const handleProductSubmit = async (productData) => {
        try {
            if (editingProduct) {
                const result = await updateProduct(editingProduct._id, productData);
                if (result.success) {
                    setShowProductForm(false);
                    setEditingProduct(null);
                    fetchUserProducts();
                    alert('Product updated successfully!');
                } else {
                    alert(`Failed to update product: ${result.message}`);
                }
            } else {
                const result = await createProduct(productData);
                if (result.success) {
                    setShowProductForm(false);
                    fetchUserProducts();
                    alert('Product created successfully!');
                } else {
                    alert(`Failed to create product: ${result.message}`);
                }
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product. Please try again.');
        }
    };

    const handleCancelProductForm = () => {
        setShowProductForm(false);
        setEditingProduct(null);
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
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile */}
                    <div className="lg:col-span-1">
                        <VendorProfile 
                            vendor={vendor} 
                            onUpdate={handleUpdateVendorProfile}
                            loading={vendorLoading}
                        />
                    </div>
                    
                    {/* Right Column - Products */}
                    <div className="lg:col-span-2">
                        {showProductForm ? (
                            <ProductForm
                                product={editingProduct}
                                onSubmit={handleProductSubmit}
                                onCancel={handleCancelProductForm}
                                loading={vendorLoading}
                                categories={categories}
                            />
                        ) : (
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {products.map((product) => (
                                            <div key={product._id} className="bg-gray-50 rounded-lg overflow-hidden">
                                                {/* Product Image */}
                                                <div className="h-48 bg-gray-200">
                                                    <img
                                                        src={product.images && product.images.length > 0 
                                                            ? product.images[0].url 
                                                            : 'https://via.placeholder.com/300x200?text=Product'}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                                        }}
                                                    />
                                                </div>
                                                
                                                {/* Product Info */}
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            {getCategoryNames(product.categories)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                                                    <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                                                        <span>Price: ${product.basePrice}</span>
                                                        <span className={`px-2 py-1 rounded ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {product.isAvailable ? 'Available' : 'Out of Stock'}
                                                        </span>
                                                        <span>Stock: {product.inventory?.totalStock || 0}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEditProduct(product)}
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
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
