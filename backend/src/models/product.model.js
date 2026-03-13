import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
{
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  description: String,

  price: {
    type: Number,
    required: true,
  },

  stock: {
    type: Number,
    default: 0,
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  images: [String],

  deliveryOption: {
    type: String,
    enum: ["pickup", "delivery", "both"],
    default: "pickup"
  }
},
{ timestamps: true }
);

export default mongoose.model("Product", productSchema);