import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useVendorApi } from '../hooks/useVendorApi';
import { useProductApi } from '../hooks/useProductApi';
import { useServiceApi } from '../hooks/useServiceApi';
import { useCategoryApi } from '../hooks/useCategoryApi';
import VendorApplicationForm from '../components/VendorApplicationForm';
import ProductWizard from '../components/ProductWizard';
import ServiceCreationForm from '../components/ServiceCreationForm';
import VendorProfile from '../components/VendorProfile';

const VendorDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const { theme, colors, isDark } = useTheme();
    
    const { getVendorProducts, createProduct, updateProduct, deleteProduct } = useProductApi();
    const { getMyServices, createService, updateService, deleteService } = useServiceApi();
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
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showProductForm, setShowProductForm] = useState(false);
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingService, setEditingService] = useState(null);
    const [applicationStatus, setApplicationStatus] = useState('none'); // 'none', 'pending', 'approved', 'rejected'
    const [applicationData, setApplicationData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkVendorStatus();
        if (user?.role === 'vendor') {
            fetchUserProducts();
            fetchUserServices();
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

    const fetchUserServices = async () => {
        try {
            const result = await getMyServices();
            if (result.success) {
                const servicesData = result.data?.services || result.data || [];
                setServices(Array.isArray(servicesData) ? servicesData : []);
            }
        } catch (error) {
            console.error('Error fetching user services:', error);
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

    // Service handlers
    const handleCreateService = async (serviceData) => {
        try {
            const result = await createService(serviceData);
            if (result.success) {
                setShowServiceForm(false);
                fetchUserServices();
                alert('Service created successfully!');
            } else {
                alert(`Failed to create service: ${result.message}`);
            }
        } catch (error) {
            console.error('Error creating service:', error);
            alert('Failed to create service. Please try again.');
        }
    };

    const handleUpdateService = async (serviceData) => {
        try {
            const result = await updateService(editingService._id, serviceData);
            if (result.success) {
                setEditingService(null);
                setShowServiceForm(false);
                fetchUserServices();
                alert('Service updated successfully!');
            } else {
                alert(`Failed to update service: ${result.message}`);
            }
        } catch (error) {
            console.error('Error updating service:', error);
            alert('Failed to update service. Please try again.');
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                const result = await deleteService(serviceId);
                if (result.success) {
                    fetchUserServices();
                    alert('Service deleted successfully!');
                } else {
                    alert(`Failed to delete service: ${result.message}`);
                }
            } catch (error) {
                console.error('Error deleting service:', error);
                alert('Failed to delete service. Please try again.');
            }
        }
    };

    const handleEditService = (service) => {
        setEditingService(service);
        setShowServiceForm(true);
    };

    const handleCancelServiceForm = () => {
        setShowServiceForm(false);
        setEditingService(null);
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
                    <Link
    to="/vendor/orders"
    className="text-white px-6 py-2 rounded-md inline-flex items-center"
    style={{ backgroundColor: theme.primary }}
>
    <Package className="w-4 h-4 mr-2" />
    Manage Orders
</Link>
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
                            className="px-6 py-3 rounded-md"
                                style={{ backgroundColor: theme.primary, color: '#FEFAE0' }}
                        >
                            Apply to Become a Vendor
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8" style={{ backgroundColor: theme.background }}>
            <div className="px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-8" style={{ color: theme.text.primary }}>Vendor Dashboard</h1>
                
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
                    
                    {/* Right Column - Products/Services based on vendorType */}
                    <div className="lg:col-span-2">
                        {/* Service Form */}
                        {showServiceForm ? (
                            <ServiceCreationForm
                                onSubmit={editingService ? handleUpdateService : handleCreateService}
                                onCancel={handleCancelServiceForm}
                                loading={vendorLoading}
                                initialData={editingService}
                            />
                        ) : showProductForm ? (
                            <ProductWizard
                                product={editingProduct}
                                onSubmit={handleProductSubmit}
                                onCancel={handleCancelProductForm}
                                loading={vendorLoading}
                                categories={categories}
                            />
                        ) : (
                            <>
                                {/* Products Section */}
                                {(vendor?.vendorType === 'products' || vendor?.vendorType === 'both') && (
                                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-semibold text-gray-900">Your Products</h2>
                                            <button
                                                onClick={() => setShowProductForm(true)}
                                                className="px-4 py-2 text-white rounded-md"
                                                style={{ backgroundColor: theme.primary }}
                                            >
                                                Add New Product
                                            </button>
                                        </div>

                                        {products.length === 0 ? (
                                            <div className="text-center py-12">
                                                <p className="text-gray-600">You haven't added any products yet.</p>
                                                <button
                                                    onClick={() => setShowProductForm(true)}
                                                    className="mt-4 px-4 py-2 text-white rounded-md"
                                                    style={{ backgroundColor: theme.primary }}
                                                >
                                                    Add Your First Product
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {products.map((product) => (
                                                    <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                                                        {/* Product Image */}
                                                        <div className="h-32 bg-gray-100 flex items-center justify-center">
                                                            <img
                                                                src={product.images && product.images.length > 0
                                                                    ? product.images[0].url
                                                                    : 'https://via.placeholder.com/200x150?text=Product'}
                                                                alt={product.name}
                                                                className="w-full h-full object-contain p-2"
                                                                onError={(e) => {
                                                                    e.target.src = 'https://via.placeholder.com/200x150?text=No+Image';
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Product Info */}
                                                        <div className="p-3">
                                                            <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate" title={product.name}>{product.name}</h3>
                                                            <p className="text-xs text-gray-600 mb-2 line-clamp-2" title={product.description}>{product.description}</p>
                                                            <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                                                                <span className="font-medium" style={{ color: '#606C38' }}>${product.basePrice}</span>
                                                                <span className={`px-2 py-0.5 rounded text-xs ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                    {product.isAvailable ? 'Available' : 'Out of Stock'}
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleEditProduct(product)}
                                                                    className="flex-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteProduct(product._id)}
                                                                    className="flex-1 px-2 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 transition-colors"
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

                                {/* Services Section */}
                                {(vendor?.vendorType === 'services' || vendor?.vendorType === 'both') && (
                                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-semibold text-gray-900">Your Services</h2>
                                            <button
                                                onClick={() => setShowServiceForm(true)}
                                                className="px-4 py-2 text-white rounded-md"
                                                style={{ backgroundColor: theme.primary }}
                                            >
                                                Add New Service
                                            </button>
                                        </div>

                                        {services.length === 0 ? (
                                            <div className="text-center py-12">
                                                <p className="text-gray-600">You haven't added any services yet.</p>
                                                <button
                                                    onClick={() => setShowServiceForm(true)}
                                                    className="mt-4 px-4 py-2 text-white rounded-md"
                                                    style={{ backgroundColor: theme.primary }}
                                                >
                                                    Add Your First Service
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {services.map((service) => (
                                                    <div key={service._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                                                        {/* Service Image */}
                                                        <div className="h-32 bg-gray-100 flex items-center justify-center">
                                                            {service.images && service.images.length > 0 ? (
                                                                <img
                                                                    src={service.images[0].startsWith('http') ? service.images[0] : `http://localhost:5000/uploads/${service.images[0]}`}
                                                                    alt={service.title}
                                                                    className="w-full h-full object-contain p-2"
                                                                    onError={(e) => {
                                                                        e.target.src = 'https://via.placeholder.com/200x150?text=Service';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full" style={{ background: 'linear-gradient(to bottom right, #606C3810, #606C3820)' }}>
                                                                    <span className="text-sm font-medium" style={{ color: '#606C38' }}>Service</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Service Info */}
                                                        <div className="p-3">
                                                            <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate" title={service.title}>{service.title}</h3>
                                                            <p className="text-xs text-gray-600 mb-2 line-clamp-2" title={service.description}>{service.description}</p>
                                                            <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                                                                <span className="font-medium" style={{ color: '#606C38' }}>{service.pricingModel === 'hourly' ? `${service.basePrice}/hr` : service.basePrice ? `$${service.basePrice}` : 'Quote'}</span>
                                                                <span className={`px-2 py-0.5 rounded text-xs ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                    {service.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleEditService(service)}
                                                                    className="flex-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteService(service._id)}
                                                                    className="flex-1 px-2 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 transition-colors"
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

                                {/* Empty state for vendors with no offerings */}
                                {vendor?.vendorType && products.length === 0 && services.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-lg shadow-md p-6">
                                        <p className="text-gray-600 mb-4">
                                            {vendor.vendorType === 'products' ? 'You haven\'t added any products yet.' :
                                             vendor.vendorType === 'services' ? 'You haven\'t added any services yet.' :
                                             'You haven\'t added any products or services yet.'}
                                        </p>
                                        <div className="flex justify-center gap-4">
                                            {(vendor.vendorType === 'products' || vendor.vendorType === 'both') && (
                                                <button
                                                    onClick={() => setShowProductForm(true)}
                                                    className="px-4 py-2 text-white rounded-md"
                                                    style={{ backgroundColor: theme.primary }}
                                                >
                                                    Add Product
                                                </button>
                                            )}
                                            {(vendor.vendorType === 'services' || vendor.vendorType === 'both') && (
                                                <button
                                                    onClick={() => setShowServiceForm(true)}
                                                    className="px-4 py-2 text-white rounded-md"
                                                    style={{ backgroundColor: theme.primary }}
                                                >
                                                    Add Service
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
