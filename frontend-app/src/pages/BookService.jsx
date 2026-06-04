import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useServiceApi } from '../hooks/useServiceApi';
import { useBooking } from '../hooks/useBooking';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, ChevronLeft, DollarSign, User, Mail, Phone } from 'lucide-react';

const BookService = () => {
    const { serviceId } = useParams();
    const { getService } = useServiceApi();
    const { createBooking, loading } = useBooking();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const [service, setService] = useState(null);
    const [loadingService, setLoadingService] = useState(true);
    const [error, setError] = useState(null);

    const [bookingData, setBookingData] = useState({
        serviceId: serviceId,
        vendorId: '',
        bookingDate: '',
        bookingTime: '',
        duration: 1,
        location: {
            address: '',
            placeName: ''
        },
        serviceType: 'in_person',
        customerNotes: '',
        contactInfo: {
            name: '',
            email: '',
            phone: ''
        },
        paymentMethod: 'cash',
        pricing: {
            basePrice: 0
        }
    });

    const [calculatedPrice, setCalculatedPrice] = useState(0);

    useEffect(() => {
        loadService();
    }, [serviceId]);

    useEffect(() => {
        if (user) {
            setBookingData(prev => ({
                ...prev,
                contactInfo: {
                    name: user.name || '',
                    email: user.email || '',
                    phone: prev.contactInfo.phone || ''
                }
            }));
        }
    }, [user]);

    useEffect(() => {
        if (service) {
            setBookingData(prev => ({
                ...prev,
                vendorId: service.vendorId._id,
                serviceType: service.serviceLocation === 'online' ? 'online' : 'in_person',
                pricing: {
                    basePrice: service.basePrice
                }
            }));
            calculatePrice();
        }
    }, [service]);

    const calculatePrice = () => {
        if (!service) return;

        let price = service.basePrice;
        
        if (service.pricingModel === 'hourly') {
            const duration = bookingData.duration || service.minimumHours || 1;
            price = service.basePrice * Math.max(duration, service.minimumHours || 1);
        }

        if (service.canTravel && service.travelFee > 0) {
            price += service.travelFee;
        }

        setCalculatedPrice(price);
    };

    useEffect(() => {
        calculatePrice();
    }, [bookingData.duration, service]);

    const loadService = async () => {
        try {
            setLoadingService(true);
            setError(null);
            const result = await getService(serviceId);
            
            if (result.success) {
                const serviceData = result.data?.service || result.data;
                setService(serviceData);
            } else {
                setError(result.message || 'Failed to load service');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load service');
        } finally {
            setLoadingService(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            alert('Please login to book services');
            navigate('/login');
            return;
        }

        try {
            const result = await createBooking(bookingData);
            if (result.success) {
                alert('Booking created successfully!');
                navigate('/my-bookings');
            } else {
                alert(result.message || 'Failed to create booking');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create booking');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setBookingData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setBookingData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleDurationChange = (e) => {
        const value = parseFloat(e.target.value);
        setBookingData(prev => ({
            ...prev,
            duration: value
        }));
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    if (loadingService) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEFAE0' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderBottomColor: '#606C38' }}></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEFAE0' }}>
                <div className="text-center">
                    <div className="text-red-600 text-lg mb-4">Error: {error}</div>
                    <button 
                        onClick={loadService}
                        className="px-6 py-2 rounded-md transition-colors"
                        style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEFAE0' }}>
                <div className="text-center">
                    <div className="text-gray-600 text-lg mb-4">Service not found</div>
                    <Link 
                        to="/products"
                        className="px-6 py-2 rounded-md transition-colors inline-block"
                        style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                    >
                        Back to Services
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center hover:opacity-70 transition-colors"
                    style={{ color: '#283618' }}
                >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back to Service
                </button>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Service Summary */}
                    <div className="p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
                        <h1 className="text-2xl font-bold mb-2" style={{ color: '#283618' }}>Book Service</h1>
                        <div className="flex items-center gap-4">
                            <div className="text-xl font-semibold" style={{ color: '#606C38' }}>
                                {service.title}
                            </div>
                            <div className="text-lg font-bold" style={{ color: '#DDA15E' }}>
                                {service.pricingModel === 'hourly' ? `${service.basePrice} ETB/hour` : `${service.basePrice} ETB`}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Booking Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    Booking Date
                                </label>
                                <input
                                    type="date"
                                    name="bookingDate"
                                    value={bookingData.bookingDate}
                                    onChange={handleChange}
                                    min={getMinDate()}
                                    required
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                                    style={{ borderColor: '#D1D5DB', focusRingColor: '#606C38' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                    <Clock className="w-4 h-4 inline mr-2" />
                                    Booking Time
                                </label>
                                <input
                                    type="time"
                                    name="bookingTime"
                                    value={bookingData.bookingTime}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                                    style={{ borderColor: '#D1D5DB', focusRingColor: '#606C38' }}
                                />
                            </div>
                        </div>

                        {/* Duration (for hourly services) */}
                        {service.pricingModel === 'hourly' && (
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                    <Clock className="w-4 h-4 inline mr-2" />
                                    Duration (hours)
                                </label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={bookingData.duration}
                                    onChange={handleDurationChange}
                                    min={service.minimumHours || 1}
                                    step={0.5}
                                    required
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                                    style={{ borderColor: '#D1D5DB', focusRingColor: '#606C38' }}
                                />
                                {service.minimumHours && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Minimum booking: {service.minimumHours} hour{service.minimumHours > 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Location */}
                        {service.serviceLocation !== 'online' && (
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                    <MapPin className="w-4 h-4 inline mr-2" />
                                    Service Location
                                </label>
                                <input
                                    type="text"
                                    name="location.address"
                                    value={bookingData.location.address}
                                    onChange={handleChange}
                                    placeholder="Enter your address or meeting location"
                                    required
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                                    style={{ borderColor: '#D1D5DB', focusRingColor: '#606C38' }}
                                />
                                {service.canTravel && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Vendor can travel within {service.travelRadius}m
                                        {service.travelFee > 0 && ` (Additional ${service.travelFee} ETB fee)`}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold" style={{ color: '#283618' }}>Contact Information</h3>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                    <User className="w-4 h-4 inline mr-2" />
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="contactInfo.name"
                                    value={bookingData.contactInfo.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                                    style={{ borderColor: '#D1D5DB', focusRingColor: '#606C38' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="contactInfo.email"
                                    value={bookingData.contactInfo.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                                    style={{ borderColor: '#D1D5DB', focusRingColor: '#606C38' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                    <Phone className="w-4 h-4 inline mr-2" />
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="contactInfo.phone"
                                    value={bookingData.contactInfo.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                                    style={{ borderColor: '#D1D5DB', focusRingColor: '#606C38' }}
                                />
                            </div>
                        </div>

                        {/* Customer Notes */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                Additional Notes (Optional)
                            </label>
                            <textarea
                                name="customerNotes"
                                value={bookingData.customerNotes}
                                onChange={handleChange}
                                rows={3}
                                maxLength={1000}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                                style={{ borderColor: '#D1D5DB', focusRingColor: '#606C38' }}
                                placeholder="Any special requirements or notes for the service provider..."
                            />
                        </div>

                        {/* Payment Method */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                Payment Method
                            </label>
                            <select
                                name="paymentMethod"
                                value={bookingData.paymentMethod}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                                style={{ borderColor: '#D1D5DB', focusRingColor: '#606C38' }}
                            >
                                <option value="cash">Cash on Delivery</option>
                                <option value="mobile_money">Mobile Money</option>
                                <option value="bank_transfer">Bank Transfer</option>
                            </select>
                        </div>

                        {/* Price Summary */}
                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#FEFAE0', border: '1px solid #606C38' }}>
                            <h3 className="text-lg font-semibold mb-4" style={{ color: '#283618' }}>Price Summary</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span style={{ color: '#283618' }}>
                                        {service.pricingModel === 'hourly' ? `Base Price (${service.basePrice} ETB/hour × ${bookingData.duration}h)` : 'Base Price'}
                                    </span>
                                    <span style={{ color: '#606C38' }}>
                                        {service.pricingModel === 'hourly' ? `${service.basePrice * bookingData.duration} ETB` : `${service.basePrice} ETB`}
                                    </span>
                                </div>
                                {service.canTravel && service.travelFee > 0 && (
                                    <div className="flex justify-between">
                                        <span style={{ color: '#283618' }}>Travel Fee</span>
                                        <span style={{ color: '#606C38' }}>{service.travelFee} ETB</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t" style={{ borderColor: '#606C38' }}>
                                    <span className="font-semibold" style={{ color: '#283618' }}>Total</span>
                                    <span className="font-bold text-xl" style={{ color: '#606C38' }}>{calculatedPrice} ETB</span>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 rounded-md flex items-center justify-center transition-colors disabled:opacity-50"
                            style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                        >
                            {loading ? 'Processing...' : 'Confirm Booking'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookService;
