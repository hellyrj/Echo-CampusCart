import BaseRepository from "./base.repository.js";
import Order from "../models/order.model.js";
import mongoose from "mongoose";

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  async createOrder(orderData) {
    console.log('=== Creating Order in Repository ===');
    console.log('Order data received:', JSON.stringify({
      userId: orderData.userId,
      vendorOrdersCount: orderData.vendorOrders?.length,
      grandTotal: orderData.orderSummary?.grandTotal
    }));
    
    try {
      // Create a new Order instance (this triggers the pre-save hook)
      const order = new Order(orderData);
      
      console.log('Order instance created, saving...');
      
      // Save the order (this triggers pre-save middleware which generates orderNumber)
      const savedOrder = await order.save();
      
      console.log('Order saved successfully:', {
        orderId: savedOrder._id,
        orderNumber: savedOrder.orderNumber,
        status: savedOrder.overallStatus
      });
      
      return savedOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      
      // If it's a validation error, provide more details
      if (error.name === 'ValidationError') {
        const errors = Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }));
        console.error('Validation errors:', errors);
        throw new Error(`Order validation failed: ${errors.map(e => e.message).join(', ')}`);
      }
      
      throw error;
    }
  }

  async findByUserId(userId, options = {}) {
    const { page = 1, limit = 10, status, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;
    
    // Ensure userId is ObjectId
    const userObjectId = typeof userId === 'string' 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;
    
    const query = { userId: userObjectId };
    if (status) {
      query.overallStatus = status;
    }
    
    console.log('Finding orders for user:', userObjectId);
    console.log('Query:', query);
    
    const orders = await this.model.find(query)
      .populate({
        path: 'vendorOrders.items.productId',
        model: 'Product',
        select: 'name images basePrice'
      })
      .populate({
        path: 'vendorOrders.vendorId',
        model: 'Vendor',
        select: 'storeName phone logo'
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    console.log(`Found ${orders.length} orders for user`);
    
    return orders;
  }

  async findByVendorId(vendorId, options = {}) {
    const { page = 1, limit = 10, status, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;
    
    // Ensure vendorId is ObjectId
    const vendorObjectId = typeof vendorId === 'string' 
      ? new mongoose.Types.ObjectId(vendorId) 
      : vendorId;
    
    const query = { 'vendorOrders.vendorId': vendorObjectId };
    if (status) {
      query['vendorOrders.status'] = status;
    }
    
    console.log('Finding orders for vendor:', vendorObjectId);
    console.log('Query:', JSON.stringify(query));
    
    const orders = await this.model.find(query)
      .populate('userId', 'name email phone')
      .populate({
        path: 'vendorOrders.items.productId',
        model: 'Product',
        select: 'name images basePrice'
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    console.log(`Found ${orders.length} orders for vendor`);
    
    return orders;
  }

  async findByIdWithDetails(orderId) {
    console.log('Finding order by ID:', orderId);
    
    const orderObjectId = typeof orderId === 'string' 
      ? new mongoose.Types.ObjectId(orderId) 
      : orderId;
    
    const order = await this.model.findById(orderObjectId)
      .populate('userId', 'name email phone')
      .populate({
        path: 'vendorOrders.vendorId',
        model: 'Vendor',
        select: 'storeName phone logo deliveryAvailable pickupAvailable'
      })
      .populate({
        path: 'vendorOrders.items.productId',
        model: 'Product',
        select: 'name images basePrice vendorId'
      });
    
    if (!order) {
      console.log('Order not found:', orderId);
    } else {
      console.log('Order found:', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.overallStatus
      });
    }
    
    return order;
  }

  async updateVendorOrderStatus(orderId, vendorId, statusData) {
    console.log('Updating vendor order status:', {
      orderId,
      vendorId,
      status: statusData.status
    });
    
    const orderObjectId = typeof orderId === 'string' 
      ? new mongoose.Types.ObjectId(orderId) 
      : orderId;
    
    const order = await this.model.findById(orderObjectId);
    
    if (!order) {
      console.error('Order not found for status update:', orderId);
      throw new Error('Order not found');
    }
    
    // Use the schema method to update status
    await order.updateVendorOrderStatus(
      vendorId,
      statusData.status,
      statusData.note,
      statusData.userId
    );
    
    console.log('Vendor order status updated successfully');
    
    return order;
  }

  async getOrderStats(userId = null, vendorId = null) {
    const matchStage = {};
    
    if (userId) {
      matchStage.userId = userId;
    }
    
    if (vendorId) {
      matchStage['vendorOrders.vendorId'] = vendorId;
    }
    
    console.log('Getting order stats with match:', matchStage);
    
    const pipeline = [];
    
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    pipeline.push({ $unwind: '$vendorOrders' });
    
    if (vendorId) {
      pipeline.push({ 
        $match: { 
          'vendorOrders.vendorId': vendorId 
        } 
      });
    }
    
    pipeline.push({
      $group: {
        _id: '$vendorOrders.status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$vendorOrders.total' }
      }
    });
    
    const stats = await this.model.aggregate(pipeline);
    
    console.log('Order stats:', stats);
    
    return stats;
  }

  async getOrderByNumber(orderNumber) {
    console.log('Finding order by number:', orderNumber);
    
    const order = await this.model.findOne({ orderNumber })
      .populate('userId', 'name email phone')
      .populate({
        path: 'vendorOrders.vendorId',
        model: 'Vendor',
        select: 'storeName phone logo'
      })
      .populate({
        path: 'vendorOrders.items.productId',
        model: 'Product',
        select: 'name images basePrice'
      });
    
    if (order) {
      console.log('Order found by number:', {
        orderId: order._id,
        orderNumber: order.orderNumber
      });
    } else {
      console.log('No order found with number:', orderNumber);
    }
    
    return order;
  }

  async countUserOrders(userId, status = null) {
    const userObjectId = typeof userId === 'string' 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;
    
    const query = { userId: userObjectId };
    if (status) {
      query.overallStatus = status;
    }
    
    return this.model.countDocuments(query);
  }

  async countVendorOrders(vendorId, status = null) {
    const vendorObjectId = typeof vendorId === 'string' 
      ? new mongoose.Types.ObjectId(vendorId) 
      : vendorId;
    
    const query = { 'vendorOrders.vendorId': vendorObjectId };
    if (status) {
      query['vendorOrders.status'] = status;
    }
    
    return this.model.countDocuments(query);
  }
}

export default new OrderRepository();