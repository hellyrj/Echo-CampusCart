import { Router } from "express";
import { BookingController } from "../controllers/booking.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();
const bookingController = new BookingController();

// =========================
// CUSTOMER ROUTES (Protected)
// =========================

// Create a new booking
router.post(
    "/",
    authenticate,
    authorize('student'),
    bookingController.createBooking
);

// Get all bookings for the logged-in user
router.get(
    "/my-bookings",
    authenticate,
    authorize('student'),
    bookingController.getMyBookings
);

// Get a specific booking
router.get(
    "/:id",
    authenticate,
    bookingController.getBooking
);

// Cancel a booking
router.put(
    "/:id/cancel",
    authenticate,
    authorize('student'),
    bookingController.cancelBooking
);

// =========================
// VENDOR ROUTES (Protected)
// =========================

// Get all bookings for the logged-in vendor
router.get(
    "/vendor/my-bookings",
    authenticate,
    authorize('vendor'),
    bookingController.getVendorBookings
);

// Update booking status
router.put(
    "/:id/status",
    authenticate,
    authorize('vendor'),
    bookingController.updateBookingStatus
);

// Update payment status
router.put(
    "/:id/payment",
    authenticate,
    authorize('vendor'),
    bookingController.updatePaymentStatus
);

// Get booking stats for vendor
router.get(
    "/vendor/stats",
    authenticate,
    authorize('vendor'),
    bookingController.getBookingStats
);

export default router;
