import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const VendorApplicationForm = ({ onSubmit, loading }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        storeName: '',
        description: '',
        address: '',
        phone: '',
        universityNear: '',
        legalDocuments: []
    });
    const [errors, setErrors] = useState({});
    const [universities, setUniversities] = useState([]);

    useEffect(() => {
        loadUniversities();
    }, []);

    const loadUniversities = async () => {
        try {
            const response = await axiosInstance.get('/universities');
            console.log('VendorApplicationForm - Universities API response:', response.data); // Debug log
            if (response.data.success) {
                console.log('VendorApplicationForm - Universities data:', response.data.data); // Debug log
                setUniversities(response.data.data);
            } else {
                console.error('Failed to load universities:', response.data.message);
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
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
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

    const addDocument = () => {
        setFormData(prev => ({
            ...prev,
            legalDocuments: [...prev.legalDocuments, { documentType: 'business_license', documentUrl: '' }]
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
        
        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }
        
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }
        
        if (!formData.universityNear) {
            newErrors.universityNear = 'Please select a university';
        }
        
        if (formData.legalDocuments.length === 0) {
            newErrors.legalDocuments = 'At least one legal document is required';
        } else {
            formData.legalDocuments.forEach((doc, index) => {
                if (!doc.documentUrl.trim()) {
                    newErrors[`document_${index}`] = 'Document URL is required';
                }
            });
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Add location coordinates (for demo, using Lagos coordinates)
        const applicationData = {
            ...formData,
            location: {
                type: "Point",
                coordinates: [3.3792, 6.9722] // Lagos coordinates
            }
        };

        onSubmit(applicationData);
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

                {/* Address */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Address *
                    </label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter your business address"
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.address && (
                        <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
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
                        placeholder="Enter your phone number"
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

                {/* Legal Documents */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Legal Documents *
                    </label>
                    <p className="text-sm text-gray-600 mb-3">
                        Please upload URLs to your legal documents (business license, tax certificate, etc.)
                    </p>
                    
                    {formData.legalDocuments.map((doc, index) => (
                        <div key={index} className="flex gap-2 mb-2">
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
                            
                            <input
                                type="url"
                                value={doc.documentUrl}
                                onChange={(e) => handleDocumentChange(index, 'documentUrl', e.target.value)}
                                placeholder="Document URL"
                                className={`flex-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors[`document_${index}`] ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            
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
                    ))}
                    
                    {errors.legalDocuments && (
                        <p className="mt-1 text-sm text-red-600">{errors.legalDocuments}</p>
                    )}
                    
                    {errors[`document_${formData.legalDocuments.length - 1}`] && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors[`document_${formData.legalDocuments.length - 1}`]}
                        </p>
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
