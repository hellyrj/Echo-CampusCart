import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ["student" , "vendor" , "admin"],
        default: "student",
    },

    profilePicture: {
        type: String,
    },

    notifications: [{
        type: {
            type: String,
            enum: ['vendor_approval', 'vendor_rejection', 'order_update', 'system'],
            required: true
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        details: {
            type: String,
            default: null
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        read: {
            type: Boolean,
            default: false
        }
    }],

},
 { timestamps: true}
);

export default mongoose.model("User" , userSchema)