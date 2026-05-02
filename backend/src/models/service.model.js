import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true
    },

    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 200
    },

    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 2000
    },

    // Service categories (different from product categories)
    serviceCategory: {
        type: String,
        required: true,
        enum: [
            'tutoring',           // Academic tutoring
            'consulting',         // Business/academic consulting
            'repair',             // Device repair, maintenance
            'design',             // Graphic design, web design
            'writing',            // Content writing, editing
            'photography',        // Photography services
            'event',              // Event planning, coordination
            'fitness',            // Personal training, coaching
            'beauty',             // Hair, makeup, grooming
            'technology',         // Tech support, programming
            'language',           // Translation, language lessons
            'transport',          // Transportation, delivery
            'cleaning',           // Cleaning services
            'other'               // Other services
        ]
    },

    // Pricing models for services
    pricingModel: {
        type: String,
        required: true,
        enum: ['fixed', 'hourly', 'package', 'quote']
    },

    // Base price (for fixed pricing or hourly rate)
    basePrice: {
        type: Number,
        required: true,
        min: 0
    },

    // For hourly services - minimum hours
    minimumHours: {
        type: Number,
        default: 1
    },

    // For package services - what's included
    packageDetails: {
        type: String,
        maxlength: 1000
    },

    // Service duration (in hours)
    estimatedDuration: {
        type: Number,
        min: 0.5
    },

    // Service location options
    serviceLocation: {
        type: String,
        enum: ['online', 'in_person', 'both'],
        default: 'in_person'
    },

    // For in-person services - can vendor travel
    canTravel: {
        type: Boolean,
        default: false
    },

    // Travel radius if vendor can travel (meters)
    travelRadius: {
        type: Number,
        default: 0
    },

    // Travel fee
    travelFee: {
        type: Number,
        default: 0
    },

    // Service availability
    availability: {
        weekdays: {
            type: Boolean,
            default: true
        },
        weekends: {
            type: Boolean,
            default: true
        },
        evenings: {
            type: Boolean,
            default: true
        },
        specificHours: {
            type: String,
            maxlength: 200
        }
    },

    // Service images (portfolio, examples)
    images: [{
        type: String
    }],

    // Service requirements from customer
    customerRequirements: {
        type: String,
        maxlength: 1000
    },

    // Service tags for better search
    tags: [{
        type: String,
        trim: true
    }],

    // Service status
    isActive: {
        type: Boolean,
        default: true
    },

    // Review and rating system
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },

    reviewCount: {
        type: Number,
        default: 0
    },

    // Service completion count
    completedCount: {
        type: Number,
        default: 0
    },

    // Featured service
    isFeatured: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for search functionality
serviceSchema.index({ vendorId: 1, isActive: 1 });
serviceSchema.index({ serviceCategory: 1, isActive: 1 });
serviceSchema.index({ title: 'text', description: 'text', tags: 'text' });
serviceSchema.index({ basePrice: 1 });
serviceSchema.index({ averageRating: -1 });

// Virtual for formatted price
serviceSchema.virtual('formattedPrice').get(function() {
    if (this.pricingModel === 'hourly') {
        return `${this.basePrice} ETB/hour`;
    } else if (this.pricingModel === 'fixed') {
        return `${this.basePrice} ETB`;
    } else if (this.pricingModel === 'package') {
        return `${this.basePrice} ETB/package`;
    } else {
        return 'Contact for quote';
    }
});

// Virtual for service location display
serviceSchema.virtual('locationDisplay').get(function() {
    if (this.serviceLocation === 'online') {
        return 'Online Service';
    } else if (this.serviceLocation === 'in_person') {
        return this.canTravel ? 'In-person (Travel Available)' : 'In-person Only';
    } else {
        return 'Online & In-person';
    }
});

const Service = mongoose.model("Service", serviceSchema);

export default Service;
