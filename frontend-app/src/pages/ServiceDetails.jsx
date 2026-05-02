import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useServiceApi } from '../hooks/useServiceApi';
import { useAuth } from '../context/AuthContext';
import { Heart, MapPin, Star, ChevronLeft, ChevronRight, Wrench, Clock, DollarSign, Users, Calendar } from 'lucide-react';

const ServiceDetails = () => {
    const { serviceId } = useParams();
    const { getService } = useServiceApi();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Helper function to get image URL
    const getImageUrl = (image) => {
        if (!image) return 'https://via.placeholder.com/600x600/e5e7eb/6b7280?text=No+Image';
        
        if (image.startsWith('http')) return image;
        if (image.startsWith('/')) return `http://localhost:5000${image}`;
        return `http://localhost:5000/uploads/${image}`;
    };

    // Image navigation functions
    const nextImage = () => {
        if (service.images && service.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % service.images.length);
        }
    };

    const prevImage = () => {
        if (service.images && service.images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + service.images.length) % service.images.length);
        }
    };

    const goToImage = (index) => {
        setCurrentImageIndex(index);
    };

    useEffect(() => {
        loadService();
    }, [serviceId]);

    const loadService = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Loading service with ID:', serviceId);
            const result = await getService(serviceId);
            
            console.log('Service API result:', result);
            
            if (result.success) {
                const serviceData = result.data?.service || result.data;
                console.log('Service data loaded:', serviceData);
                setService(serviceData);
            } else {
                console.error('Service load failed:', result.message);
                setError(result.message || 'Failed to load service');
            }
        } catch (err) {
            console.error('Service load error:', err);
            setError(err.response?.data?.message || 'Failed to load service');
        } finally {
            setLoading(false);
        }
    };

    const handleBookService = () => {
        if (!isAuthenticated) {
            alert('Please login to book services');
            return;
        }
        // Future implementation: redirect to booking page or open booking modal
        alert('Service booking feature coming soon!');
    };

    const formatPrice = (service) => {
        if (service.pricingModel === 'hourly') {
            return `${service.basePrice} ETB/hour`;
        } else if (service.pricingModel === 'fixed') {
            return `${service.basePrice} ETB`;
        } else if (service.pricingModel === 'package') {
            return `${service.basePrice} ETB/package`;
        } else {
            return 'Contact for quote';
        }
    };

    const formatLocation = (service) => {
        if (service.serviceLocation === 'online') {
            return 'Online Service';
        } else if (service.serviceLocation === 'in_person') {
            return service.canTravel ? 'In-person (Travel Available)' : 'In-person Only';
        } else {
            return 'Online & In-person';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-lg mb-4">Error: {error}</div>
                    <button 
                        onClick={loadService}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-600 text-lg mb-4">Service not found</div>
                    <Link 
                        to="/products"
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 inline-block"
                    >
                        Back to Services
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back to Services
                </button>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Service Images */}
                        <div className="p-6">
                            <div className="relative">
                                {/* Main Image */}
                                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                                    {service.images && service.images.length > 0 ? (
                                        <img
                                            src={getImageUrl(service.images[currentImageIndex])}
                                            alt={service.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/600x600/e5e7eb/6b7280?text=No+Image';
                                            }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-blue-200">
                                            <Wrench className="w-24 h-24 text-blue-600" />
                                        </div>
                                    )}
                                </div>

                                {/* Carousel Controls - Only show if multiple images */}
                                {service.images && service.images.length > 1 && (
                                    <>
                                        {/* Previous Button */}
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        
                                        {/* Next Button */}
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                        
                                        {/* Image Indicators */}
                                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                            {service.images.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => goToImage(index)}
                                                    className={'w-3 h-3 rounded-full transition-all ' + (
                                                        index === currentImageIndex
                                                            ? 'bg-white w-8'
                                                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        
                                        {/* Image Counter */}
                                        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full">
                                            {currentImageIndex + 1} / {service.images.length}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Thumbnail Gallery */}
                            {service.images && service.images.length > 1 && (
                                <div className="mt-4 grid grid-cols-4 gap-2">
                                    {service.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => goToImage(index)}
                                            className={'aspect-square rounded-lg overflow-hidden border-2 transition-all ' + (
                                                index === currentImageIndex 
                                                    ? 'border-blue-500' 
                                                    : 'border-gray-200 hover:border-gray-300'
                                            )}
                                        >
                                            <img
                                                src={getImageUrl(image)}
                                                alt={service.title + ' ' + (index + 1)}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/150x150/e5e7eb/6b7280?text=No+Image';
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Service Details */}
                        <div className="p-6">
                            <div className="mb-6">
                                {/* Service Title */}
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">{service.title}</h1>
                                
                                {/* Price and Rating */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-3xl font-bold text-blue-600">
                                        {formatPrice(service)}
                                    </div>
                                    {service.averageRating > 0 && (
                                        <div className="flex items-center">
                                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                            <span className="ml-1 text-gray-600">
                                                {service.averageRating.toFixed(1)} ({service.reviewCount})
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Service Category and Type */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        {service.serviceCategory?.charAt(0).toUpperCase() + service.serviceCategory?.slice(1).replace('_', ' ') || 'General'}
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        {formatLocation(service)}
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                        {service.pricingModel === 'hourly' ? 'Hourly' : service.pricingModel === 'fixed' ? 'Fixed Price' : service.pricingModel === 'package' ? 'Package' : 'Custom Quote'}
                                    </span>
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">About This Service</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {service.description || 'No description available'}
                                    </p>
                                </div>

                                {/* Service Details */}
                                <div className="mb-6 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Details</h3>
                                    
                                    {service.estimatedDuration && (
                                        <div className="flex items-center text-gray-600">
                                            <Clock className="w-5 h-5 mr-3 text-blue-600" />
                                            <span>Estimated duration: {service.estimatedDuration} hour{service.estimatedDuration > 1 ? 's' : ''}</span>
                                        </div>
                                    )}

                                    {service.minimumHours && service.pricingModel === 'hourly' && (
                                        <div className="flex items-center text-gray-600">
                                            <Clock className="w-5 h-5 mr-3 text-blue-600" />
                                            <span>Minimum booking: {service.minimumHours} hour{service.minimumHours > 1 ? 's' : ''}</span>
                                        </div>
                                    )}

                                    {service.packageDetails && service.pricingModel === 'package' && (
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <h4 className="font-medium text-gray-900 mb-2">Package Includes:</h4>
                                            <p className="text-gray-600 text-sm">{service.packageDetails}</p>
                                        </div>
                                    )}

                                    {service.canTravel && (
                                        <div className="flex items-center text-gray-600">
                                            <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                                            <span>Travel available within {service.travelRadius}m</span>
                                            {service.travelFee > 0 && <span className="ml-2">(Additional {service.travelFee} ETB fee)</span>}
                                        </div>
                                    )}

                                    {service.completedCount > 0 && (
                                        <div className="flex items-center text-gray-600">
                                            <Users className="w-5 h-5 mr-3 text-blue-600" />
                                            <span>Successfully completed {service.completedCount} times</span>
                                        </div>
                                    )}
                                </div>

                                {/* Vendor Information */}
                                {service.vendorId && (
                                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Provider</h3>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                {service.vendorId._id ? (
                                                    <Link 
                                                        to={`/vendor/${service.vendorId._id}`}
                                                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                                    >
                                                        {service.vendorId.storeName || 'Unknown Vendor'}
                                                    </Link>
                                                ) : (
                                                    <span className="text-blue-600 font-medium">
                                                        {service.vendorId.storeName || 'Unknown Vendor'}
                                                    </span>
                                                )}
                                                {service.vendorId.universityNear && (
                                                    <div className="flex items-center mt-1 text-sm text-gray-600">
                                                        <MapPin className="w-4 h-4 mr-1" />
                                                        {service.vendorId.universityNear}
                                                    </div>
                                                )}
                                                <div className="flex gap-2 mt-2">
                                                    {service.vendorId.deliveryAvailable && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Delivery Available
                                                        </span>
                                                    )}
                                                    {service.vendorId.pickupAvailable && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            Pickup Available
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Customer Requirements */}
                                {service.customerRequirements && (
                                    <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">What You Need to Provide</h3>
                                        <p className="text-gray-600 text-sm">{service.customerRequirements}</p>
                                    </div>
                                )}

                                {/* Availability */}
                                {service.availability && (
                                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Availability</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {service.availability.weekdays && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Weekdays
                                                </span>
                                            )}
                                            {service.availability.weekends && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Weekends
                                                </span>
                                            )}
                                            {service.availability.evenings && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Evenings
                                                </span>
                                            )}
                                        </div>
                                        {service.availability.specificHours && (
                                            <p className="text-gray-600 text-sm mt-2">Hours: {service.availability.specificHours}</p>
                                        )}
                                    </div>
                                )}

                                {/* Book Service Button */}
                                <button
                                    onClick={handleBookService}
                                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center justify-center transition-colors"
                                >
                                    <Calendar className="w-5 h-5 mr-2" />
                                    Book This Service
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetails;
