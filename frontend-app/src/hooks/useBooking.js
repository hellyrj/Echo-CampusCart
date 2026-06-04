import { useState } from 'react';
import { bookingApi } from '../api/booking.api';

export const useBooking = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createBooking = async (bookingData) => {
        setLoading(true);
        setError(null);
        try {
            const result = await bookingApi.createBooking(bookingData);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to create booking');
            throw err;
        }
    };

    const getMyBookings = async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const result = await bookingApi.getMyBookings(params);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to fetch bookings');
            throw err;
        }
    };

    const getBooking = async (bookingId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await bookingApi.getBooking(bookingId);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to fetch booking');
            throw err;
        }
    };

    const cancelBooking = async (bookingId, reason) => {
        setLoading(true);
        setError(null);
        try {
            const result = await bookingApi.cancelBooking(bookingId, reason);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to cancel booking');
            throw err;
        }
    };

    const getVendorBookings = async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const result = await bookingApi.getVendorBookings(params);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to fetch vendor bookings');
            throw err;
        }
    };

    const updateBookingStatus = async (bookingId, status, note) => {
        setLoading(true);
        setError(null);
        try {
            const result = await bookingApi.updateBookingStatus(bookingId, status, note);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to update booking status');
            throw err;
        }
    };

    const updatePaymentStatus = async (bookingId, paymentStatus, transactionId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await bookingApi.updatePaymentStatus(bookingId, paymentStatus, transactionId);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to update payment status');
            throw err;
        }
    };

    const getBookingStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await bookingApi.getBookingStats();
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to fetch booking stats');
            throw err;
        }
    };

    return {
        loading,
        error,
        createBooking,
        getMyBookings,
        getBooking,
        cancelBooking,
        getVendorBookings,
        updateBookingStatus,
        updatePaymentStatus,
        getBookingStats
    };
};
