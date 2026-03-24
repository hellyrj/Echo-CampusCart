import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVendorApi } from '../hooks/useVendorApi';
import { useProductApi } from '../hooks/useProductApi';

const VendorDashboard = () => {
    const { user } = useAuth();
    const { createVendor, getVendor, loading } = useVendorApi();
    const { getProducts, createProduct, updateProduct, deleteProduct } = useProductApi();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [products, setProducts] = useState([]);
    const [showProductForm, setShowProductForm] = useState(false);

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
                // Filter products by current user
                const userProducts = result.data.filter(product => product.vendorId === user._id);
                setProducts(userProducts);
            }
        } catch (error) {
            console.error('Error fetching user products:', error);
        }
    };

    const checkVendorStatus = async () => {
        try {
            // For now, we'll check if user has vendor role
            if (user?.role === 'vendor') {
                // Try to get vendor profile
                const result = await getVendor(user._id);
                if (result.success) {
                    setVendor(result.data);
                } else {
                    setShowCreateForm(true);
                }
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Error checking vendor status:', error);
            setShowCreateForm(true);
        }
    };

    const handleSubmitVendor = async (vendorData) => {
        const result = await createVendor(vendorData);
        if (result.success) {
            setVendor(result.data);
            setShowCreateForm(false);
        }
    };

    const handleCreateProduct = async (productData) => {
        const result = await createProduct(productData);
        if (result.success) {
            setShowProductForm(false);
            fetchUserProducts(); // Refresh products list
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const result = await deleteProduct(productId);
            if (result.success) {
                fetchUserProducts(); // Refresh products list
            }
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Please login to access vendor dashboard</p>
                </div>
            </div>
        );
    }

    if (user.role !== 'vendor') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
                    <p className="text-gray-600">You don't have vendor privileges</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Vendor Dashboard</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Vendor Section */}
                    <div className="lg:col-span-1">
                        {showCreateForm ? (
                            <CreateVendorForm onSubmit={handleSubmitVendor} />
                        ) : vendor ? (
                            <VendorProfile vendor={vendor} />
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-600">Loading vendor information...</p>
                            </div>
                        )}
                    </div>

                    {/* Products Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Your Products</h2>
                                <button
                                    onClick={() => setShowProductForm(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    Add Product
                                </button>
                            </div>

                            {showProductForm ? (
                                <CreateProductForm 
                                    onSubmit={handleCreateProduct}
                                    onCancel={() => setShowProductForm(false)}
                                    userId={user._id}
                                />
                            ) : (
                                <ProductList 
                                    products={products}
                                    onDelete={handleDeleteProduct}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Create Vendor Form Component
const CreateVendorForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        storeName: '',
        description: '',
        address: '',
        phone: '',
        logo: '',
        deliveryAvailable: true,
        pickupAvailable: true,
        deliveryRadius: 3000,
        deliveryFee: 0,
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Your Vendor Store</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
                        Store Name
                    </label>
                    <input
                        type="text"
                        name="storeName"
                        id="storeName"
                        value={formData.storeName}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        name="description"
                        id="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Address
                    </label>
                    <input
                        type="text"
                        name="address"
                        id="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="deliveryAvailable"
                                checked={formData.deliveryAvailable}
                                onChange={(e) => setFormData({...formData, deliveryAvailable: e.target.checked})}
                                className="mr-2"
                            />
                            Delivery Available
                        </label>
                    </div>
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="pickupAvailable"
                                checked={formData.pickupAvailable}
                                onChange={(e) => setFormData({...formData, pickupAvailable: e.target.checked})}
                                className="mr-2"
                            />
                            Pickup Available
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Create Vendor Store
                </button>
            </form>
        </div>
    );
};

// Vendor Profile Component
const VendorProfile = ({ vendor }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Store Information</h2>
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Store Name</h3>
                    <p className="text-gray-600">{vendor.storeName}</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                    <p className="text-gray-600">{vendor.description}</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-600">{vendor.address}</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600">{vendor.phone}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Delivery</h3>
                        <p className="text-gray-600">{vendor.deliveryAvailable ? 'Available' : 'Not Available'}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Pickup</h3>
                        <p className="text-gray-600">{vendor.pickupAvailable ? 'Available' : 'Not Available'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Product List Component
const ProductList = ({ products, onDelete }) => {
    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">You haven't added any products yet.</p>
                <p className="text-gray-500 text-sm mt-2">Click "Add Product" to get started!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
                <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                            <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                            <div className="mt-2">
                                <span className="text-lg font-bold text-blue-600">${product.price}</span>
                                {product.stockQuantity > 0 ? (
                                    <span className="ml-4 text-sm text-green-600">In Stock: {product.stockQuantity}</span>
                                ) : (
                                    <span className="ml-4 text-sm text-red-600">Out of Stock</span>
                                )}
                            </div>
                            {product.category && (
                                <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                                    {product.category}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => onDelete(product._id)}
                            className="ml-4 text-red-600 hover:text-red-800"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Create Product Form Component
const CreateProductForm = ({ onSubmit, onCancel, userId }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stockQuantity: '',
        images: [],
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            stockQuantity: parseInt(formData.stockQuantity),
            vendorId: userId, // Add vendorId
        };
        onSubmit(productData);
    };

    return (
        <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Product</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                        <input
                            type="number"
                            name="stockQuantity"
                            value={formData.stockQuantity}
                            onChange={handleChange}
                            min="0"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Add Product
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VendorDashboard;
