import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProductApi } from '../hooks/useProductApi';
import { useNavigate } from 'react-router-dom';

const MyProducts = () => {
    const { user, isAuthenticated } = useAuth();
    const { getProducts, createProduct, updateProduct, deleteProduct } = useProductApi();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        
        if (user?.role !== 'vendor') {
            navigate('/');
            return;
        }

        fetchUserProducts();
    }, [isAuthenticated, user, navigate]);

    const fetchUserProducts = async () => {
        try {
            setLoading(true);
            const result = await getProducts();
            if (result.success) {
                // Filter products by current user
                const userProducts = result.data.filter(product => product.vendorId === user._id);
                setProducts(userProducts);
            }
        } catch (error) {
            console.error('Error fetching user products:', error);
             console.log("Type of result.data:", typeof result.data); // Add this line
    console.log("Value of result.data:", result.data);  
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = async (productData) => {
        const result = await createProduct(productData);
        if (result.success) {
            setShowProductForm(false);
            fetchUserProducts();
        }
    };

    const handleUpdateProduct = async (productId, productData) => {
        const result = await updateProduct(productId, productData);
        if (result.success) {
            setEditingProduct(null);
            fetchUserProducts();
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const result = await deleteProduct(productId);
            if (result.success) {
                fetchUserProducts();
            }
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowProductForm(true);
    };

    if (!isAuthenticated || !user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Please login to view your products</h2>
                </div>
            </div>
        );
    }

    if (user.role !== 'vendor') {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
                    <p className="text-gray-600">You need vendor privileges to manage products</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
                    <button
                        onClick={() => {
                            setEditingProduct(null);
                            setShowProductForm(true);
                        }}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                    >
                        Add New Product
                    </button>
                </div>

                {showProductForm ? (
                    <ProductForm
                        product={editingProduct}
                        userId={user._id}
                        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                        onCancel={() => {
                            setShowProductForm(false);
                            setEditingProduct(null);
                        }}
                    />
                ) : (
                    <ProductList
                        products={products}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                    />
                )}
            </div>
        </div>
    );
};

// Product List Component
const ProductList = ({ products, onEdit, onDelete }) => {
    if (products.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600 text-lg">You haven't added any products yet.</p>
                <p className="text-gray-500 text-sm mt-2">Click "Add New Product" to get started!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onEdit(product)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onDelete(product._id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{product.description}</p>
                        
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                            {product.stockQuantity > 0 ? (
                                <span className="text-sm text-green-600 font-medium">In Stock: {product.stockQuantity}</span>
                            ) : (
                                <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                            )}
                        </div>
                        
                        {product.category && (
                            <span className="inline-block px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
                                {product.category}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Product Form Component
const ProductForm = ({ product, onSubmit, onCancel, userId }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        category: product?.category || '',
        stockQuantity: product?.stockQuantity || '',
        images: product?.images || [],
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
            vendorId: userId, // Add vendorId for new products
        };
        
        if (product) {
            onSubmit(product._id, productData);
        } else {
            onSubmit(productData);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {product ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                        <input
                            type="number"
                            name="stockQuantity"
                            value={formData.stockQuantity}
                            onChange={handleChange}
                            min="0"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        {product ? 'Update Product' : 'Add Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MyProducts;
