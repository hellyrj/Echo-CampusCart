import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServiceApi } from '../hooks/useServiceApi';
import { useAuth } from '../context/AuthContext';
import ServiceCreationForm from '../components/ServiceCreationForm';
import { Plus, Edit, Trash2, Wrench, Clock, DollarSign, Star, Eye } from 'lucide-react';

const MyServices = () => {
    const navigate = useNavigate();
    const { getMyServices, deleteService, loading } = useServiceApi();
    const { user } = useAuth();
    
    const [services, setServices] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setError(null);
            const result = await getMyServices();
            if (result.success) {
                const servicesData = result.data?.services || result.data || [];
                setServices(Array.isArray(servicesData) ? servicesData : []);
            } else {
                setError(result.message || 'Failed to load services');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load services');
        }
    };

    const { createService, updateService } = useServiceApi();

    const handleCreateService = async (serviceData) => {
        try {
            const result = await createService(serviceData);
            if (result.success) {
                setShowCreateForm(false);
                loadServices();
            } else {
                setError(result.message || 'Failed to create service');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create service');
        }
    };

    const handleUpdateService = async (serviceData) => {
        try {
            const result = await updateService(editingService._id, serviceData);
            if (result.success) {
                setEditingService(null);
                loadServices();
            } else {
                setError(result.message || 'Failed to update service');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update service');
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
            return;
        }

        try {
            const result = await deleteService(serviceId);
            if (result.success) {
                loadServices();
            } else {
                setError(result.message || 'Failed to delete service');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete service');
        }
    };

    const formatPrice = (service) => {
        if (service.pricingModel === 'hourly') {
            return `${service.basePrice} ETB/hr`;
        } else if (service.pricingModel === 'fixed') {
            return `${service.basePrice} ETB`;
        } else if (service.pricingModel === 'package') {
            return `${service.basePrice} ETB/package`;
        } else {
            return 'Contact for quote';
        }
    };

    const getImageUrl = (image) => {
        if (!image) return 'https://via.placeholder.com/200x150/e5e7eb/6b7280?text=Service';
        
        if (image.startsWith('http')) return image;
        if (image.startsWith('/')) return `http://localhost:5000${image}`;
        return `http://localhost:5000/uploads/${image}`;
    };

    if (showCreateForm || editingService) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <button
                            onClick={() => {
                                setShowCreateForm(false);
                                setEditingService(null);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            ← Back to My Services
                        </button>
                    </div>
                    <ServiceCreationForm
                        onSubmit={editingService ? handleUpdateService : handleCreateService}
                        loading={loading}
                        initialData={editingService}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
                            <p className="mt-2 text-gray-600">Manage your service offerings</p>
                        </div>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add New Service
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => setError(null)}
                                    className="text-red-400 hover:text-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Services Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : services.length === 0 ? (
                    <div className="text-center py-12">
                        <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
                        <p className="text-gray-600 mb-6">Start offering your services to students</p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create Your First Service
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <div key={service._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                {/* Service Image */}
                                <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                                    {service.images && service.images.length > 0 ? (
                                        <img
                                            src={getImageUrl(service.images[0])}
                                            alt={service.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/200x150/e5e7eb/6b7280?text=Service';
                                            }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-blue-200">
                                            <Wrench className="w-12 h-12 text-blue-600" />
                                        </div>
                                    )}
                                    
                                    {/* Status Badge */}
                                    <div className="absolute top-2 right-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            service.isActive 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {service.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>

                                {/* Service Details */}
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {service.title}
                                    </h3>
                                    
                                    {/* Category */}
                                    <div className="mb-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {service.serviceCategory?.charAt(0).toUpperCase() + service.serviceCategory?.slice(1).replace('_', ' ') || 'General'}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {service.description}
                                    </p>

                                    {/* Price and Rating */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-lg font-bold text-blue-600">
                                            {formatPrice(service)}
                                        </div>
                                        {service.averageRating > 0 && (
                                            <div className="flex items-center">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="text-sm text-gray-600 ml-1">
                                                    {service.averageRating.toFixed(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>{service.completedCount || 0} completed</span>
                                        {service.reviewCount > 0 && (
                                            <>
                                                <span className="mx-2">•</span>
                                                <span>{service.reviewCount} reviews</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/services/${service._id}`)}
                                            className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </button>
                                        <button
                                            onClick={() => setEditingService(service)}
                                            className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteService(service._id)}
                                            className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyServices;
