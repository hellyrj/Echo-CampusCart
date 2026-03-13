import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
{
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },

      quantity: Number,

      price: Number
    }
  ],

  totalPrice: {
    type: Number,
    required: true,
  },

  deliveryType: {
    type: String,
    enum: ["pickup", "delivery"],
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "delivered", "cancelled"],
    default: "pending"
  }
},
{ timestamps: true }
);

export default mongoose.model("Order", orderSchema);