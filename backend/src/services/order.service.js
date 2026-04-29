import orderRepository from "../repositories/order.repository.js";
import cartRepository from "../repositories/cart.repository.js";
import productRepository from "../repositories/product.repository.js";
import vendorRepository from "../repositories/vendor.repository.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

export class OrderService {
  constructor(
    orderRepo = orderRepository,
    cartRepo = cartRepository,
    productRepo = productRepository,
    vendorRepo = vendorRepository
  ) {
    this.orderRepo = orderRepo;
    this.cartRepo = cartRepo;
    this.productRepo = productRepo;
    this.vendorRepo = vendorRepo;
  }

  async createOrderFromCart(userId, orderData) {
    // Get user's cart with populated vendor data
    const cart = await this.cartRepo.findByUserId(userId);
    
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    // Validate required fields
    if (!orderData.deliveryAddress) {
      throw new ApiError(400, "Delivery address is required");
    }
    
    if (!orderData.paymentMethod) {
      throw new ApiError(400, "Payment method is required");
    }

    if (!orderData.phone) {
      throw new ApiError(400, "Customer phone number is required");
    }

    // Validate all products are still available and prices are current
    const validationResult = await this.validateCartItems(cart.items);
    
    if (!validationResult.valid) {
      throw new ApiError(400, "Some items in your cart are no longer available", validationResult.issues);
    }

    // Group items by vendor
    const vendorGroups = this.groupItemsByVendor(cart.items);
    
    console.log('Vendor groups:', Object.keys(vendorGroups));
    
    // Create vendor orders
    const vendorOrders = [];
    let totalItems = 0;
    let totalQuantity = 0;
    let subtotal = 0;
    let totalDeliveryFee = 0;

    for (const [vendorId, items] of Object.entries(vendorGroups)) {
      console.log(`Processing vendor: ${vendorId}`);
      console.log(`Items count: ${items.length}`);
      
      // Convert vendorId string to ObjectId if needed
      const vendorObjectId = typeof vendorId === 'string' 
        ? new mongoose.Types.ObjectId(vendorId) 
        : vendorId;
      
      // Find vendor
      const vendor = await this.vendorRepo.findById(vendorObjectId);
      
      if (!vendor || !vendor.isActive) {
        console.log(`Vendor ${vendorId} not found or inactive`);
        throw new ApiError(400, `Vendor is not available`);
      }

      console.log(`Vendor found: ${vendor.storeName}`);

      const vendorSubtotal = items.reduce((sum, item) => {
        const itemPrice = parseFloat(item.price) || 0;
        const itemQuantity = parseInt(item.quantity) || 0;
        return sum + (itemPrice * itemQuantity);
      }, 0);
      
      const deliveryFee = vendor.deliveryFee || 0;
      const vendorTotal = vendorSubtotal + deliveryFee;

      totalItems += items.length;
      totalQuantity += items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
      subtotal += vendorSubtotal;
      totalDeliveryFee += deliveryFee;

      // Format items for vendor order
      const formattedItems = items.map(item => {
        // Get vendor ID properly
        let itemVendorId = item.vendorId;
        if (itemVendorId && typeof itemVendorId === 'object') {
          itemVendorId = itemVendorId._id || itemVendorId;
        }
        if (typeof itemVendorId === 'string') {
          itemVendorId = new mongoose.Types.ObjectId(itemVendorId);
        }
        
        return {
          productId: typeof item.productId === 'string' 
            ? new mongoose.Types.ObjectId(item.productId) 
            : item.productId,
          variantId: item.variantId ? (
            typeof item.variantId === 'string' 
              ? new mongoose.Types.ObjectId(item.variantId) 
              : item.variantId
          ) : undefined,
          name: item.name || 'Unknown Product',
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 1,
          image: item.image || null,
          attributes: item.attributes || new Map(),
          subtotal: (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)
        };
      });

      const vendorOrderData = {
        vendorId: vendorObjectId,
        vendorName: vendor.storeName,
        items: formattedItems,
        subtotal: vendorSubtotal,
        deliveryFee: deliveryFee,
        discountAmount: 0,
        total: vendorTotal,
        status: 'pending',
        statusHistory: [{
          status: 'pending',
          timestamp: new Date(),
          note: 'Order placed'
        }]
      };

      vendorOrders.push(vendorOrderData);
    }

    // Calculate discount if coupon was applied
    let discountAmount = 0;
    let couponCode = null;
    
    if (cart.coupon && cart.coupon.code) {
      couponCode = cart.coupon.code;
      discountAmount = cart.discountAmount || 0;
      
      // Distribute discount proportionally among vendors
      if (discountAmount > 0 && subtotal > 0) {
        for (const vendorOrder of vendorOrders) {
          const proportion = vendorOrder.subtotal / subtotal;
          vendorOrder.discountAmount = parseFloat((discountAmount * proportion).toFixed(2));
          vendorOrder.total = parseFloat((vendorOrder.subtotal + vendorOrder.deliveryFee - vendorOrder.discountAmount).toFixed(2));
        }
      }
    }

    const grandTotal = parseFloat((subtotal + totalDeliveryFee - discountAmount).toFixed(2));

    // Create the final order object
    const finalOrderData = {
      userId: new mongoose.Types.ObjectId(userId),
      vendorOrders,
      customerInfo: {
        name: orderData.name || 'Customer',
        email: orderData.email || 'customer@example.com',
        phone: orderData.phone
      },
      deliveryAddress: {
        fullAddress: orderData.deliveryAddress,
        landmark: orderData.landmark || null,
        area: orderData.area || null,
        city: orderData.city || 'Addis Ababa',
        state: orderData.state || 'Addis Ababa',
        postalCode: orderData.postalCode || null,
        country: orderData.country || 'Ethiopia',
        coordinates: orderData.coordinates || {
          type: "Point",
          coordinates: [38.7578, 9.0092]
        },
        deliveryInstructions: orderData.deliveryInstructions || null
      },
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'pending',
      orderSummary: {
        totalItems,
        totalQuantity,
        subtotal,
        totalDeliveryFee,
        discountAmount,
        couponCode,
        grandTotal
      },
      overallStatus: 'pending',
      orderDate: new Date(),
      customerNotes: orderData.notes || null
    };

    console.log('Creating order with data:', JSON.stringify({
      userId: finalOrderData.userId,
      vendorOrdersCount: finalOrderData.vendorOrders.length,
      grandTotal: finalOrderData.orderSummary.grandTotal
    }));

    const order = await this.orderRepo.createOrder(finalOrderData);

    // Clear the cart after successful order creation
    await this.cartRepo.clearCart(userId);

    // Update product inventory
    await this.updateProductInventory(cart.items);

    // Populate the order for response
    const populatedOrder = await this.orderRepo.findByIdWithDetails(order._id);
    
    return populatedOrder;
  }

  async getOrderById(orderId, userId = null, vendorId = null) {
    const order = await this.orderRepo.findByIdWithDetails(orderId);
    
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Check access rights
    if (userId && order.userId._id.toString() !== userId.toString()) {
      // Check if user is one of the vendors
      const isVendor = order.vendorOrders.some(
        vo => vo.vendorId._id.toString() === (vendorId || userId).toString()
      );
      
      if (!isVendor) {
        throw new ApiError(403, "You don't have access to this order");
      }
    }

    return order;
  }

  async getUserOrders(userId, options = {}) {
    return this.orderRepo.findByUserId(new mongoose.Types.ObjectId(userId), options);
  }

  async getVendorOrders(vendorId, options = {}) {
    return this.orderRepo.findByVendorId(new mongoose.Types.ObjectId(vendorId), options);
  }

  async updateVendorOrderStatus(orderId, vendorId, status, note, userId) {
    const order = await this.orderRepo.findById(orderId);
    
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Ensure vendorId is ObjectId
    const vendorObjectId = typeof vendorId === 'string' 
      ? new mongoose.Types.ObjectId(vendorId) 
      : vendorId;

    // Verify vendor owns this part of the order
    const vendorOrder = order.vendorOrders.find(
      vo => vo.vendorId.toString() === vendorObjectId.toString()
    );

    if (!vendorOrder) {
      throw new ApiError(403, "This order doesn't belong to your store");
    }

    // Validate status transition
    this.validateStatusTransition(vendorOrder.status, status);

    const updatedOrder = await this.orderRepo.updateVendorOrderStatus(
      orderId,
      vendorObjectId,
      { 
        status, 
        note: note || '', 
        userId: new mongoose.Types.ObjectId(userId)
      }
    );

    return updatedOrder;
  }

  async cancelOrder(orderId, userId, reason, role = 'customer') {
    const order = await this.orderRepo.findById(orderId);
    
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Check if user can cancel
    if (role === 'customer' && order.userId.toString() !== userId.toString()) {
      throw new ApiError(403, "You can only cancel your own orders");
    }

    // Check if order can be cancelled
    const hasActiveVendorOrders = order.vendorOrders.some(
      vo => !['delivered', 'picked_up', 'cancelled', 'rejected'].includes(vo.status)
    );

    if (!hasActiveVendorOrders) {
      throw new ApiError(400, "Order cannot be cancelled because all items are already delivered/completed");
    }

    // Cancel all pending vendor orders
    for (const vendorOrder of order.vendorOrders) {
      if (!['delivered', 'picked_up', 'cancelled', 'rejected'].includes(vendorOrder.status)) {
        vendorOrder.status = 'cancelled';
        vendorOrder.cancellationReason = reason;
        vendorOrder.statusHistory.push({
          status: 'cancelled',
          timestamp: new Date(),
          note: `Cancelled by ${role}: ${reason}`,
          updatedBy: new mongoose.Types.ObjectId(userId)
        });
      }
    }

    order.overallStatus = 'cancelled';
    order.cancellationReason = reason;
    order.cancelledBy = new mongoose.Types.ObjectId(userId);
    order.cancelledAt = new Date();

    return order.save();
  }

  async cancelVendorOrder(orderId, vendorId, userId, reason) {
    const order = await this.orderRepo.findById(orderId);
    
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    const vendorObjectId = typeof vendorId === 'string' 
      ? new mongoose.Types.ObjectId(vendorId) 
      : vendorId;

    const vendorOrder = order.vendorOrders.find(
      vo => vo.vendorId.toString() === vendorObjectId.toString()
    );

    if (!vendorOrder) {
      throw new ApiError(404, "Vendor order not found");
    }

    if (['delivered', 'picked_up', 'cancelled', 'rejected'].includes(vendorOrder.status)) {
      throw new ApiError(400, "This vendor order cannot be cancelled");
    }

    vendorOrder.status = 'cancelled';
    vendorOrder.cancellationReason = reason;
    vendorOrder.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: `Cancelled by vendor: ${reason}`,
      updatedBy: new mongoose.Types.ObjectId(userId)
    });

    await order.updateOverallStatus();
    return order.save();
  }

  async getOrderStats(userId = null, vendorId = null) {
    const userId_obj = userId ? new mongoose.Types.ObjectId(userId) : null;
    const vendorId_obj = vendorId ? new mongoose.Types.ObjectId(vendorId) : null;
    return this.orderRepo.getOrderStats(userId_obj, vendorId_obj);
  }

  async getOrderByNumber(orderNumber) {
    const order = await this.orderRepo.getOrderByNumber(orderNumber);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }
    return order;
  }

  // Helper methods
  validateStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      'pending': ['confirmed', 'rejected', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['ready_for_pickup', 'out_for_delivery', 'cancelled'],
      'ready_for_pickup': ['picked_up', 'cancelled'],
      'out_for_delivery': ['delivered', 'cancelled'],
      'delivered': [],
      'picked_up': [],
      'cancelled': [],
      'rejected': []
    };

    const allowedNextStatuses = validTransitions[currentStatus] || [];
    
    if (!allowedNextStatuses.includes(newStatus)) {
      throw new ApiError(400, 
        `Cannot change status from '${currentStatus}' to '${newStatus}'. Allowed transitions: ${allowedNextStatuses.join(', ')}`
      );
    }
  }

  groupItemsByVendor(items) {
    const groups = {};
    
    for (const item of items) {
      // Extract vendor ID properly
      let vendorId;
      if (item.vendorId) {
        if (typeof item.vendorId === 'object' && item.vendorId !== null) {
          // If vendorId is populated object, get _id
          vendorId = item.vendorId._id ? item.vendorId._id.toString() : item.vendorId.toString();
        } else {
          vendorId = item.vendorId.toString();
        }
      } else if (item.productId && typeof item.productId === 'object') {
        // Try to get vendor from populated product
        vendorId = item.productId.vendorId ? item.productId.vendorId.toString() : null;
      }
      
      if (!vendorId) {
        console.warn('Item missing vendorId:', item);
        continue;
      }
      
      console.log(`Grouping item to vendor: ${vendorId}`);
      
      if (!groups[vendorId]) {
        groups[vendorId] = [];
      }
      groups[vendorId].push(item);
    }
    
    console.log('Grouped vendors:', Object.keys(groups));
    return groups;
  }

  async validateCartItems(cartItems) {
    const issues = [];
    
    for (const item of cartItems) {
      // Get product ID properly
      const productId = typeof item.productId === 'object' 
        ? item.productId._id || item.productId 
        : item.productId;
      
      const product = await this.productRepo.findById(productId);
      
      if (!product) {
        issues.push({
          itemId: item._id,
          productId: productId,
          message: `${item.name || 'Product'} is no longer available`
        });
        continue;
      }

      if (!product.isAvailable) {
        issues.push({
          itemId: item._id,
          productId: productId,
          message: `${product.name} is currently unavailable`
        });
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  calculateCurrentPrice(product, variantId) {
    let price = product.basePrice;
    
    if (variantId && product.variants) {
      const variant = product.variants.find(v => v._id.toString() === variantId.toString());
      if (variant && variant.price) {
        price = variant.price;
      }
    }
    
    if (product.discount && product.discount.isActive) {
      const discountAmount = (price * product.discount.percentage) / 100;
      price -= discountAmount;
    }
    
    return price;
  }

  async updateProductInventory(cartItems) {
    for (const item of cartItems) {
      const productId = typeof item.productId === 'object' 
        ? item.productId._id || item.productId 
        : item.productId;
      
      const product = await this.productRepo.findById(productId);
      
      if (product) {
        if (item.variantId && product.variants) {
          const variantId = typeof item.variantId === 'object'
            ? item.variantId._id || item.variantId
            : item.variantId;
          
          const variantIndex = product.variants.findIndex(
            v => v._id.toString() === variantId.toString()
          );
          
          if (variantIndex > -1 && product.variants[variantIndex].stock !== undefined) {
            product.variants[variantIndex].stock -= (parseInt(item.quantity) || 1);
          }
        }
        
        if (product.inventory && product.inventory.totalStock !== undefined) {
          product.inventory.totalStock -= (parseInt(item.quantity) || 1);
        }
        
        product.purchases = (product.purchases || 0) + (parseInt(item.quantity) || 1);
        await product.save();
      }
    }
  }
}