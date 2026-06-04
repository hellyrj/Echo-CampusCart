import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { BookingService } from "../services/booking.service.js";
import { VendorService } from "../services/vendor.service.js";

export class BookingController {
    constructor(bookingService = new BookingService()) {
        this.bookingService = bookingService;
        this.vendorService = new VendorService();
    }

    // Helper method to get vendor ID from user
    async getVendorId(req) {
        const vendor = await this.vendorService.getVendorByUserId(req.user._id);
        if (!vendor) {
            throw new Error("Vendor profile not found");
        }
        if (!vendor.isApproved) {
            throw new Error("Vendor not approved");
        }
        return vendor._id;
    }

    // =========================
    // CUSTOMER OPERATIONS
    // =========================

    createBooking = asyncHandler(async (req, res, next) => {
        console.log('=== Creating booking ===');
        console.log('Request body:', req.body);
        console.log('User:', req.user);

        const bookingData = {
            ...req.body,
            userId: req.user._id
        };

        try {
            const booking = await this.bookingService.createBooking(bookingData);
            console.log('Booking created successfully:', booking);
            sendResponse(res, 201, "Booking created successfully", booking);
        } catch (error) {
            console.error('Error creating booking:', error);
            sendResponse(res, 500, "Failed to create booking", { error: error.message });
        }
    });

    getMyBookings = asyncHandler(async (req, res, next) => {
        const userId = req.user._id;
        const { page = 1, limit = 20, status } = req.query;

        try {
            const bookings = await this.bookingService.getUserBookings(userId, {
                page: parseInt(page),
                limit: parseInt(limit),
                status
            });

            sendResponse(res, 200, "Bookings fetched successfully", bookings);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            sendResponse(res, 500, "Failed to fetch bookings", { error: error.message });
        }
    });

    getBooking = asyncHandler(async (req, res, next) => {
        const { id: bookingId } = req.params;
        const userId = req.user._id;

        try {
            const booking = await this.bookingService.getBookingById(bookingId);
            
            if (!booking) {
                return sendResponse(res, 404, "Booking not found");
            }

            // Check if user owns this booking or is the vendor
            if (booking.userId._id.toString() !== userId.toString() && 
                booking.vendorId._id.toString() !== req.user._id.toString()) {
                return sendResponse(res, 403, "You don't have permission to view this booking");
            }

            sendResponse(res, 200, "Booking fetched successfully", booking);
        } catch (error) {
            console.error('Error fetching booking:', error);
            sendResponse(res, 500, "Failed to fetch booking", { error: error.message });
        }
    });

    cancelBooking = asyncHandler(async (req, res, next) => {
        const { id: bookingId } = req.params;
        const { reason } = req.body;
        const userId = req.user._id;

        try {
            const booking = await this.bookingService.getBookingById(bookingId);
            
            if (!booking) {
                return sendResponse(res, 404, "Booking not found");
            }

            // Only the booking owner can cancel
            if (booking.userId._id.toString() !== userId.toString()) {
                return sendResponse(res, 403, "You can only cancel your own bookings");
            }

            const cancelledBooking = await this.bookingService.cancelBooking(bookingId, reason, userId);
            sendResponse(res, 200, "Booking cancelled successfully", cancelledBooking);
        } catch (error) {
            console.error('Error cancelling booking:', error);
            sendResponse(res, 500, "Failed to cancel booking", { error: error.message });
        }
    });

    // =========================
    // VENDOR OPERATIONS
    // =========================

    getVendorBookings = asyncHandler(async (req, res, next) => {
        const vendorId = await this.getVendorId(req);
        const { page = 1, limit = 20, status } = req.query;

        try {
            const bookings = await this.bookingService.getVendorBookings(vendorId, {
                page: parseInt(page),
                limit: parseInt(limit),
                status
            });

            sendResponse(res, 200, "Vendor bookings fetched successfully", bookings);
        } catch (error) {
            console.error('Error fetching vendor bookings:', error);
            sendResponse(res, 500, "Failed to fetch vendor bookings", { error: error.message });
        }
    });

    updateBookingStatus = asyncHandler(async (req, res, next) => {
        const { id: bookingId } = req.params;
        const { status, note } = req.body;
        const userId = req.user._id;

        try {
            const booking = await this.bookingService.getBookingById(bookingId);
            
            if (!booking) {
                return sendResponse(res, 404, "Booking not found");
            }

            const vendorId = await this.getVendorId(req);

            // Only the vendor can update booking status
            if (booking.vendorId._id.toString() !== vendorId.toString()) {
                return sendResponse(res, 403, "You can only update your own bookings");
            }

            const updatedBooking = await this.bookingService.updateBookingStatus(bookingId, status, note, userId);
            sendResponse(res, 200, "Booking status updated successfully", updatedBooking);
        } catch (error) {
            console.error('Error updating booking status:', error);
            sendResponse(res, 500, "Failed to update booking status", { error: error.message });
        }
    });

    updatePaymentStatus = asyncHandler(async (req, res, next) => {
        const { id: bookingId } = req.params;
        const { paymentStatus, transactionId } = req.body;

        try {
            const booking = await this.bookingService.getBookingById(bookingId);
            
            if (!booking) {
                return sendResponse(res, 404, "Booking not found");
            }

            const paymentDetails = transactionId ? { transactionId } : {};
            const updatedBooking = await this.bookingService.updatePaymentStatus(bookingId, paymentStatus, paymentDetails);
            sendResponse(res, 200, "Payment status updated successfully", updatedBooking);
        } catch (error) {
            console.error('Error updating payment status:', error);
            sendResponse(res, 500, "Failed to update payment status", { error: error.message });
        }
    });

    getBookingStats = asyncHandler(async (req, res, next) => {
        const vendorId = await this.getVendorId(req);

        try {
            const stats = await this.bookingService.getBookingStats(vendorId);
            sendResponse(res, 200, "Booking stats fetched successfully", stats);
        } catch (error) {
            console.error('Error fetching booking stats:', error);
            sendResponse(res, 500, "Failed to fetch booking stats", { error: error.message });
        }
    });
}
