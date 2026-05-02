// controllers/cart.controller.js
import { CartService } from "../services/cart.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export class CartController {
  constructor() {
    this.cartService = new CartService();
  }

  getCart = asyncHandler(async (req, res, next) => {
    const cart = await this.cartService.getCart(req.user._id);
    sendResponse(res, 200, "Cart fetched successfully", cart);
  });

  addToCart = asyncHandler(async (req, res, next) => {
    const { productId, variantId, quantity } = req.body;
    
    if (!productId) {
      return sendResponse(res, 400, "Product ID is required");
    }

    const cart = await this.cartService.addToCart(req.user._id, {
      productId,
      variantId,
      quantity: parseInt(quantity) || 1
    });

    sendResponse(res, 201, "Product added to cart successfully", cart);
  });

  updateItemQuantity = asyncHandler(async (req, res, next) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return sendResponse(res, 400, "Quantity must be at least 1");
    }

    const cart = await this.cartService.updateItemQuantity(
      req.user._id, 
      itemId, 
      parseInt(quantity)
    );

    sendResponse(res, 200, "Cart item quantity updated successfully", cart);
  });

  removeFromCart = asyncHandler(async (req, res, next) => {
    const { itemId } = req.params;
    const cart = await this.cartService.removeFromCart(req.user._id, itemId);
    sendResponse(res, 200, "Item removed from cart successfully", cart);
  });

  clearCart = asyncHandler(async (req, res, next) => {
    const cart = await this.cartService.clearCart(req.user._id);
    sendResponse(res, 200, "Cart cleared successfully", cart);
  });

  applyCoupon = asyncHandler(async (req, res, next) => {
    const { couponCode } = req.body;
    
    if (!couponCode) {
      return sendResponse(res, 400, "Coupon code is required");
    }

    const cart = await this.cartService.applyCoupon(req.user._id, couponCode);
    sendResponse(res, 200, "Coupon applied successfully", cart);
  });

  removeCoupon = asyncHandler(async (req, res, next) => {
    const cart = await this.cartService.removeCoupon(req.user._id);
    sendResponse(res, 200, "Coupon removed successfully", cart);
  });

  addNotes = asyncHandler(async (req, res, next) => {
    const { notes } = req.body;
    const cart = await this.cartService.addNotes(req.user._id, notes);
    sendResponse(res, 200, "Notes added successfully", cart);
  });

  getCartCount = asyncHandler(async (req, res, next) => {
    const count = await this.cartService.getCartCount(req.user._id);
    sendResponse(res, 200, "Cart count fetched successfully", { count });
  });

  validateCart = asyncHandler(async (req, res, next) => {
    const validation = await this.cartService.validateCart(req.user._id);
    sendResponse(res, 200, "Cart validation completed", validation);
  });

  mergeCarts = asyncHandler(async (req, res, next) => {
    const { sessionCartItems } = req.body;
    const cart = await this.cartService.mergeCarts(req.user._id, sessionCartItems);
    sendResponse(res, 200, "Carts merged successfully", cart);
  });
}