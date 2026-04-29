// repositories/cart.repository.js
import BaseRepository from "./base.repository.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";

class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  async findByUserId(userId) {
    return this.model.findOne({ userId })
      .populate({
        path: 'items.productId',
        model: 'Product',
        select: 'name basePrice images variants isAvailable inventory vendorId discount',
        populate: [
          {
            path: 'vendorId',
            model: 'Vendor',
            select: 'storeName isActive universityNear deliveryAvailable pickupAvailable'
          }
        ]
      })
      .populate({
        path: 'items.vendorId',
        model: 'Vendor',
        select: 'storeName isActive universityNear deliveryAvailable pickupAvailable'
      });
  }

  async addItem(userId, itemData) {
    const cart = await this.model.findOne({ userId });
    
    if (!cart) {
      // Create new cart with item
      return this.model.create({
        userId,
        items: [itemData]
      });
    }

    // Check if same product/variant exists
    const existingItemIndex = cart.items.findIndex(item => {
      const sameProduct = item.productId.toString() === itemData.productId.toString();
      const sameVariant = itemData.variantId 
        ? item.variantId?.toString() === itemData.variantId.toString()
        : !item.variantId;
      return sameProduct && sameVariant;
    });

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += itemData.quantity;
    } else {
      // Add new item
      cart.items.push(itemData);
    }

    const savedCart = await cart.save();
    console.log('Cart saved with totals:', {
      itemCount: savedCart.itemCount,
      totalQuantity: savedCart.totalQuantity,
      subtotal: savedCart.subtotal,
      total: savedCart.total
    });
    return savedCart;
  }

  async updateItemQuantity(userId, itemId, quantity) {
    // First find and update the cart
    const cart = await this.model.findOne({ userId });
    
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    // Find the item and update quantity
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId.toString());
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }
    
    cart.items[itemIndex].quantity = quantity;
    
    // Save the cart to trigger pre-save middleware for total recalculation
    const savedCart = await cart.save();
    
    // Populate the necessary fields
    return savedCart.populate([
      {
        path: 'items.productId',
        model: 'Product',
        select: 'name basePrice images variants isAvailable inventory vendorId discount',
        populate: [
          {
            path: 'vendorId',
            model: 'Vendor',
            select: 'storeName isActive universityNear deliveryAvailable pickupAvailable'
          }
        ]
      },
      {
        path: 'items.vendorId',
        model: 'Vendor',
        select: 'storeName isActive universityNear deliveryAvailable pickupAvailable'
      }
    ]);
  }

  async removeItem(userId, itemId) {
    // First find the cart
    const cart = await this.model.findOne({ userId });
    
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    // Remove the item
    cart.items = cart.items.filter(item => item._id.toString() !== itemId.toString());
    
    // Save the cart to trigger pre-save middleware for total recalculation
    const savedCart = await cart.save();
    
    // Populate the necessary fields
    return savedCart.populate([
      {
        path: 'items.productId',
        model: 'Product',
        select: 'name basePrice images variants isAvailable inventory vendorId discount',
        populate: [
          {
            path: 'vendorId',
            model: 'Vendor',
            select: 'storeName isActive universityNear deliveryAvailable pickupAvailable'
          }
        ]
      },
      {
        path: 'items.vendorId',
        model: 'Vendor',
        select: 'storeName isActive universityNear deliveryAvailable pickupAvailable'
      }
    ]);
  }

  async clearCart(userId) {
    return this.model.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          items: [], 
          coupon: null,
          notes: null 
        } 
      },
      { new: true }
    );
  }

  async applyCoupon(userId, couponData) {
    return this.model.findOneAndUpdate(
      { userId },
      { $set: { coupon: couponData } },
      { new: true }
    );
  }

  async removeCoupon(userId) {
    return this.model.findOneAndUpdate(
      { userId },
      { $set: { coupon: null } },
      { new: true }
    );
  }

  async addNotes(userId, notes) {
    return this.model.findOneAndUpdate(
      { userId },
      { $set: { notes } },
      { new: true }
    );
  }

  async getCartCount(userId) {
    const cart = await this.model.findOne({ userId });
    return cart ? cart.itemCount : 0;
  }

  async getCartTotalQuantity(userId) {
    const cart = await this.model.findOne({ userId });
    return cart ? cart.totalQuantity : 0;
  }

  async mergeCarts(userId, sessionCartItems) {
    const cart = await this.model.findOne({ userId });
    
    if (!cart) {
      return this.model.create({
        userId,
        items: sessionCartItems
      });
    }

    // Merge session items with existing cart
    for (const sessionItem of sessionCartItems) {
      const existingItemIndex = cart.items.findIndex(item => {
        const sameProduct = item.productId.toString() === sessionItem.productId.toString();
        const sameVariant = sessionItem.variantId 
          ? item.variantId?.toString() === sessionItem.variantId.toString()
          : !item.variantId;
        return sameProduct && sameVariant;
      });

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += sessionItem.quantity;
      } else {
        cart.items.push(sessionItem);
      }
    }

    return cart.save();
  }

  async getCartByProductId(productId) {
    return this.model.find({ 'items.productId': productId });
  }

  async removeProductFromAllCarts(productId) {
    return this.model.updateMany(
      { 'items.productId': productId },
      { $pull: { items: { productId: productId } } }
    );
  }

  async updateItemPrice(productId, newPrice) {
    return this.model.updateMany(
      { 'items.productId': productId },
      { $set: { 'items.$.price': newPrice } }
    );
  }
}

export default new CartRepository();