// models/cart.model.js
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product.variants"
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    name: {
      type: String,
      required: true
    },
    image: {
      url: String,
      alt: String
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true
    },
    vendorName: {
      type: String
    },
    attributes: {
      type: Map,
      of: String
    }
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    items: [cartItemSchema],
    coupon: {
      code: String,
      discount: Number,
      discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
      }
    },
    itemCount: {
      type: Number,
      default: 0
    },
    totalQuantity: {
      type: Number,
      default: 0
    },
    subtotal: {
      type: Number,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      maxlength: 500
    },
    expiresAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Indexes for performance
//cartSchema.index({ userId: 1 });
cartSchema.index({ 'items.productId': 1 });
cartSchema.index({ updatedAt: 1 });

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    // Calculate item count
    this.itemCount = this.items.length;
    
    // Calculate total quantity
    this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Calculate subtotal
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate discount
    this.discountAmount = 0;
    if (this.coupon && this.coupon.code) {
      if (this.coupon.discountType === 'percentage') {
        this.discountAmount = (this.subtotal * this.coupon.discount) / 100;
      } else if (this.coupon.discountType === 'fixed') {
        this.discountAmount = Math.min(this.coupon.discount, this.subtotal);
      }
    }
    
    // Calculate total
    this.total = Math.max(0, this.subtotal - this.discountAmount);
  } else {
    // Reset if cart is empty
    this.itemCount = 0;
    this.totalQuantity = 0;
    this.subtotal = 0;
    this.discountAmount = 0;
    this.total = 0;
  }
  
 // next();
});

// Virtual for formatted totals
cartSchema.virtual('formattedTotals').get(function() {
  return {
    itemCount: this.itemCount,
    totalQuantity: this.totalQuantity,
    subtotal: this.subtotal.toFixed(2),
    discountAmount: this.discountAmount.toFixed(2),
    total: this.total.toFixed(2)
  };
});

// Ensure virtuals are included in JSON output
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;