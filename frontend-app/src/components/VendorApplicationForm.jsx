import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVendorApi } from '../hooks/useVendorApi';
import LocationInput from './LocationInput';
import LocationPicker from './LocationPicker';

const VendorApplicationForm = ({ onSubmit, loading }) => {
    const { user } = useAuth();
    const { getUniversities } = useVendorApi();
    const [formData, setFormData] = useState({
        storeName: '',
        description: '',
        address: '',
        phone: '',
        universityNear: '',
        legalDocuments: [],
        // New location fields
        placeName: '',
        fullAddress: '',
        landmark: '',
        area: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Ethiopia',
        locationDetails: null,
        // Delivery options
        deliveryAvailable: true,
        pickupAvailable: true,
        deliveryRadius: 3000,
        deliveryFee: 0,
        // Map coordinates
        selectedLocation: null
    });
    const [errors, setErrors] = useState({});
    const [universities, setUniversities] = useState([]);

    useEffect(() => {
        loadUniversities();
    }, []);

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

    const documentTypes = [
        { value: 'business_license', label: 'Business License' },
        { value: 'tax_certificate', label: 'Tax Certificate' },
        { value: 'health_permit', label: 'Health Permit' },
        { value: 'other', label: 'Other' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
        
        if (!formData.storeName.trim()) {
            newErrors.storeName = 'Store name is required';
        }
        
        // Check for location selection (map coordinates or fallback to location details)
        if (!formData.selectedLocation && !formData.locationDetails && !formData.address.trim()) {
            newErrors.address = 'Please select your business location on the map';
        }
        
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }
        
        if (!formData.universityNear.trim()) {
            newErrors.universityNear = 'University selection is required';
        }
        
        // Validate delivery options
        if (!formData.deliveryAvailable && !formData.pickupAvailable) {
            newErrors.deliveryOptions = 'At least one of delivery or pickup must be available';
        }
        
        if (formData.deliveryAvailable) {
            if (!formData.deliveryRadius || formData.deliveryRadius < 100 || formData.deliveryRadius > 10000) {
                newErrors.deliveryRadius = 'Delivery radius must be between 100 and 10000 meters';
            }
            
            if (formData.deliveryFee < 0) {
                newErrors.deliveryFee = 'Delivery fee cannot be negative';
            }
        }
        
        // Validate phone format (Ethiopian phone numbers)
        const phoneRegex = /^(\+251|0)?[1-9]\d{8}$/;
        if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Please enter a valid Ethiopian phone number (e.g., +251911234567 or 0911234567)';
        }
        
        if (formData.legalDocuments.length === 0) {
            newErrors.legalDocuments = 'At least one legal document is required';
        } else {
            formData.legalDocuments.forEach((doc, index) => {
                if (!doc.file && !doc.documentUrl.trim()) {
                    newErrors[`document_${index}`] = 'Please upload a document file';
                }
            });
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Create FormData for file upload
        const formDataToSend = new FormData();
        
        // Add basic fields
        formDataToSend.append('storeName', formData.storeName);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('universityNear', formData.universityNear);
        
        // Add delivery options
        formDataToSend.append('deliveryAvailable', formData.deliveryAvailable);
        formDataToSend.append('pickupAvailable', formData.pickupAvailable);
        formDataToSend.append('deliveryRadius', formData.deliveryRadius);
        formDataToSend.append('deliveryFee', formData.deliveryFee);
        
        // Add location details if available
        if (formData.locationDetails) {
            formDataToSend.append('placeName', formData.locationDetails.placeName);
            formDataToSend.append('fullAddress', formData.locationDetails.fullAddress);
            formDataToSend.append('landmark', formData.locationDetails.landmark || '');
            formDataToSend.append('area', formData.locationDetails.area || '');
            formDataToSend.append('city', formData.locationDetails.city);
            formDataToSend.append('state', formData.locationDetails.state);
            formDataToSend.append('postalCode', formData.locationDetails.postalCode || '');
            formDataToSend.append('country', formData.locationDetails.country);
        }
        
        // Add map coordinates if selected
        if (formData.selectedLocation) {
            formDataToSend.append('location', JSON.stringify({
                type: "Point",
                coordinates: [formData.selectedLocation.lng, formData.selectedLocation.lat] // GeoJSON format: [longitude, latitude]
            }));
        } else if (formData.locationDetails?.coordinates) {
            // Fallback to old coordinates if available
            formDataToSend.append('location', JSON.stringify({
                type: "Point",
                coordinates: formData.locationDetails.coordinates
            }));
        }
        
        // Add document files
        formData.legalDocuments.forEach((doc, index) => {
            if (doc.file) {
                formDataToSend.append('documents', doc.file);
                formDataToSend.append(`documentType_${index}`, doc.documentType);
            }
        });

        onSubmit(formDataToSend);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply to Become a Vendor</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Store Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Store Name *
                    </label>
                    <input
                        type="text"
                        name="storeName"
                        value={formData.storeName}
                        onChange={handleInputChange}
                        placeholder="Enter your store name"
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.storeName ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.storeName && (
                        <p className="mt-1 text-sm text-red-600">{errors.storeName}</p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Store Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your store and what you offer"
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Business Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Location *
                    </label>
                    <LocationPicker
                        initialLocation={formData.selectedLocation || { lat: 9.0092, lng: 38.7578 }}
                        onLocationSelect={(location) => {
                            setFormData(prev => ({
                                ...prev,
                                selectedLocation: location,
                                // Update main address field and locationDetails with place name if available
                                address: location.placeName || prev.address,
                                locationDetails: location.placeName ? {
                                    ...prev.locationDetails,
                                    placeName: location.placeName,
                                    fullAddress: location.placeName
                                } : prev.locationDetails
                            }));
                            // Clear any address errors when location is selected
                            if (errors.address) {
                                setErrors(prev => ({ ...prev, address: undefined }));
                            }
                        }}
                        height="400px"
                        placeholder="Search for your business location..."
                    />
                    {errors.address && (
                        <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                        Click on the map or search to select your exact business location. This will help customers find you easily.
                    </p>
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number (e.g., +251911234567 or 0911234567)"
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                </div>

                {/* University */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nearest University *
                    </label>
                    <select
                        name="universityNear"
                        value={formData.universityNear}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.universityNear ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Select a university</option>
                        {console.log('Rendering universities:', universities)}
                        {universities.map((university) => (
                            <option key={university._id || university.name} value={university.name || university}>
                                {university.name || university}
                            </option>
                        ))}
                    </select>
                    {errors.universityNear && (
                        <p className="mt-1 text-sm text-red-600">{errors.universityNear}</p>
                    )}
                </div>

                {/* Delivery Options */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Options
                    </label>
                    {errors.deliveryOptions && (
                        <p className="mt-1 text-sm text-red-600">{errors.deliveryOptions}</p>
                    )}
                    <div className="space-y-3">
                        {/* Delivery Available */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="deliveryAvailable"
                                checked={formData.deliveryAvailable}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="deliveryAvailable" className="ml-2 text-sm text-gray-700">
                                I offer delivery services
                            </label>
                        </div>

                        {/* Pickup Available */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="pickupAvailable"
                                checked={formData.pickupAvailable}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="pickupAvailable" className="ml-2 text-sm text-gray-700">
                                I offer pickup services
                            </label>
                        </div>

                        {/* Delivery Radius */}
                        {formData.deliveryAvailable && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Delivery Radius (meters)
                                </label>
                                <input
                                    type="number"
                                    name="deliveryRadius"
                                    value={formData.deliveryRadius}
                                    onChange={handleInputChange}
                                    min="100"
                                    max="10000"
                                    step="100"
                                    placeholder="3000"
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.deliveryRadius ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Maximum distance for delivery (100-10000 meters)
                                </p>
                                {errors.deliveryRadius && (
                                    <p className="mt-1 text-sm text-red-600">{errors.deliveryRadius}</p>
                                )}
                            </div>
                        )}

                        {/* Delivery Fee */}
                        {formData.deliveryAvailable && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Delivery Fee (ETB)
                                </label>
                                <input
                                    type="number"
                                    name="deliveryFee"
                                    value={formData.deliveryFee}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.deliveryFee ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Leave 0 for free delivery
                                </p>
                                {errors.deliveryFee && (
                                    <p className="mt-1 text-sm text-red-600">{errors.deliveryFee}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Legal Documents */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Legal Documents *
                    </label>
                    <p className="text-sm text-gray-600 mb-3">
                        Please upload your legal documents (business license, tax certificate, etc.)
                    </p>
                    
                    {formData.legalDocuments.map((doc, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                            <div className="flex gap-3 items-start">
                                <select
                                    value={doc.documentType}
                                    onChange={(e) => handleDocumentChange(index, 'documentType', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {documentTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                
                                <div className="flex-2">
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange(index, e.target.files[0])}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors[`document_${index}`] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {doc.fileName && (
                                        <p className="mt-1 text-sm text-gray-600">
                                            Selected: {doc.fileName} ({(doc.fileSize / 1024).toFixed(1)} KB)
                                        </p>
                                    )}
                                </div>
                                
                                {formData.legalDocuments.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeDocument(index)}
                                        className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            
                            {errors[`document_${index}`] && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors[`document_${index}`]}
                                </p>
                            )}
                        </div>
                    ))}
                    
                    {errors.legalDocuments && (
                        <p className="mt-1 text-sm text-red-600">{errors.legalDocuments}</p>
                    )}
                    
                    <button
                        type="button"
                        onClick={addDocument}
                        className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        Add Another Document
                    </button>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VendorApplicationForm;
