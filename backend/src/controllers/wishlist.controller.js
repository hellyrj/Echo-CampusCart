// controllers/wishlist.controller.js
import { WishlistService } from "../services/wishlist.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export class WishlistController {
  constructor() {
    this.wishlistService = new WishlistService();
  }

  getWishlist = asyncHandler(async (req, res, next) => {
    const wishlist = await this.wishlistService.getWishlist(req.user._id);
    sendResponse(res, 200, "Wishlist fetched successfully", wishlist);
  });

  addToWishlist = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const wishlist = await this.wishlistService.addToWishlist(req.user._id, productId);
    sendResponse(res, 201, "Product added to wishlist successfully", wishlist);
  });

  removeFromWishlist = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const wishlist = await this.wishlistService.removeFromWishlist(req.user._id, productId);
    sendResponse(res, 200, "Product removed from wishlist successfully", wishlist);
  });

  toggleWishlistItem = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const result = await this.wishlistService.toggleWishlistItem(req.user._id, productId);
    
    const statusCode = result.added ? 201 : 200;
    sendResponse(res, statusCode, result.message, result);
  });

  clearWishlist = asyncHandler(async (req, res, next) => {
    const wishlist = await this.wishlistService.clearWishlist(req.user._id);
    sendResponse(res, 200, "Wishlist cleared successfully", wishlist);
  });

  getWishlistCount = asyncHandler(async (req, res, next) => {
    const count = await this.wishlistService.getWishlistCount(req.user._id);
    sendResponse(res, 200, "Wishlist count fetched successfully", { count });
  });

  checkProductInWishlist = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const isInWishlist = await this.wishlistService.checkProductInWishlist(req.user._id, productId);
    sendResponse(res, 200, "Wishlist status checked successfully", { 
      productId, 
      isInWishlist 
    });
  });
}