import mongoose from "mongoose";

const universitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
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
    
    address: {
        type: String,
        required: true
    },
    
    city: {
        type: String,
        required: true
    },
    
    state: {
        type: String,
        required: true
    },
    
    country: {
        type: String,
        required: true,
        default: "Nigeria"
    },
    
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create geospatial index for location-based searches
universitySchema.index({ location: "2dsphere" });

export default mongoose.model("University", universitySchema);