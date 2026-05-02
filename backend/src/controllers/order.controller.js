import { OrderService } from "../services/order.service.js";
import { CartService } from "../services/cart.service.js";
import { VendorService } from "../services/vendor.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export class OrderController {
  constructor() {
    this.orderService = new OrderService();
    this.cartService = new CartService();
    this.vendorService = new VendorService();
  }

  // Create order from cart (checkout)
  createOrder = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    
    console.log('=== Creating Order ===');
    console.log('User ID:', userId);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Build the order data object properly
    const orderData = {
      name: req.body.name || req.user?.name || 'Customer',
      email: req.body.email || req.user?.email || '',
      phone: req.body.phone,  // This is what we're validating
      deliveryAddress: req.body.deliveryAddress,
      landmark: req.body.landmark,
      area: req.body.area,
      city: req.body.city || 'Addis Ababa',
      state: req.body.state || 'Addis Ababa',
      postalCode: req.body.postalCode,
      country: req.body.country || 'Ethiopia',
      deliveryInstructions: req.body.deliveryInstructions,
      coordinates: req.body.coordinates,
      paymentMethod: req.body.paymentMethod,
      notes: req.body.notes
    };
    
    console.log('Processed order data:', JSON.stringify(orderData, null, 2));
    console.log('Phone value:', orderData.phone);
    
    // Validate phone is provided
    if (!orderData.phone) {
      return sendResponse(res, 400, "Customer phone number is required", null);
    }
    
    // Validate delivery address
    if (!orderData.deliveryAddress) {
      return sendResponse(res, 400, "Delivery address is required", null);
    }
    
    // Validate payment method
    if (!orderData.paymentMethod) {
      return sendResponse(res, 400, "Payment method is required", null);
    }
    
    const order = await this.orderService.createOrderFromCart(userId, orderData);
    
    sendResponse(res, 201, "Order created successfully", order);
  });

  // Get user's orders
  getUserOrders = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { page = 1, limit = 10, status, sort } = req.query;
    
    const orders = await this.orderService.getUserOrders(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      sort
    });
    
    sendResponse(res, 200, "Orders fetched successfully", orders);
  });

  // Get vendor's orders
  getVendorOrders = asyncHandler(async (req, res, next) => {
    // Get vendor profile
    const vendor = await this.vendorService.getVendorByUserId(req.user._id);
    
    if (!vendor) {
      return sendResponse(res, 404, "Vendor profile not found");
    }
    
    const { page = 1, limit = 10, status, sort } = req.query;
    
    const orders = await this.orderService.getVendorOrders(vendor._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      sort
    });
    
    sendResponse(res, 200, "Vendor orders fetched successfully", orders);
  });

  // Get single order by ID
  getOrder = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Try to get vendor ID (if user is a vendor)
    let vendorId = null;
    try {
      const vendor = await this.vendorService.getVendorByUserId(userId);
      vendorId = vendor?._id;
    } catch (error) {
      // User is not a vendor, that's fine
    }
    
    const order = await this.orderService.getOrderById(id, userId, vendorId);
    
    sendResponse(res, 200, "Order fetched successfully", order);
  });

  // Get order by order number
  getOrderByNumber = asyncHandler(async (req, res, next) => {
    const { orderNumber } = req.params;
    
    const order = await this.orderService.getOrderByNumber(orderNumber);
    
    // Check access
    const userId = req.user._id;
    const isOwner = order.userId._id.toString() === userId.toString();
    
    let isVendor = false;
    try {
      const vendor = await this.vendorService.getVendorByUserId(userId);
      if (vendor) {
        isVendor = order.vendorOrders.some(
          vo => vo.vendorId.toString() === vendor._id.toString()
        );
      }
    } catch (error) {
      // Not a vendor
    }
    
    if (!isOwner && !isVendor && req.user.role !== 'admin') {
      return sendResponse(res, 403, "You don't have access to this order");
    }
    
    sendResponse(res, 200, "Order fetched successfully", order);
  });

  // Update vendor order status (for vendors)
  updateVendorOrderStatus = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const { status, note } = req.body;
    
    // Get vendor profile
    const vendor = await this.vendorService.getVendorByUserId(req.user._id);
    
    if (!vendor) {
      return sendResponse(res, 404, "Vendor profile not found");
    }
    
    if (!status) {
      return sendResponse(res, 400, "Status is required");
    }
    
    const updatedOrder = await this.orderService.updateVendorOrderStatus(
      orderId,
      vendor._id,
      status,
      note || '',
      req.user._id
    );
    
    sendResponse(res, 200, "Order status updated successfully", updatedOrder);
  });

  // Cancel order (customer)
  cancelOrder = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    
    if (!reason) {
      return sendResponse(res, 400, "Cancellation reason is required");
    }
    
    const order = await this.orderService.cancelOrder(
      orderId,
      userId,
      reason,
      'customer'
    );
    
    sendResponse(res, 200, "Order cancelled successfully", order);
  });

  // Cancel vendor order (vendor)
  cancelVendorOrder = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const vendor = await this.vendorService.getVendorByUserId(req.user._id);
    
    if (!vendor) {
      return sendResponse(res, 404, "Vendor profile not found");
    }
    
    if (!reason) {
      return sendResponse(res, 400, "Cancellation reason is required");
    }
    
    const order = await this.orderService.cancelVendorOrder(
      orderId,
      vendor._id,
      req.user._id,
      reason
    );
    
    sendResponse(res, 200, "Order cancelled successfully", order);
  });

  // Get order statistics
  getOrderStats = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    let vendorId = null;
    
    if (req.user.role === 'vendor') {
      const vendor = await this.vendorService.getVendorByUserId(userId);
      vendorId = vendor?._id;
    }
    
    const stats = await this.orderService.getOrderStats(
      req.user.role === 'customer' ? userId : null,
      vendorId
    );
    
    sendResponse(res, 200, "Order statistics fetched successfully", stats);
  });

  // Validate cart before checkout
  validateCartForCheckout = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    
    const cart = await this.cartService.getCart(userId);
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return sendResponse(res, 200, "Cart validation completed", { 
        valid: false, 
        message: "Your cart is empty",
        issues: []
      });
    }
    
    const validation = await this.orderService.validateCartItems(cart.items);
    
    const response = {
      valid: validation.valid,
      issues: validation.issues,
      cart: validation.valid ? cart : null
    };
    
    sendResponse(res, 200, "Cart validation completed", response);
  });
}