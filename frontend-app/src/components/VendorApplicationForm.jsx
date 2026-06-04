import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVendorApi } from '../hooks/useVendorApi';
import LocationInput from './LocationInput';
import LocationPicker from './LocationPicker';

const VendorApplicationForm = ({ onSubmit, loading, initialData }) => {
    const { user } = useAuth();
    const { getUniversities, getCategories } = useVendorApi();
    const [formData, setFormData] = useState({
        storeName: initialData?.storeName || '',
        description: initialData?.description || '',
        phone: initialData?.phone || '',
        universityNear: initialData?.universityNear || '',
        vendorType: initialData?.vendorType || 'products',
        deliveryAvailable: initialData?.deliveryAvailable || false,
        pickupAvailable: initialData?.pickupAvailable || false,
        deliveryRadius: initialData?.deliveryRadius || 3000,
        deliveryFee: initialData?.deliveryFee || 0,
        selectedLocation: initialData?.location ? {
            lat: initialData.location.coordinates[1],
            lng: initialData.location.coordinates[0],
            placeName: initialData.address
        } : null
    });
    const [errors, setErrors] = useState({});
    const [universities, setUniversities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentStep, setCurrentStep] = useState(initialData ? 1 : 1);
    const totalSteps = 3;

    useEffect(() => {
        loadUniversities();
        loadCategories();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                storeName: initialData.storeName || '',
                description: initialData.description || '',
                phone: initialData.phone || '',
                universityNear: initialData.universityNear || '',
                vendorType: initialData.vendorType || 'products',
                deliveryAvailable: initialData.deliveryAvailable || false,
                pickupAvailable: initialData.pickupAvailable || false,
                deliveryRadius: initialData.deliveryRadius || 3000,
                deliveryFee: initialData.deliveryFee || 0,
                selectedLocation: initialData.location ? {
                    lat: initialData.location.coordinates[1],
                    lng: initialData.location.coordinates[0],
                    placeName: initialData.address
                } : null
            });
        }
    }, [initialData]);

    const loadUniversities = async () => {
        try {
            const result = await getUniversities();
            console.log('VendorApplicationForm - Universities result:', result); // Debug log
            if (result.success) {
                const universitiesData = result.data.data || result.data || [];
                console.log('VendorApplicationForm - Universities data:', universitiesData); // Debug log
                console.log('VendorApplicationForm - Universities type:', typeof universitiesData);
                console.log('VendorApplicationForm - Is array:', Array.isArray(universitiesData));
                setUniversities(Array.isArray(universitiesData) ? universitiesData : []);
            } else {
                console.error('Failed to load universities:', result.message);
            }
        } catch (error) {
            console.error('Error loading universities:', error);
        }
    };

    const loadCategories = async () => {
        try {
            const result = await getCategories();
            console.log('VendorApplicationForm - Categories result:', result); // Debug log
            if (result.success) {
                const categoriesData = result.data.data || result.data || [];
                console.log('VendorApplicationForm - Categories data:', categoriesData); // Debug log
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } else {
                console.error('Failed to load categories:', result.message);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            // Validate current step before proceeding
            let stepValid = true;
            if (currentStep === 1) {
                const storeNameError = !formData.storeName.trim() || formData.storeName.trim().length < 3
                    ? 'Store name must be at least 3 characters'
                    : '';
                const descriptionError = !formData.description.trim() ? 'Please describe what you sell' : '';

                if (storeNameError || descriptionError) {
                    setErrors({
                        storeName: storeNameError,
                        description: descriptionError
                    });
                    stepValid = false;
                } else {
                    setErrors({});
                }
            } else if (currentStep === 2) {
                if (!formData.selectedLocation || !formData.phone.trim()) {
                    setErrors({
                        location: !formData.selectedLocation ? 'Please select your campus location' : '',
                        phone: !formData.phone.trim() ? 'Phone number is required' : ''
                    });
                    stepValid = false;
                } else {
                    setErrors({});
                }
            }
            
            if (stepValid) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setErrors({});
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        
        // Clear related delivery errors when user changes delivery options
        if (name === 'deliveryAvailable' || name === 'pickupAvailable') {
            setErrors(prev => ({
                ...prev,
                deliveryOptions: ''
            }));
        }
        
        if (name === 'deliveryRadius') {
            setErrors(prev => ({
                ...prev,
                deliveryRadius: ''
            }));
        }
        
        if (name === 'deliveryFee') {
            setErrors(prev => ({
                ...prev,
                deliveryFee: ''
            }));
        }
    };

    const handleLocationChange = (locationDetails) => {
        setFormData(prev => ({
            ...prev,
            locationDetails,
            // Update individual location fields
            placeName: locationDetails?.placeName || '',
            fullAddress: locationDetails?.fullAddress || '',
            landmark: locationDetails?.landmark || '',
            area: locationDetails?.area || '',
            city: locationDetails?.city || '',
            state: locationDetails?.state || '',
            postalCode: locationDetails?.postalCode || '',
            country: locationDetails?.country || 'Nigeria',
            // Also update the address field for backward compatibility
            address: locationDetails?.fullAddress || ''
        }));
        
        // Clear location error
        if (errors.address) {
            setErrors(prev => ({
                ...prev,
                address: ''
            }));
        }
    };

    const handleDocumentChange = (index, field, value) => {
        const updatedDocuments = [...formData.legalDocuments];
        updatedDocuments[index] = {
            ...updatedDocuments[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            legalDocuments: updatedDocuments
        }));
    };

    const handleFileChange = (index, file) => {
        const updatedDocuments = [...formData.legalDocuments];
        updatedDocuments[index] = {
            ...updatedDocuments[index],
            file: file,
            documentUrl: file.name, // Temporary display name
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        };
        setFormData(prev => ({
            ...prev,
            legalDocuments: updatedDocuments
        }));
    };

    const addDocument = () => {
        setFormData(prev => ({
            ...prev,
            legalDocuments: [...prev.legalDocuments, { 
                documentType: 'business_license', 
                documentUrl: '', 
                file: null,
                fileName: '',
                fileSize: 0,
                fileType: ''
            }]
        }));
    };

    const removeDocument = (index) => {
        setFormData(prev => ({
            ...prev,
            legalDocuments: prev.legalDocuments.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        console.log('Validating form data:', formData);

        if (!formData.storeName.trim() || formData.storeName.trim().length < 3) {
            newErrors.storeName = 'Store name must be at least 3 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Please describe what you sell';
        }

        if (!formData.selectedLocation) {
            newErrors.location = 'Please select your campus location';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }

        if (!formData.universityNear.trim()) {
            newErrors.universityNear = 'University selection is required';
        }

        // Validate at least one delivery option is selected
        if (!formData.deliveryAvailable && !formData.pickupAvailable) {
            newErrors.deliveryOptions = 'Please select at least one delivery option';
        }

        // Validate phone format (more flexible - just check it has some digits)
        if (formData.phone && formData.phone.trim().length < 3) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        console.log('Validation errors:', newErrors);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('Form submission started', formData);
        console.log('Form data details:', {
            storeName: formData.storeName,
            description: formData.description,
            phone: formData.phone,
            universityNear: formData.universityNear,
            vendorType: formData.vendorType,
            selectedLocation: formData.selectedLocation,
            deliveryAvailable: formData.deliveryAvailable,
            pickupAvailable: formData.pickupAvailable
        });

        // Manual validation check
        const validationErrors = validateForm();
        if (!validationErrors) {
            console.log('Form validation failed', errors);
            // Show specific error messages
            if (!formData.storeName.trim() || formData.storeName.trim().length < 3) alert('Store name must be at least 3 characters');
            else if (!formData.description.trim()) alert('Store description is required');
            else if (!formData.selectedLocation) alert('Please select your campus location');
            else if (!formData.phone.trim()) alert('Phone number is required');
            else if (!formData.universityNear.trim()) alert('University selection is required');
            else if (!formData.deliveryAvailable && !formData.pickupAvailable) alert('Please select at least one delivery option');
            return;
        }

        console.log('Form validation passed, submitting...');

        try {
            // For updates, send JSON instead of FormData
            const dataToSend = {
                storeName: formData.storeName,
                description: formData.description,
                phone: formData.phone,
                universityNear: formData.universityNear,
                vendorType: formData.vendorType,
                deliveryAvailable: formData.deliveryAvailable,
                pickupAvailable: formData.pickupAvailable,
                deliveryRadius: formData.deliveryRadius,
                deliveryFee: formData.deliveryFee,
                address: formData.selectedLocation?.placeName || 'Campus Location'
            };

            // Add location if provided
            if (formData.selectedLocation) {
                dataToSend.location = {
                    type: "Point",
                    coordinates: [formData.selectedLocation.lng, formData.selectedLocation.lat]
                };
            }

            console.log('Calling onSubmit with data:', dataToSend);
            console.log('Data type:', typeof dataToSend);
            console.log('Data keys:', Object.keys(dataToSend));

            try {
                const result = await onSubmit(dataToSend);
                console.log('onSubmit result:', result);
            } catch (error) {
                console.error('onSubmit error:', error);
                throw error;
            }

            console.log('Form submission completed');
        } catch (error) {
            console.error('Form submission error:', error);
            alert('Failed to submit application. Please try again.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FEFAE0' }}>
            {/* Progress Indicator - Only show for new vendors, not for editing */}
            {!initialData && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                        step <= currentStep
                                            ? 'text-white'
                                            : 'text-gray-400'
                                    }`}
                                    style={{
                                        backgroundColor: step <= currentStep ? '#606C38' : '#e5e7eb'
                                    }}
                                >
                                    {step}
                                </div>
                                {step < 3 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 ${
                                            step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: '#606C38' }}>
                        <span>Basic Info</span>
                        <span>Location</span>
                        <span>Delivery</span>
                    </div>
                </div>
            )}

            <h2 className="text-2xl font-bold mb-6" style={{ color: '#283618' }}>
                {initialData ? 'Update Your Store Information' : 'Start Selling on Campus'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Show all fields at once when editing, otherwise use multi-step */}
                {initialData ? (
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                Store Name *
                            </label>
                            <input
                                type="text"
                                name="storeName"
                                value={formData.storeName}
                                onChange={handleInputChange}
                                placeholder="What's your store called?"
                                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 border-2 ${
                                    errors.storeName ? 'border-red-500' : 'border-gray-300'
                                }`}
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    borderColor: errors.storeName ? '#dc2626' : '#606C38',
                                    focusRingColor: '#606C38'
                                }}
                            />
                            {errors.storeName && (
                                <p className="mt-1 text-sm" style={{ color: '#dc2626' }}>{errors.storeName}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                What are you selling? *
                            </label>
                            <select
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 border-2 ${
                                    errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    borderColor: errors.description ? '#dc2626' : '#606C38',
                                    focusRingColor: '#606C38'
                                }}
                            >
                                <option value="">Select a category</option>
                                {categories.length > 0 ? (
                                    categories.map((category) => (
                                        <option key={category._id || category.name} value={category.name || category}>
                                            {category.name || category}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>Loading categories...</option>
                                )}
                            </select>
                            {errors.description && (
                                <p className="mt-1 text-sm" style={{ color: '#dc2626' }}>{errors.description}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                Type of Business *
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {['products', 'services', 'both'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, vendorType: type }))}
                                        className={`px-4 py-3 rounded-lg font-medium transition-all ${
                                            formData.vendorType === type
                                                ? 'text-white'
                                                : 'border-2'
                                        }`}
                                        style={{
                                            backgroundColor: formData.vendorType === type ? '#606C38' : 'transparent',
                                            borderColor: '#606C38',
                                            color: formData.vendorType === type ? '#FEFAE0' : '#606C38'
                                        }}
                                    >
                                        {type === 'products' ? '📦 Products' : type === 'services' ? '🔧 Services' : '🎯 Both'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Location & Contact */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                Your Campus Location *
                            </label>
                            <LocationPicker
                                initialLocation={formData.selectedLocation || { lat: 9.0092, lng: 38.7578 }}
                                onLocationSelect={(location) => {
                                    setFormData(prev => ({ ...prev, selectedLocation: location }));
                                    if (errors.location) {
                                        setErrors(prev => ({ ...prev, location: undefined }));
                                    }
                                }}
                                height="300px"
                                placeholder="Find your spot on campus..."
                            />
                            {errors.location && (
                                <p className="mt-1 text-sm" style={{ color: '#dc2626' }}>{errors.location}</p>
                            )}
                            <p className="mt-1 text-xs" style={{ color: '#606C38', opacity: 0.7 }}>
                                📍 Click on map or search to find your exact campus location
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Your contact number"
                                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 border-2 ${
                                    errors.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    borderColor: errors.phone ? '#dc2626' : '#606C38',
                                    focusRingColor: '#606C38'
                                }}
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm" style={{ color: '#dc2626' }}>{errors.phone}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                Nearest University *
                            </label>
                            <select
                                name="universityNear"
                                value={formData.universityNear}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 border-2 ${
                                    errors.universityNear ? 'border-red-500' : 'border-gray-300'
                                }`}
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    borderColor: errors.universityNear ? '#dc2626' : '#606C38',
                                    focusRingColor: '#606C38'
                                }}
                            >
                                <option value="">Select your university</option>
                                {universities.map((university) => (
                                    <option key={university._id || university.name} value={university.name || university}>
                                        {university.name || university}
                                    </option>
                                ))}
                            </select>
                            {errors.universityNear && (
                                <p className="mt-1 text-sm" style={{ color: '#dc2626' }}>{errors.universityNear}</p>
                            )}
                        </div>

                        {/* Delivery Options */}
                        <div>
                            <label className="block text-sm font-medium mb-4" style={{ color: '#283618' }}>
                                How can students get your stuff?
                            </label>
                            {errors.deliveryOptions && (
                                <p className="mb-3 text-sm" style={{ color: '#dc2626' }}>{errors.deliveryOptions}</p>
                            )}
                            <div className="space-y-4">
                                <label className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105"
                                    style={{
                                        borderColor: formData.deliveryAvailable ? '#606C38' : '#e5e7eb',
                                        backgroundColor: formData.deliveryAvailable ? '#606C3810' : 'transparent'
                                    }}>
                                    <input
                                        type="checkbox"
                                        name="deliveryAvailable"
                                        checked={formData.deliveryAvailable}
                                        onChange={handleInputChange}
                                        className="mr-3"
                                        style={{ accentColor: '#606C38' }}
                                    />
                                    <div>
                                        <div className="font-medium" style={{ color: '#283618' }}>🚚 I can deliver</div>
                                        <div className="text-sm" style={{ color: '#606C38' }}>Bring items to students on campus</div>
                                    </div>
                                </label>

                                <label className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105"
                                    style={{
                                        borderColor: formData.pickupAvailable ? '#606C38' : '#e5e7eb',
                                        backgroundColor: formData.pickupAvailable ? '#606C3810' : 'transparent'
                                    }}>
                                    <input
                                        type="checkbox"
                                        name="pickupAvailable"
                                        checked={formData.pickupAvailable}
                                        onChange={handleInputChange}
                                        className="mr-3"
                                        style={{ accentColor: '#606C38' }}
                                    />
                                    <div>
                                        <div className="font-medium" style={{ color: '#283618' }}>📍 Students can pick up</div>
                                        <div className="text-sm" style={{ color: '#606C38' }}>Students come to my location</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {formData.deliveryAvailable && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                        Delivery Area
                                    </label>
                                    <select
                                        name="deliveryRadius"
                                        value={formData.deliveryRadius}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 border-2 border-gray-300"
                                        style={{
                                            backgroundColor: '#FFFFFF',
                                            borderColor: '#606C38',
                                            focusRingColor: '#606C38'
                                        }}
                                    >
                                        <option value={1000}>My building only</option>
                                        <option value={3000}>Campus area</option>
                                        <option value={5000}>Near campus</option>
                                        <option value={10000}>Whole city</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                        Delivery Fee
                                    </label>
                                    <select
                                        name="deliveryFee"
                                        value={formData.deliveryFee}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 border-2 border-gray-300"
                                        style={{
                                            backgroundColor: '#FFFFFF',
                                            borderColor: '#606C38',
                                            focusRingColor: '#606C38'
                                        }}
                                    >
                                        <option value={0}>Free delivery</option>
                                        <option value={10}>Small fee (10 ETB)</option>
                                        <option value={25}>Medium fee (25 ETB)</option>
                                        <option value={50}>Large fee (50 ETB)</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 rounded-lg font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                            >
                                {loading ? 'Saving...' : '💾 Save Changes'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                        Store Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleInputChange}
                                        placeholder="What's your store called?"
                                        className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 border-2 ${
                                            errors.storeName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        style={{
                                            backgroundColor: '#FFFFFF',
                                            borderColor: errors.storeName ? '#dc2626' : '#606C38',
                                            focusRingColor: '#606C38'
                                        }}
                                    />
                                    {errors.storeName && (
                                        <p className="mt-1 text-sm" style={{ color: '#dc2626' }}>{errors.storeName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                        What are you selling? *
                                    </label>
                                    <select
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 border-2 ${
                                            errors.description ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        style={{
                                            backgroundColor: '#FFFFFF',
                                            borderColor: errors.description ? '#dc2626' : '#606C38',
                                            focusRingColor: '#606C38'
                                        }}
                                    >
                                        <option value="">Select a category</option>
                                        {categories.length > 0 ? (
                                            categories.map((category) => (
                                                <option key={category._id || category.name} value={category.name || category}>
                                                    {category.name || category}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>Loading categories...</option>
                                        )}
                                    </select>
                                    {errors.description && (
                                        <p className="mt-1 text-sm" style={{ color: '#dc2626' }}>{errors.description}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                        Type of Business *
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['products', 'services', 'both'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, vendorType: type }))}
                                                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                                                    formData.vendorType === type
                                                        ? 'text-white'
                                                        : 'border-2'
                                                }`}
                                                style={{
                                                    backgroundColor: formData.vendorType === type ? '#606C38' : 'transparent',
                                                    borderColor: '#606C38',
                                                    color: formData.vendorType === type ? '#FEFAE0' : '#606C38'
                                                }}
                                            >
                                                {type === 'products' ? '📦 Products' : type === 'services' ? '🔧 Services' : '🎯 Both'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                {/* Step 2: Location & Contact */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                Your Campus Location *
                            </label>
                            <LocationPicker
                                initialLocation={formData.selectedLocation || { lat: 9.0092, lng: 38.7578 }}
                                onLocationSelect={(location) => {
                                    setFormData(prev => ({ ...prev, selectedLocation: location }));
                                    if (errors.location) {
                                        setErrors(prev => ({ ...prev, location: undefined }));
                                    }
                                }}
                                height="300px"
                                placeholder="Find your spot on campus..."
                            />
                            {errors.location && (
                                <p className="mt-1 text-sm" style={{ color: '#dc2626' }}>{errors.location}</p>
                            )}
                            <p className="mt-1 text-xs" style={{ color: '#606C38', opacity: 0.7 }}>
                                📍 Click on map or search to find your exact campus location
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Your contact number"
                                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 border-2 ${
                                    errors.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                                style={{ 
                                    backgroundColor: '#FFFFFF',
                                    borderColor: errors.phone ? '#dc2626' : '#606C38',
                                    focusRingColor: '#606C38'
                                }}
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm" style={{ color: '#dc2626' }}>{errors.phone}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                Nearest University *
                            </label>
                            <select
                                name="universityNear"
                                value={formData.universityNear}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 border-2 ${
                                    errors.universityNear ? 'border-red-500' : 'border-gray-300'
                                }`}
                                style={{ 
                                    backgroundColor: '#FFFFFF',
                                    borderColor: errors.universityNear ? '#dc2626' : '#606C38',
                                    focusRingColor: '#606C38'
                                }}
                            >
                                <option value="">Select your university</option>
                                {universities.map((university) => (
                                    <option key={university._id || university.name} value={university.name || university}>
                                        {university.name || university}
                                    </option>
                                ))}
                            </select>
                            {errors.universityNear && (
                                <p className="mt-1 text-sm" style={{ color: '#dc2626' }}>{errors.universityNear}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Delivery Options */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-4" style={{ color: '#283618' }}>
                                How can students get your stuff?
                            </label>
                            {errors.deliveryOptions && (
                                <p className="mb-3 text-sm" style={{ color: '#dc2626' }}>{errors.deliveryOptions}</p>
                            )}
                            <div className="space-y-4">
                                <label className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105" 
                                    style={{ 
                                        borderColor: formData.deliveryAvailable ? '#606C38' : '#e5e7eb',
                                        backgroundColor: formData.deliveryAvailable ? '#606C3810' : 'transparent'
                                    }}>
                                    <input
                                        type="checkbox"
                                        name="deliveryAvailable"
                                        checked={formData.deliveryAvailable}
                                        onChange={handleInputChange}
                                        className="mr-3"
                                        style={{ accentColor: '#606C38' }}
                                    />
                                    <div>
                                        <div className="font-medium" style={{ color: '#283618' }}>🚚 I can deliver</div>
                                        <div className="text-sm" style={{ color: '#606C38' }}>Bring items to students on campus</div>
                                    </div>
                                </label>

                                <label className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105" 
                                    style={{ 
                                        borderColor: formData.pickupAvailable ? '#606C38' : '#e5e7eb',
                                        backgroundColor: formData.pickupAvailable ? '#606C3810' : 'transparent'
                                    }}>
                                    <input
                                        type="checkbox"
                                        name="pickupAvailable"
                                        checked={formData.pickupAvailable}
                                        onChange={handleInputChange}
                                        className="mr-3"
                                        style={{ accentColor: '#606C38' }}
                                    />
                                    <div>
                                        <div className="font-medium" style={{ color: '#283618' }}>📍 Students can pick up</div>
                                        <div className="text-sm" style={{ color: '#606C38' }}>Students come to my location</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {formData.deliveryAvailable && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                        Delivery Area
                                    </label>
                                    <select
                                        name="deliveryRadius"
                                        value={formData.deliveryRadius}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 border-2 border-gray-300"
                                        style={{ 
                                            backgroundColor: '#FFFFFF',
                                            borderColor: '#606C38',
                                            focusRingColor: '#606C38'
                                        }}
                                    >
                                        <option value={1000}>My building only</option>
                                        <option value={3000}>Campus area</option>
                                        <option value={5000}>Near campus</option>
                                        <option value={10000}>Whole city</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                        Delivery Fee
                                    </label>
                                    <select
                                        name="deliveryFee"
                                        value={formData.deliveryFee}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 border-2 border-gray-300"
                                        style={{ 
                                            backgroundColor: '#FFFFFF',
                                            borderColor: '#606C38',
                                            focusRingColor: '#606C38'
                                        }}
                                    >
                                        <option value={0}>Free delivery</option>
                                        <option value={10}>Small fee (10 ETB)</option>
                                        <option value={25}>Medium fee (25 ETB)</option>
                                        <option value={50}>Large fee (50 ETB)</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Navigation Buttons - Only show for multi-step form (new vendors) */}
                {!initialData && (
                    <div className="flex justify-between pt-6">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-8 py-3 rounded-lg font-bold hover:scale-105 transition-transform border-2"
                                style={{
                                    backgroundColor: 'transparent',
                                    color: '#606C38',
                                    borderColor: '#606C38'
                                }}
                            >
                                ← Back
                            </button>
                        )}

                        <div className="ml-auto">
                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-8 py-3 rounded-lg font-bold hover:scale-105 transition-transform"
                                    style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                                >
                                    Next →
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 rounded-lg font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                                >
                                    {loading ? 'Submitting...' : ' Start Selling'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
                </>
            )}
            </form>
        </div>
    );
};

export default VendorApplicationForm;
