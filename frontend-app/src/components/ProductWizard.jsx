import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Package, DollarSign, Tag, Image, Settings, Check, X } from 'lucide-react';

const ProductWizard = ({ product, onSubmit, onCancel, loading, categories }) => {
    const [currentStep, setCurrentStep] = useState(1);
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

    const steps = [
        { id: 1, title: 'Basic Info', icon: Package, description: 'Product name and description' },
        { id: 2, title: 'Pricing', icon: DollarSign, description: 'Price and inventory' },
        { id: 3, title: 'Categories', icon: Tag, description: 'Product categories and tags' },
        { id: 4, title: 'Images', icon: Image, description: 'Product photos' },
        { id: 5, title: 'Advanced', icon: Settings, description: 'Dimensions and discounts' }
    ];

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

    const handleCategoryChange = (categoryId) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.includes(categoryId)
                ? prev.categories.filter(id => id !== categoryId)
                : [...prev.categories, categoryId]
        }));
    };

    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const submitData = new FormData();
        
        submitData.append('name', formData.name);
        submitData.append('description', formData.description);
        submitData.append('basePrice', formData.basePrice);
        submitData.append('isAvailable', formData.isAvailable);
        
        submitData.append('categories', JSON.stringify(formData.categories));
        
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        submitData.append('tags', JSON.stringify(tagsArray));
        
        const cleanDimensions = Object.fromEntries(
            Object.entries(formData.dimensions).filter(([_, value]) => value !== '')
        );
        if (Object.keys(cleanDimensions).length > 0) {
            submitData.append('dimensions', JSON.stringify(cleanDimensions));
        }
        
        const cleanInventory = {
            totalStock: parseInt(formData.inventory.totalStock) || 0,
            lowStockThreshold: parseInt(formData.inventory.lowStockThreshold) || 5,
            trackInventory: formData.inventory.trackInventory
        };
        submitData.append('inventory', JSON.stringify(cleanInventory));
        
        if (formData.discount.percentage > 0) {
            const cleanDiscount = {
                percentage: parseFloat(formData.discount.percentage) || 0,
                validUntil: formData.discount.validUntil || undefined,
                isActive: formData.discount.isActive
            };
            submitData.append('discount', JSON.stringify(cleanDiscount));
        }
        
        selectedFiles.forEach(file => {
            submitData.append('images', file);
        });

        onSubmit(submitData);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                Product Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter product name"
                                style={{ borderColor: '#606C38' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                Product Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe your product in detail..."
                                style={{ borderColor: '#606C38' }}
                            />
                        </div>
                    </div>
                );
                
            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                                style={{ borderColor: '#606C38' }}
                            />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium" style={{ color: '#283618' }}>Inventory Settings</h3>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                    Stock Quantity
                                </label>
                                <input
                                    type="number"
                                    value={formData.inventory.totalStock}
                                    onChange={(e) => handleNestedChange('inventory', 'totalStock', parseInt(e.target.value) || 0)}
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ borderColor: '#606C38' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                    Low Stock Alert
                                </label>
                                <input
                                    type="number"
                                    value={formData.inventory.lowStockThreshold}
                                    onChange={(e) => handleNestedChange('inventory', 'lowStockThreshold', parseInt(e.target.value) || 5)}
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ borderColor: '#606C38' }}
                                />
                            </div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.inventory.trackInventory}
                                    onChange={(e) => handleNestedChange('inventory', 'trackInventory', e.target.checked)}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium" style={{ color: '#283618' }}>Track Inventory</span>
                            </label>
                        </div>
                    </div>
                );
                
            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                Categories *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {categories.map((category) => (
                                    <label
                                        key={category._id}
                                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                                            formData.categories.includes(category._id)
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        style={{
                                            borderColor: formData.categories.includes(category._id) ? '#606C38' : '#e5e7eb',
                                            backgroundColor: formData.categories.includes(category._id) ? '#606C3820' : 'transparent'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.categories.includes(category._id)}
                                            onChange={() => handleCategoryChange(category._id)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium">{category.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                Tags
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="Enter tags separated by commas"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderColor: '#606C38' }}
                            />
                        </div>
                    </div>
                );
                
            case 4:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                Product Images
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <div className="flex flex-col items-center">
                                        <Image className="w-12 h-12 mb-3" style={{ color: '#606C38' }} />
                                        <span className="text-sm font-medium" style={{ color: '#283618' }}>
                                            Click to upload images
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1">
                                            PNG, JPG, GIF up to 10MB each
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        {imagePreviews.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium mb-3" style={{ color: '#283618' }}>Image Previews</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border border-gray-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
                
            case 5:
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium mb-4" style={{ color: '#283618' }}>Product Dimensions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                        Length (cm)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.dimensions.length}
                                        onChange={(e) => handleNestedChange('dimensions', 'length', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        style={{ borderColor: '#606C38' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                        Width (cm)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.dimensions.width}
                                        onChange={(e) => handleNestedChange('dimensions', 'width', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        style={{ borderColor: '#606C38' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                        Height (cm)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.dimensions.height}
                                        onChange={(e) => handleNestedChange('dimensions', 'height', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        style={{ borderColor: '#606C38' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                        Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.dimensions.weight}
                                        onChange={(e) => handleNestedChange('dimensions', 'weight', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        style={{ borderColor: '#606C38' }}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-medium mb-4" style={{ color: '#283618' }}>Discount Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                        Discount Percentage
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.discount.percentage}
                                        onChange={(e) => handleNestedChange('discount', 'percentage', parseFloat(e.target.value) || 0)}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        style={{ borderColor: '#606C38' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                        Valid Until
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.discount.validUntil}
                                        onChange={(e) => handleNestedChange('discount', 'validUntil', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        style={{ borderColor: '#606C38' }}
                                    />
                                </div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.discount.isActive}
                                        onChange={(e) => handleNestedChange('discount', 'isActive', e.target.checked)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm font-medium" style={{ color: '#283618' }}>Active Discount</span>
                                </label>
                            </div>
                        </div>
                        
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="isAvailable"
                                checked={formData.isAvailable}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <span className="text-sm font-medium" style={{ color: '#283618' }}>Product Available</span>
                        </label>
                    </div>
                );
                
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-xl">
            {/* Progress Bar */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;
                        
                        return (
                            <div key={step.id} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                            isActive
                                                ? 'bg-blue-500 text-white'
                                                : isCompleted
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}
                                        style={{
                                            backgroundColor: isActive ? '#606C38' : isCompleted ? '#283618' : '#e5e7eb',
                                            color: isActive || isCompleted ? '#FEFAE0' : '#6b7280'
                                        }}
                                    >
                                        {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                                    </div>
                                    <span className="text-xs mt-2 font-medium" style={{ color: '#283618' }}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`w-16 h-1 mx-2 ${
                                            isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                        }`}
                                        style={{ backgroundColor: isCompleted ? '#283618' : '#e5e7eb' }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-semibold" style={{ color: '#283618' }}>
                        {steps[currentStep - 1].title}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {steps[currentStep - 1].description}
                    </p>
                </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6">
                {renderStep()}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    <button
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            currentStep === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        <ChevronLeft className="w-5 h-5 inline mr-2" />
                        Previous
                    </button>

                    {currentStep === steps.length ? (
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 text-white rounded-lg font-medium transition-all hover:scale-105"
                                style={{ backgroundColor: '#606C38' }}
                            >
                                {loading ? 'Creating...' : 'Create Product'}
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="px-6 py-3 text-white rounded-lg font-medium transition-all hover:scale-105"
                            style={{ backgroundColor: '#606C38' }}
                        >
                            Next
                            <ChevronRight className="w-5 h-5 inline ml-2" />
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ProductWizard;
