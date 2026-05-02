// services/wishlist.service.js
import WishlistRepository from "../repositories/wishlist.repository.js";
import { ApiError } from "../utils/ApiError.js";
import ProductRepository from "../repositories/product.repository.js";

export class WishlistService {
  constructor(wishlistRepo = WishlistRepository) {
    this.wishlistRepo = wishlistRepo;
    this.productRepo = ProductRepository;
  }

  async getWishlist(userId) {
    const wishlist = await this.wishlistRepo.findByUserId(userId);
    
    if (!wishlist) {
      // Return empty wishlist structure if none exists
      return { userId, products: [] };
    }
    
    return wishlist;
  }

  async addToWishlist(userId, productId) {
    // Check if product exists and is available
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    if (!product.isAvailable) {
      throw new ApiError(400, "Cannot add unavailable product to wishlist");
    }

    // Check if already in wishlist
    const isInWishlist = await this.wishlistRepo.isProductInWishlist(userId, productId);
    if (isInWishlist) {
      throw new ApiError(400, "Product already in wishlist");
    }

    // Add to wishlist
    const wishlist = await this.wishlistRepo.addProduct(userId, productId);
    return wishlist;
  }

  async removeFromWishlist(userId, productId) {
    const isInWishlist = await this.wishlistRepo.isProductInWishlist(userId, productId);
    if (!isInWishlist) {
      throw new ApiError(400, "Product not found in wishlist");
    }

    const wishlist = await this.wishlistRepo.removeProduct(userId, productId);
    return wishlist;
  }

  async toggleWishlistItem(userId, productId) {
    const isInWishlist = await this.wishlistRepo.isProductInWishlist(userId, productId);
    
    if (isInWishlist) {
      await this.wishlistRepo.removeProduct(userId, productId);
      return { added: false, message: "Product removed from wishlist" };
    } else {
      // Check if product exists
      const product = await this.productRepo.findById(productId);
      if (!product) {
        throw new ApiError(404, "Product not found");
      }
      
      await this.wishlistRepo.addProduct(userId, productId);
      return { added: true, message: "Product added to wishlist" };
    }
  }

  async clearWishlist(userId) {
    const wishlist = await this.wishlistRepo.clearWishlist(userId);
    return wishlist;
  }

  async getWishlistCount(userId) {
    return this.wishlistRepo.getWishlistCount(userId);
  }

  async checkProductInWishlist(userId, productId) {
    return this.wishlistRepo.isProductInWishlist(userId, productId);
  }

  async getWishlistByProductId(productId) {
    return this.wishlistRepo.getWishlistByProductId(productId);
  }
}