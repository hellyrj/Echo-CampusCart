import React, { useState } from 'react';

const ProductForm = ({ product, onSubmit, onCancel, loading, categories }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        basePrice: product?.basePrice || product?.price || '',
        categories: product?.categories?.map(cat => cat._id) || [],
        tags: product?.tags?.join(', ') || '',
        isAvailable: product?.isAvailable !== false,
        dimensions: product?.dimensions || {
            length: '',
            width: '',
            height: '',
            weight: ''
        },
        inventory: product?.inventory || {
            totalStock: product?.stock || 0,
            lowStockThreshold: 5,
            trackInventory: true
        },
        discount: product?.discount || {
            percentage: 0,
            validUntil: '',
            isActive: false
        }
    });

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState(
        product?.images?.map(img => img.url) || []
    );

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        
        // Create previews for new files
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImagePreviews(newPreviews);
        
        if (index < selectedFiles.length) {
            const newFiles = selectedFiles.filter((_, i) => i !== index);
            setSelectedFiles(newFiles);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Create FormData for file upload
        const submitData = new FormData();
        
        // Add basic fields
        submitData.append('name', formData.name);
        submitData.append('description', formData.description);
        submitData.append('basePrice', formData.basePrice);
        submitData.append('isAvailable', formData.isAvailable);
        
        // Add arrays as JSON strings (only if they're not already arrays)
        // Debug: Check what formData.categories actually contains
        console.log('formData.categories type:', typeof formData.categories);
        console.log('formData.categories value:', formData.categories);
        
        // Ensure categories is properly formatted as JSON array
        let categoriesToSend;
        if (typeof formData.categories === 'string') {
            // If it's already a string, parse it first to ensure it's not double-encoded
            try {
                categoriesToSend = JSON.parse(formData.categories);
            } catch (e) {
                // If parsing fails, it might be a single category ID
                categoriesToSend = [formData.categories];
            }
        } else {
            // If it's an array, use it directly
            categoriesToSend = formData.categories;
        }
        
        console.log('Categories to send:', categoriesToSend);
        submitData.append('categories', JSON.stringify(categoriesToSend));
        
        // Handle tags properly - split comma-separated and filter empty
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        submitData.append('tags', JSON.stringify(tagsArray));
        
        // Clean up dimensions - remove empty values
        const cleanDimensions = Object.fromEntries(
            Object.entries(formData.dimensions).filter(([_, value]) => value !== '')
        );
        if (Object.keys(cleanDimensions).length > 0) {
            submitData.append('dimensions', JSON.stringify(cleanDimensions));
        }
        
        // Clean up inventory - ensure proper types
        const cleanInventory = {
            totalStock: parseInt(formData.inventory.totalStock) || 0,
            lowStockThreshold: parseInt(formData.inventory.lowStockThreshold) || 5,
            trackInventory: formData.inventory.trackInventory
        };
        submitData.append('inventory', JSON.stringify(cleanInventory));
        
        // Clean up discount - only include if percentage > 0
        if (formData.discount.percentage > 0) {
            const cleanDiscount = {
                percentage: parseFloat(formData.discount.percentage) || 0,
                validUntil: formData.discount.validUntil || undefined,
                isActive: formData.discount.isActive
            };
            submitData.append('discount', JSON.stringify(cleanDiscount));
        }
        
        // Add files with correct field name for multer
        selectedFiles.forEach(file => {
            submitData.append('images', file);
        });

        onSubmit(submitData);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {product ? 'Edit Product' : 'Add New Product'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price ($) *
                        </label>
                        <input
                            type="number"
                            name="basePrice"
                            value={formData.basePrice}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categories *
                    </label>
                    <select
                        name="categories"
                        value={formData.categories}
                        onChange={(e) => {
                            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                            setFormData(prev => ({
                                ...prev,
                                categories: selectedOptions
                            }));
                        }}
                        required
                        multiple
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {categories.map((category, index) => (
                            <option key={index} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple categories</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Images
                    </label>
                    <div className="space-y-4">
                        <div>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Upload up to 10 images (JPG, PNG, GIF, WebP - Max 5MB each)
                            </p>
                        </div>
                        
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-md border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags
                    </label>
                    <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="Enter tags separated by commas"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="isAvailable"
                            checked={formData.isAvailable}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Product Available</span>
                    </label>
                </div>

                <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Inventory</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                            <input
                                type="number"
                                value={formData.inventory.totalStock}
                                onChange={(e) => handleNestedChange('inventory', 'totalStock', parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
                            <input
                                type="number"
                                value={formData.inventory.lowStockThreshold}
                                onChange={(e) => handleNestedChange('inventory', 'lowStockThreshold', parseInt(e.target.value) || 5)}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="flex items-center mt-6">
                                <input
                                    type="checkbox"
                                    checked={formData.inventory.trackInventory}
                                    onChange={(e) => handleNestedChange('inventory', 'trackInventory', e.target.checked)}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium text-gray-700">Track Inventory</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Discount (Optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                            <input
                                type="number"
                                value={formData.discount.percentage}
                                onChange={(e) => handleNestedChange('discount', 'percentage', parseFloat(e.target.value) || 0)}
                                min="0"
                                max="100"
                                step="0.1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                            <input
                                type="date"
                                value={formData.discount.validUntil}
                                onChange={(e) => handleNestedChange('discount', 'validUntil', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="flex items-center mt-6">
                                <input
                                    type="checkbox"
                                    checked={formData.discount.isActive}
                                    onChange={(e) => handleNestedChange('discount', 'isActive', e.target.checked)}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium text-gray-700">Active Discount</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Length (cm)</label>
                        <input
                            type="number"
                            value={formData.dimensions.length}
                            onChange={(e) => handleNestedChange('dimensions', 'length', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Width (cm)</label>
                        <input
                            type="number"
                            value={formData.dimensions.width}
                            onChange={(e) => handleNestedChange('dimensions', 'width', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                        <input
                            type="number"
                            value={formData.dimensions.height}
                            onChange={(e) => handleNestedChange('dimensions', 'height', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                        <input
                            type="number"
                            value={formData.dimensions.weight}
                            onChange={(e) => handleNestedChange('dimensions', 'weight', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;