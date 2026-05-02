import mongoose from "mongoose";

const orderGroupSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Group-level information
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },

  status: {
    type: String,
    enum: ["pending", "processing", "completed", "cancelled"],
    default: "pending"
  },

  // Delivery address shared across all orders in group
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: "Nigeria" },
    phone: String,
    instructions: String
  },

  paymentMethod: {
    type: String,
    enum: ["cash_on_delivery", "card", "transfer"],
    default: "cash_on_delivery"
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },

  // Array of individual orders for each vendor
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  }]
},
{ timestamps: true });

export default mongoose.model("OrderGroup", orderGroupSchema);
