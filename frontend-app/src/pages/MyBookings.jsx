import React, { useState, useEffect } from 'react';
import { useBooking } from '../hooks/useBooking';
import { Calendar, Clock, MapPin, DollarSign, User, X, Filter } from 'lucide-react';

const MyBookings = () => {
    const { getMyBookings, cancelBooking, loading } = useBooking();
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        loadBookings();
    }, [statusFilter]);

    const loadBookings = async () => {
        try {
            setError(null);
            const params = statusFilter !== 'all' ? { status: statusFilter } : {};
            const result = await getMyBookings(params);
            
            if (result.success) {
                setBookings(result.data?.bookings || []);
            } else {
                setError(result.message || 'Failed to load bookings');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load bookings');
        }
    };

    const handleCancelClick = (booking) => {
        setSelectedBooking(booking);
        setShowCancelModal(true);
    };

    const handleCancelConfirm = async () => {
        if (!selectedBooking) return;

        try {
            const result = await cancelBooking(selectedBooking._id, cancelReason);
            if (result.success) {
                alert('Booking cancelled successfully');
                setShowCancelModal(false);
                setSelectedBooking(null);
                setCancelReason('');
                loadBookings();
            } else {
                alert(result.message || 'Failed to cancel booking');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return { bg: '#FEF3C7', text: '#92400E' };
            case 'confirmed':
                return { bg: '#D1FAE5', text: '#065F46' };
            case 'in_progress':
                return { bg: '#DBEAFE', text: '#1E40AF' };
            case 'completed':
                return { bg: '#D1FAE5', text: '#065F46' };
            case 'cancelled':
                return { bg: '#FEE2E2', text: '#991B1B' };
            case 'rejected':
                return { bg: '#FEE2E2', text: '#991B1B' };
            default:
                return { bg: '#F3F4F6', text: '#374151' };
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(hours, minutes);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && bookings.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEFAE0' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderBottomColor: '#606C38' }}></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold mb-8" style={{ color: '#283618' }}>My Bookings</h1>

                {/* Filter */}
                <div className="mb-6 flex items-center gap-4">
                    <Filter className="w-5 h-5" style={{ color: '#606C38' }} />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                        style={{ borderColor: '#D1D5DB', focusRingColor: '#606C38' }}
                    >
                        <option value="all">All Bookings</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {error && (
                    <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-600">
                        {error}
                    </div>
                )}

                {bookings.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg mb-4">No bookings found</div>
                        <button
                            onClick={() => setStatusFilter('all')}
                            className="px-6 py-2 rounded-md transition-colors"
                            style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                        >
                            View All Bookings
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => {
                            const statusColors = getStatusColor(booking.status);
                            return (
                                <div
                                    key={booking._id}
                                    className="bg-white rounded-lg shadow-md p-6 border"
                                    style={{ borderColor: '#E5E7EB' }}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        {/* Service Info */}
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4">
                                                {booking.serviceId?.images?.[0] && (
                                                    <img
                                                        src={booking.serviceId.images[0].startsWith('http') 
                                                            ? booking.serviceId.images[0] 
                                                            : `http://localhost:5000${booking.serviceId.images[0]}`}
                                                        alt={booking.serviceId.title}
                                                        className="w-24 h-24 object-cover rounded-lg"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#283618' }}>
                                                        {booking.serviceId?.title || 'Unknown Service'}
                                                    </h3>
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex items-center gap-2" style={{ color: '#606C38' }}>
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{formatDate(booking.bookingDate)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2" style={{ color: '#606C38' }}>
                                                            <Clock className="w-4 h-4" />
                                                            <span>{formatTime(booking.bookingTime)}</span>
                                                        </div>
                                                        {booking.location?.address && (
                                                            <div className="flex items-center gap-2" style={{ color: '#606C38' }}>
                                                                <MapPin className="w-4 h-4" />
                                                                <span>{booking.location.address}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2" style={{ color: '#606C38' }}>
                                                            <User className="w-4 h-4" />
                                                            <span>{booking.vendorId?.storeName || 'Unknown Vendor'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status and Actions */}
                                        <div className="flex flex-col items-end gap-3">
                                            <span
                                                className="px-3 py-1 rounded-full text-sm font-medium"
                                                style={{
                                                    backgroundColor: statusColors.bg,
                                                    color: statusColors.text
                                                }}
                                            >
                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
                                            </span>
                                            <div className="flex items-center gap-2" style={{ color: '#606C38' }}>
                                                <DollarSign className="w-4 h-4" />
                                                <span className="text-lg font-semibold">{booking.pricing?.totalPrice || 0} ETB</span>
                                            </div>
                                            {booking.status === 'pending' && (
                                                <button
                                                    onClick={() => handleCancelClick(booking)}
                                                    className="px-4 py-2 rounded-md text-sm transition-colors"
                                                    style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
                                                >
                                                    Cancel Booking
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Customer Notes */}
                                    {booking.customerNotes && (
                                        <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Notes:</span> {booking.customerNotes}
                                            </p>
                                        </div>
                                    )}

                                    {/* Status History */}
                                    {booking.statusHistory && booking.statusHistory.length > 0 && (
                                        <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
                                            <p className="text-sm font-medium mb-2" style={{ color: '#283618' }}>Status History</p>
                                            <div className="space-y-1">
                                                {booking.statusHistory.slice(-3).map((history, index) => (
                                                    <div key={index} className="text-xs text-gray-600">
                                                        {formatDate(history.timestamp)} - {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                                                        {history.note && `: ${history.note}`}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Cancel Modal */}
                {showCancelModal && selectedBooking && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold" style={{ color: '#283618' }}>Cancel Booking</h3>
                                <button
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setSelectedBooking(null);
                                        setCancelReason('');
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to cancel this booking for {selectedBooking.serviceId?.title}?
                            </p>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Please provide a reason for cancellation (optional)"
                                rows={3}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 mb-4"
                                style={{ borderColor: '#D1D5DB', focusRingColor: '#606C38' }}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setSelectedBooking(null);
                                        setCancelReason('');
                                    }}
                                    className="flex-1 px-4 py-2 rounded-md transition-colors"
                                    style={{ backgroundColor: '#F3F4F6', color: '#374151' }}
                                >
                                    No, Keep It
                                </button>
                                <button
                                    onClick={handleCancelConfirm}
                                    className="flex-1 px-4 py-2 rounded-md transition-colors"
                                    style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
                                >
                                    Yes, Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
