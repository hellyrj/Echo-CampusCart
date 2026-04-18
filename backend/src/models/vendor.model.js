import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema ({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,  
        unique: true // Each vendor is associated with one user (owner) only to avoid spam stores
      },

    storeName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },

    description: {
        type: String,
        trim: true,
        maxlength: 500
    },

    address:{
     type: String,
     required: true
    },

    phone: {
        type: String,
        required: true
    },

    logo: {
        type: String,
        default: null
    },

    // Legal documents
    legalDocuments: [{
        documentType: {
            type: String,
            enum: ['business_license', 'tax_certificate', 'health_permit', 'other'],
            required: true
        },
        fileId: {
            type: String,
            required: false
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Admin approval fields
    isApproved: {
        type: Boolean,
        default: false
    },

    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    approvedAt: {
        type: Date,
        default: null
    },

    rejectionReason: {
        type: String,
        default: null
    },

    // University proximity
    universityNear: {
        type: String,
        required: true
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true
      },

       coordinates: {
        type: [Number],
        required: true
      }
    },

    deliveryAvailable: {
        type: Boolean,
        default: true
    },

    pickupAvailable: {
        type: Boolean,
        default: true
    },

    deliveryRadius: {
        type: Number,
        default: 3000
    },

    deliveryFee: {
        type: Number,
        default: 0
    },

    rating: {
        type: Number,
        default: 0
    },

    isActive: {
        type: Boolean,
        default: true
    }
},
  { timestamps: true }
);

vendorSchema.index({ location: "2dsphere"});
/**
 * coordinates: [longitude, latitude] 
 * coordinates order matter mongo requires
 */

const vendor = mongoose.model("Vendor", vendorSchema)

export default vendor;