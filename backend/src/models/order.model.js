import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    url: String,
    alt: String
  },
  attributes: {
    type: Map,
    of: String
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const vendorOrderSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'preparing',
      'ready_for_pickup',
      'out_for_delivery',
      'delivered',
      'picked_up',
      'cancelled',
      'rejected'
    ],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered',
        'picked_up',
        'cancelled',
        'rejected'
      ]
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
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  rejectionReason: String,
  cancellationReason: String,
  vendorNotes: String
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // CHANGE: Make orderNumber not required, we'll generate it
  orderNumber: {
    type: String,
    unique: true,
    // Remove required: true
    sparse: true, // Allow null values for uniqueness
    default: null
  },
  vendorOrders: [vendorOrderSchema],
  
  // Customer Information
  customerInfo: {
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
  
  // Delivery Address
  deliveryAddress: {
    placeName: String,
    fullAddress: {
      type: String,
      required: true
    },
    landmark: String,
    area: String,
    city: String,
    state: String,
    postalCode: String,
    country: {
      type: String,
      default: "Ethiopia"
    },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    deliveryInstructions: String
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['cash_on_delivery', 'mobile_money', 'bank_transfer', 'card'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentDetails: {
    transactionId: String,
    paymentProvider: String,
    paidAt: Date,
    refundDetails: [{
      amount: Number,
      reason: String,
      refundedAt: Date,
      transactionId: String
    }]
  },
  
  // Order Summary
  orderSummary: {
    totalItems: {
      type: Number,
      required: true
    },
    totalQuantity: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    },
    totalDeliveryFee: {
      type: Number,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    couponCode: String,
    grandTotal: {
      type: Number,
      required: true
    }
  },
  
  // Overall Order Status
  overallStatus: {
    type: String,
    enum: [
      'pending',
      'processing',
      'partially_delivered',
      'delivered',
      'completed',
      'cancelled',
      'partially_cancelled'
    ],
    default: 'pending'
  },
  
  // Order Dates
  orderDate: {
    type: Date,
    default: Date.now
  },
  estimatedDeliveryDate: Date,
  
  // Customer Notes
  customerNotes: {
    type: String,
    maxlength: 500
  },
  
  // Cancellation
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  cancelledAt: Date
  
}, {
  timestamps: true
});

// Indexes for performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { sparse: true }); // Changed to sparse
orderSchema.index({ 'vendorOrders.vendorId': 1 });
orderSchema.index({ overallStatus: 1 });
orderSchema.index({ 'vendorOrders.status': 1 });
orderSchema.index({ 'paymentStatus': 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before saving - THIS IS THE KEY FIX
orderSchema.pre('save', async function(next) {
  console.log('=== Pre-save hook running ===');
  console.log('isNew:', this.isNew);
  console.log('orderNumber before:', this.orderNumber);
  
  try {
    if (!this.orderNumber) {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      
      // Get count of all orders for unique sequential number
      const count = await mongoose.model('Order').countDocuments();
      
      // Format: ORD-YYMMDD-HHMMSS-COUNT
      this.orderNumber = `ORD-${year}${month}${day}-${hours}${minutes}${seconds}-${(count + 1).toString().padStart(4, '0')}`;
      
      console.log('Generated order number:', this.orderNumber);
    }
    //next();
  } catch (error) {
    console.error('Error in pre-save hook:', error);
    //next(error);
  }
});

// Virtual for getting specific vendor order
orderSchema.methods.getVendorOrder = function(vendorId) {
  return this.vendorOrders.find(
    vo => vo.vendorId.toString() === vendorId.toString()
  );
};

// Method to update vendor order status
orderSchema.methods.updateVendorOrderStatus = async function(vendorId, status, note, userId) {
  console.log('Updating vendor order status:', {
    vendorId,
    status,
    note
  });
  
  const vendorOrder = this.vendorOrders.find(
    vo => vo.vendorId.toString() === vendorId.toString()
  );
  
  if (!vendorOrder) {
    throw new Error('Vendor order not found');
  }
  
  vendorOrder.status = status;
  vendorOrder.statusHistory.push({
    status,
    timestamp: new Date(),
    note,
    updatedBy: userId
  });
  
  // Set actual delivery time if status is delivered or picked up
  if (['delivered', 'picked_up'].includes(status)) {
    vendorOrder.actualDeliveryTime = new Date();
  }
  
  // Update overall order status
  this.updateOverallStatus();
  
  return this.save();
};

// Method to update overall order status based on vendor orders
orderSchema.methods.updateOverallStatus = function() {
  const statuses = this.vendorOrders.map(vo => vo.status);
  
  // Check if all vendor orders are delivered/picked up
  const allCompleted = statuses.every(s => ['delivered', 'picked_up'].includes(s));
  const anyCancelled = statuses.some(s => s === 'cancelled');
  const allCancelled = statuses.every(s => s === 'cancelled');
  const anyProcessing = statuses.some(s => !['delivered', 'picked_up', 'cancelled', 'rejected'].includes(s));
  const anyDelivered = statuses.some(s => ['delivered', 'picked_up'].includes(s));
  
  if (allCompleted) {
    this.overallStatus = 'completed';
  } else if (allCancelled) {
    this.overallStatus = 'cancelled';
  } else if (anyDelivered && anyProcessing) {
    this.overallStatus = 'partially_delivered';
  } else if (anyDelivered && anyCancelled) {
    this.overallStatus = 'partially_cancelled';
  } else if (anyProcessing) {
    this.overallStatus = 'processing';
  }
  
  console.log('Updated overall status to:', this.overallStatus);
};

const Order = mongoose.model("Order", orderSchema);

export default Order;