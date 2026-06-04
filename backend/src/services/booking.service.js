import Booking from "../models/booking.model.js";
import Service from "../models/service.model.js";
import Vendor from "../models/vendor.model.js";
import User from "../models/user.model.js";

export class BookingService {
    async createBooking(bookingData) {
        try {
            // Verify service exists and is active
            const service = await Service.findById(bookingData.serviceId);
            if (!service) {
                throw new Error("Service not found");
            }
            if (!service.isActive) {
                throw new Error("Service is not available for booking");
            }

            // Verify vendor exists and is approved
            const vendor = await Vendor.findById(bookingData.vendorId);
            if (!vendor) {
                throw new Error("Vendor not found");
            }
            if (vendor.status !== 'approved') {
                throw new Error("Vendor is not approved");
            }

            // Verify user exists
            const user = await User.findById(bookingData.userId);
            if (!user) {
                throw new Error("User not found");
            }

            // Calculate total price based on pricing model
            let totalPrice = bookingData.pricing.basePrice;
            
            if (service.pricingModel === 'hourly') {
                totalPrice = service.basePrice * bookingData.duration;
                // Apply minimum hours if applicable
                if (service.minimumHours && bookingData.duration < service.minimumHours) {
                    totalPrice = service.basePrice * service.minimumHours;
                }
            }

            // Add travel fee if applicable
            if (service.canTravel && service.travelFee > 0) {
                totalPrice += service.travelFee;
            }

            bookingData.pricing.totalPrice = totalPrice;
            bookingData.pricing.travelFee = service.travelFee || 0;
            bookingData.pricing.pricingModel = service.pricingModel;

            const booking = new Booking(bookingData);
            await booking.save();

            // Populate related documents for response
            await booking.populate('userId', 'name email');
            await booking.populate('serviceId', 'title description basePrice pricingModel');
            await booking.populate('vendorId', 'storeName universityNear location');

            return booking;
        } catch (error) {
            throw new Error(`Failed to create booking: ${error.message}`);
        }
    }

    async getBookingById(bookingId) {
        try {
            const booking = await Booking.findById(bookingId)
                .populate('userId', 'name email phone')
                .populate('serviceId', 'title description basePrice pricingModel images')
                .populate('vendorId', 'storeName universityNear location phone');

            if (!booking) {
                return null;
            }

            return booking;
        } catch (error) {
            throw new Error(`Failed to get booking: ${error.message}`);
        }
    }

    async getUserBookings(userId, options = {}) {
        try {
            const { page = 1, limit = 20, status } = options;
            const skip = (page - 1) * limit;

            let query = { userId };

            if (status) {
                query.status = status;
            }

            const bookings = await Booking.find(query)
                .populate('serviceId', 'title description basePrice pricingModel images')
                .populate('vendorId', 'storeName universityNear location')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Booking.countDocuments(query);

            return {
                bookings,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to get user bookings: ${error.message}`);
        }
    }

    async getVendorBookings(vendorId, options = {}) {
        try {
            const { page = 1, limit = 20, status } = options;
            const skip = (page - 1) * limit;

            let query = { vendorId };

            if (status) {
                query.status = status;
            }

            const bookings = await Booking.find(query)
                .populate('userId', 'name email phone')
                .populate('serviceId', 'title description basePrice pricingModel')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Booking.countDocuments(query);

            return {
                bookings,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to get vendor bookings: ${error.message}`);
        }
    }

    async updateBookingStatus(bookingId, status, note, userId) {
        try {
            const booking = await Booking.findById(bookingId);
            
            if (!booking) {
                throw new Error("Booking not found");
            }

            await booking.updateStatus(status, note, userId);
            
            // Populate related documents for response
            await booking.populate('userId', 'name email');
            await booking.populate('serviceId', 'title description');
            await booking.populate('vendorId', 'storeName');

            return booking;
        } catch (error) {
            throw new Error(`Failed to update booking status: ${error.message}`);
        }
    }

    async cancelBooking(bookingId, reason, userId) {
        try {
            const booking = await Booking.findById(bookingId);
            
            if (!booking) {
                throw new Error("Booking not found");
            }

            if (booking.status === 'completed' || booking.status === 'cancelled') {
                throw new Error("Cannot cancel a completed or already cancelled booking");
            }

            await booking.updateStatus('cancelled', reason, userId);
            
            // Populate related documents for response
            await booking.populate('userId', 'name email');
            await booking.populate('serviceId', 'title description');
            await booking.populate('vendorId', 'storeName');

            return booking;
        } catch (error) {
            throw new Error(`Failed to cancel booking: ${error.message}`);
        }
    }

    async updatePaymentStatus(bookingId, paymentStatus, paymentDetails = {}) {
        try {
            const booking = await Booking.findById(bookingId);
            
            if (!booking) {
                throw new Error("Booking not found");
            }

            booking.paymentStatus = paymentStatus;
            
            if (paymentDetails.transactionId) {
                booking.paymentDetails.transactionId = paymentDetails.transactionId;
            }
            
            if (paymentStatus === 'paid') {
                booking.paymentDetails.paidAt = new Date();
            }

            await booking.save();
            
            // Populate related documents for response
            await booking.populate('userId', 'name email');
            await booking.populate('serviceId', 'title description');
            await booking.populate('vendorId', 'storeName');

            return booking;
        } catch (error) {
            throw new Error(`Failed to update payment status: ${error.message}`);
        }
    }

    async getBookingStats(vendorId) {
        try {
            const stats = await Booking.aggregate([
                { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
                {
                    $group: {
                        _id: null,
                        totalBookings: { $sum: 1 },
                        pendingBookings: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                        confirmedBookings: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
                        inProgressBookings: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
                        completedBookings: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                        cancelledBookings: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
                        totalRevenue: { $sum: '$pricing.totalPrice' },
                        paidRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$pricing.totalPrice', 0] } }
                    }
                }
            ]);

            return stats[0] || {
                totalBookings: 0,
                pendingBookings: 0,
                confirmedBookings: 0,
                inProgressBookings: 0,
                completedBookings: 0,
                cancelledBookings: 0,
                totalRevenue: 0,
                paidRevenue: 0
            };
        } catch (error) {
            throw new Error(`Failed to get booking stats: ${error.message}`);
        }
    }
}
