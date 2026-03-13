import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema ({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,  
      },

    storeName: {
        type: String,
        required: true,
    },

    description: {
        type: string,
    },

    university: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "University",
        required: true,
    },

    location: {
        latitude: Number,
        longitude: Number,
    },

    deliveryOptions: {
        type: Number,
        default: 2, // 1 for pickup only, 2 for delivery only, 3 for both
    }
},
  { timestamps: true }
);

export default mongoose.model("Vendor", vendorSchema);