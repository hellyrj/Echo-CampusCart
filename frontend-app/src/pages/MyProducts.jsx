import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProductApi } from '../hooks/useProductApi';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm.jsx';
import { useCategoryApi } from '../hooks/useCategoryApi.js';

const MyProducts = () => {
    const { user, isAuthenticated } = useAuth();
    const { getVendorProducts, createProduct, updateProduct, deleteProduct } = useProductApi();
    const { getCategories } = useCategoryApi();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
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

        fetchData();
    }, [isAuthenticated, user, navigate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch products and categories in parallel
            const [productsResult, categoriesResult] = await Promise.all([
                getVendorProducts(),
                getCategories()
            ]);
            
            if (productsResult.success) {
                setProducts(productsResult.data || []);
            }
            
            if (categoriesResult.success) {
                setCategories(categoriesResult.data || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = async (productData) => {
        try {
            const result = await createProduct(productData);
            if (result.success) {
                setShowCreateForm(false);
                fetchData();
            }
        } catch (error) {
            console.error('Error creating product:', error);
        }
    };

    const handleUpdateProduct = async (productData) => {
        try {
            const result = await updateProduct(editingProduct._id, productData);
            if (result.success) {
                setEditingProduct(null);
                setShowCreateForm(false);
                fetchData();
            }
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const result = await deleteProduct(productId);
                if (result.success) {
                    fetchData();
                }
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowCreateForm(true);
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
                            setShowCreateForm(true);
                        }}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                    >
                        Add New Product
                    </button>
                </div>

                {showCreateForm ? (
                    <ProductForm
                        product={editingProduct}
                        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                        onCancel={() => {
                            setShowCreateForm(false);
                            setEditingProduct(null);
                        }}
                        loading={false}
                        categories={categories}
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
                    {product.images && product.images.length > 0 && (
                        <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                            <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
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
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                        
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-2xl font-bold text-blue-600">${product.basePrice}</span>
                            {product.inventory?.totalStock > 0 ? (
                                <span className="text-sm text-green-600 font-medium">In Stock: {product.inventory.totalStock}</span>
                            ) : (
                                <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                            )}
                        </div>
                        
                        {product.categories && product.categories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {product.categories.map((category, index) => (
                                    <span key={index} className="inline-block px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
                                        {category.name}
                                    </span>
                                ))}
                            </div>
                        )}
                        
                        {product.tags && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {product.tags.map((tag, index) => (
                                    <span key={index} className="inline-block px-2 py-1 text-xs text-gray-500 bg-gray-50 rounded">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyProducts;
