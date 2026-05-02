// repositories/wishlist.repository.js
import BaseRepository from "./base.repository.js";
import Wishlist from "../models/wishlist.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";

class WishlistRepository extends BaseRepository {
  constructor() {
    super(Wishlist);
  }

  async findByUserId(userId) {
    return this.model.findOne({ userId })
      .populate({
        path: 'products',
        model: 'Product',
        populate: [
          {
            path: 'categories',
            model: 'Category',
            strictPopulate: false
          },
          {
            path: 'vendorId',
            model: 'Vendor',
            select: 'storeName isActive universityNear'
          }
        ]
      });
  }

  async addProduct(userId, productId) {
    return this.model.findOneAndUpdate(
      { userId },
      { 
        $setOnInsert: { userId },
        $addToSet: { products: productId }
      },
      { 
        upsert: true,
        new: true,
        runValidators: true
      }
    ).populate({
      path: 'products',
      model: 'Product',
      populate: [
        {
          path: 'categories',
          model: 'Category',
          strictPopulate: false
        },
        {
          path: 'vendorId',
          model: 'Vendor',
          select: 'storeName isActive universityNear'
        }
      ]
    });
  }

  async removeProduct(userId, productId) {
    return this.model.findOneAndUpdate(
      { userId },
      { $pull: { products: productId } },
      { new: true }
    ).populate({
      path: 'products',
      model: 'Product',
      populate: [
        {
          path: 'categories',
          model: 'Category',
          strictPopulate: false
        },
        {
          path: 'vendorId',
          model: 'Vendor',
          select: 'storeName isActive universityNear'
        }
      ]
    });
  }

  async clearWishlist(userId) {
    return this.model.findOneAndUpdate(
      { userId },
      { $set: { products: [] } },
      { new: true }
    );
  }

  async isProductInWishlist(userId, productId) {
    const wishlist = await this.model.findOne({ 
      userId,
      products: productId
    });
    return !!wishlist;
  }

  async getWishlistCount(userId) {
    const wishlist = await this.model.findOne({ userId });
    return wishlist ? wishlist.products.length : 0;
  }

  async getWishlistByProductId(productId) {
    return this.model.find({ products: productId });
  }
}

export default new WishlistRepository();