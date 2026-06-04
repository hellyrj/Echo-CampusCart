import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    // User who is booking the service
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Service being booked
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true
    },

    // Vendor providing the service
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true
    },

    // Booking details
    bookingDate: {
        type: Date,
        required: true
    },

    bookingTime: {
        type: String,
        required: true
    },

    // Duration in hours
    duration: {
        type: Number,
        required: true,
        min: 0.5
    },

    // Location for the service
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        },
        address: String,
        placeName: String
    },

    // Service type
    serviceType: {
        type: String,
        enum: ['online', 'in_person', 'both'],
        required: true
    },

    // Pricing details
    pricing: {
        basePrice: {
            type: Number,
            required: true,
            min: 0
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0
        },
        travelFee: {
            type: Number,
            default: 0
        },
        pricingModel: {
            type: String,
            enum: ['fixed', 'hourly', 'package', 'quote'],
            required: true
        }
    },

    // Customer requirements/notes
    customerNotes: {
        type: String,
        maxlength: 1000
    },

    // Contact information
    contactInfo: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }
    },

    // Booking status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'],
        default: 'pending'
    },

    // Status history
    statusHistory: [{
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }],

    // Payment information
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },

    paymentMethod: {
        type: String,
        enum: ['cash', 'mobile_money', 'bank_transfer', 'card'],
        required: true
    },

    paymentDetails: {
        transactionId: String,
        paidAt: Date
    },

    // Cancellation details
    cancellationReason: String,
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    cancelledAt: Date,

    // Vendor notes
    vendorNotes: String,

    // Completion details
    completedAt: Date,
    completionNotes: String

}, {
    timestamps: true
});

// Indexes for performance
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ serviceId: 1 });
bookingSchema.index({ vendorId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ paymentStatus: 1 });

// Generate booking number before saving
bookingSchema.pre('save', async function() {
    if (!this.bookingNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        const count = await mongoose.model('Booking').countDocuments();
        this.bookingNumber = `BK-${year}${month}${day}-${(count + 1).toString().padStart(4, '0')}`;
    }
});

// Method to update booking status
bookingSchema.methods.updateStatus = async function(status, note, userId) {
    this.status = status;
    this.statusHistory.push({
        status,
        timestamp: new Date(),
        note,
        updatedBy: userId
    });

    if (status === 'completed') {
        this.completedAt = new Date();
    }

    if (status === 'cancelled') {
        this.cancelledAt = new Date();
        this.cancelledBy = userId;
    }

    const savedBooking = await this.save();
    return savedBooking;
};

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
