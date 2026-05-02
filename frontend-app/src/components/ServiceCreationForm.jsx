import React, { useState, useEffect } from 'react';
import { useServiceApi } from '../hooks/useServiceApi';

const ServiceCreationForm = ({ onSubmit, loading, initialData = null }) => {
    const { getServiceCategories } = useServiceApi();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        serviceCategory: '',
        pricingModel: 'fixed',
        basePrice: '',
        minimumHours: '1',
        estimatedDuration: '',
        serviceLocation: 'in_person',
        canTravel: false,
        travelRadius: '3000',
        travelFee: '0',
        customerRequirements: '',
        tags: '',
        availability: {
            weekdays: true,
            weekends: true,
            evenings: true,
            specificHours: ''
        },
        images: []
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadCategories();
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const loadCategories = async () => {
        try {
            console.log('Loading service categories...');
            const result = await getServiceCategories();
            console.log('Service categories response:', result);
            if (result.success) {
                const categoriesData = result.data || [];
                console.log('Categories data:', categoriesData);
                setCategories(categoriesData);
            } else {
                console.error('Failed to load categories:', result.message);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.startsWith('availability.')) {
            const availabilityField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                availability: {
                    ...prev.availability,
                    [availabilityField]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'Service title is required';
        }
        
        if (!formData.description.trim()) {
            newErrors.description = 'Service description is required';
        } else if (formData.description.trim().length < 10) {
            newErrors.description = 'Service description must be at least 10 characters';
        }
        
        if (!formData.serviceCategory) {
            newErrors.serviceCategory = 'Service category is required';
        }
        
        if (!formData.pricingModel) {
            newErrors.pricingModel = 'Pricing model is required';
        }
        
        if (!formData.basePrice || parseFloat(formData.basePrice) < 0) {
            newErrors.basePrice = 'Valid base price is required';
        }
        
        if (formData.pricingModel === 'hourly' && (!formData.minimumHours || parseFloat(formData.minimumHours) < 0.5)) {
            newErrors.minimumHours = 'Minimum hours must be at least 0.5';
        }
        
        if (formData.canTravel && (!formData.travelRadius || parseFloat(formData.travelRadius) < 100)) {
            newErrors.travelRadius = 'Travel radius must be at least 100 meters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Prepare data for submission
        const submissionData = {
            ...formData,
            basePrice: parseFloat(formData.basePrice),
            minimumHours: formData.pricingModel === 'hourly' ? parseFloat(formData.minimumHours) : undefined,
            estimatedDuration: formData.estimatedDuration ? parseFloat(formData.estimatedDuration) : undefined,
            travelRadius: formData.canTravel ? parseFloat(formData.travelRadius) : undefined,
            travelFee: formData.canTravel ? parseFloat(formData.travelFee) : undefined,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        
        onSubmit(submissionData);
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {initialData ? 'Edit Service' : 'Create New Service'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter service title"
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.title ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service Category *
                        </label>
                        <select
                            name="serviceCategory"
                            value={formData.serviceCategory}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.serviceCategory ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                        {errors.serviceCategory && (
                            <p className="mt-1 text-sm text-red-600">{errors.serviceCategory}</p>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Description *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your service in detail..."
                        rows="4"
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pricing Model *
                        </label>
                        <select
                            name="pricingModel"
                            value={formData.pricingModel}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.pricingModel ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="fixed">Fixed Price</option>
                            <option value="hourly">Hourly Rate</option>
                            <option value="package">Package Deal</option>
                            <option value="quote">Contact for Quote</option>
                        </select>
                        {errors.pricingModel && (
                            <p className="mt-1 text-sm text-red-600">{errors.pricingModel}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Base Price (ETB) *
                        </label>
                        <input
                            type="number"
                            name="basePrice"
                            value={formData.basePrice}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.basePrice ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.basePrice && (
                            <p className="mt-1 text-sm text-red-600">{errors.basePrice}</p>
                        )}
                    </div>

                    {formData.pricingModel === 'hourly' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Hours *
                            </label>
                            <input
                                type="number"
                                name="minimumHours"
                                value={formData.minimumHours}
                                onChange={handleInputChange}
                                placeholder="1"
                                min="0.5"
                                step="0.5"
                                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.minimumHours ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.minimumHours && (
                                <p className="mt-1 text-sm text-red-600">{errors.minimumHours}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Service Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service Location *
                        </label>
                        <select
                            name="serviceLocation"
                            value={formData.serviceLocation}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="in_person">In-person Only</option>
                            <option value="online">Online Only</option>
                            <option value="both">Both Online & In-person</option>
                        </select>
                    </div>

                    {formData.serviceLocation !== 'online' && (
                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="canTravel"
                                    checked={formData.canTravel}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                                />
                                <span className="text-sm font-medium text-gray-700">I can travel to customers</span>
                            </label>
                        </div>
                    )}
                </div>

                {formData.canTravel && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Travel Radius (meters) *
                            </label>
                            <input
                                type="number"
                                name="travelRadius"
                                value={formData.travelRadius}
                                onChange={handleInputChange}
                                placeholder="3000"
                                min="100"
                                step="100"
                                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.travelRadius ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.travelRadius && (
                                <p className="mt-1 text-sm text-red-600">{errors.travelRadius}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Travel Fee (ETB)
                            </label>
                            <input
                                type="number"
                                name="travelFee"
                                value={formData.travelFee}
                                onChange={handleInputChange}
                                placeholder="0"
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estimated Duration (hours)
                        </label>
                        <input
                            type="number"
                            name="estimatedDuration"
                            value={formData.estimatedDuration}
                            onChange={handleInputChange}
                            placeholder="e.g., 2.5"
                            min="0.5"
                            step="0.5"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            placeholder="e.g., tutoring, math, exam prep"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Customer Requirements */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Requirements
                    </label>
                    <textarea
                        name="customerRequirements"
                        value={formData.customerRequirements}
                        onChange={handleInputChange}
                        placeholder="What should customers provide or prepare for this service?"
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Availability */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Availability
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="availability.weekdays"
                                checked={formData.availability.weekdays}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                            />
                            <span className="text-sm text-gray-700">Weekdays</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="availability.weekends"
                                checked={formData.availability.weekends}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                            />
                            <span className="text-sm text-gray-700">Weekends</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="availability.evenings"
                                checked={formData.availability.evenings}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                            />
                            <span className="text-sm text-gray-700">Evenings</span>
                        </label>
                        <input
                            type="text"
                            name="availability.specificHours"
                            value={formData.availability.specificHours}
                            onChange={handleInputChange}
                            placeholder="Specific hours (e.g., 9 AM - 5 PM)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Images */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Images (Max 5)
                    </label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-5 gap-2">
                            {formData.images.map((image, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-20 object-cover rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : (initialData ? 'Update Service' : 'Create Service')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ServiceCreationForm;
