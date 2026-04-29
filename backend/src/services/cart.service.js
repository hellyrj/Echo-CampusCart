// services/cart.service.js
import CartRepository from "../repositories/cart.repository.js";
import ProductRepository from "../repositories/product.repository.js";
import { ApiError } from "../utils/ApiError.js";

export class CartService {
  constructor(cartRepo = CartRepository) {
    this.cartRepo = cartRepo;
    this.productRepo = ProductRepository;
  }

  async getCart(userId) {
    const cart = await this.cartRepo.findByUserId(userId);
    
    if (!cart) {
      // Return empty cart structure
      return {
        userId,
        items: [],
        itemCount: 0,
        totalQuantity: 0,
        subtotal: 0,
        discountAmount: 0,
        total: 0
      };
    }

    // Validate items and update prices if needed
    await this.validateCartItems(cart);
    
    return cart;
  }

  async addToCart(userId, { productId, variantId, quantity = 1 }) {
    // Validate product
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    if (!product.isAvailable) {
      throw new ApiError(400, "Product is not available");
    }

    // Determine price and name
    let price = product.basePrice;
    let itemName = product.name;
    let attributes = new Map();

    // Check variant if specified
    if (variantId) {
      const variant = product.variants?.find(v => v._id.toString() === variantId);
      if (!variant) {
        throw new ApiError(404, "Variant not found");
      }
      
      if (variant.stock !== undefined && variant.stock < quantity) {
        throw new ApiError(400, `Only ${variant.stock} units available for this variant`);
      }
      
      if (variant.price) {
        price = variant.price;
      }
      
      if (variant.name) {
        itemName = `${product.name} - ${variant.name}`;
      }
      
      if (variant.attributes) {
        attributes = variant.attributes;
      }
    } else {
      // Check main inventory
      if (product.inventory?.totalStock !== undefined && product.inventory.totalStock < quantity) {
        throw new ApiError(400, `Only ${product.inventory.totalStock} units available`);
      }
    }

    // Apply active discount
    if (product.discount?.isActive && product.discount?.percentage) {
      const discountAmount = (price * product.discount.percentage) / 100;
      price = price - discountAmount;
    }

    // Get main image
    const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];
    
    const itemData = {
      productId,
      variantId,
      quantity,
      price,
      name: itemName,
      image: mainImage ? {
        url: mainImage.url,
        alt: mainImage.alt || product.name
      } : null,
      vendorId: product.vendorId,
      vendorName: product.vendorId?.storeName,
      attributes
    };

    const cart = await this.cartRepo.addItem(userId, itemData);
    return cart;
  }

  async updateItemQuantity(userId, itemId, quantity) {
    if (quantity < 1) {
      throw new ApiError(400, "Quantity must be at least 1");
    }

    const cart = await this.cartRepo.findByUserId(userId);
    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }

    const item = cart.items.find(item => item._id.toString() === itemId);
    if (!item) {
      throw new ApiError(404, "Item not found in cart");
    }

    // Check stock availability
    await this.validateStock(item, quantity);

    const updatedCart = await this.cartRepo.updateItemQuantity(userId, itemId, quantity);
    return updatedCart;
  }

  async removeFromCart(userId, itemId) {
    const cart = await this.cartRepo.findByUserId(userId);
    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }

    const item = cart.items.find(item => item._id.toString() === itemId);
    if (!item) {
      throw new ApiError(404, "Item not found in cart");
    }

    return this.cartRepo.removeItem(userId, itemId);
  }

  async clearCart(userId) {
    return this.cartRepo.clearCart(userId);
  }

  async applyCoupon(userId, couponCode) {
    const cart = await this.cartRepo.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    // Here you would validate the coupon against a Coupon model
    // For now, we'll validate a simple coupon
    const validCoupons = {
      'WELCOME10': { discount: 10, type: 'percentage' },
      'SAVE20': { discount: 20, type: 'percentage' },
      'FLAT50': { discount: 50, type: 'fixed' },
      'STUDENT15': { discount: 15, type: 'percentage' }
    };

    const coupon = validCoupons[couponCode.toUpperCase()];
    if (!coupon) {
      throw new ApiError(400, "Invalid or expired coupon code");
    }

    const couponData = {
      code: couponCode.toUpperCase(),
      discount: coupon.discount,
      discountType: coupon.type
    };

    return this.cartRepo.applyCoupon(userId, couponData);
  }

  async removeCoupon(userId) {
    return this.cartRepo.removeCoupon(userId);
  }

  async addNotes(userId, notes) {
    if (notes && notes.length > 500) {
      throw new ApiError(400, "Notes must be 500 characters or less");
    }

    return this.cartRepo.addNotes(userId, notes);
  }

  async getCartCount(userId) {
    return this.cartRepo.getCartCount(userId);
  }

  async mergeCarts(userId, sessionCartItems) {
    if (!sessionCartItems || sessionCartItems.length === 0) {
      return this.cartRepo.findByUserId(userId);
    }

    // Validate all products before merging
    for (const item of sessionCartItems) {
      const product = await this.productRepo.findById(item.productId);
      if (!product || !product.isAvailable) {
        continue; // Skip unavailable products
      }
    }

    return this.cartRepo.mergeCarts(userId, sessionCartItems);
  }

  async validateCart(userId) {
    const cart = await this.cartRepo.findByUserId(userId);
    if (!cart) return { valid: true, issues: [] };

    const issues = [];
    
    for (const item of cart.items) {
      const product = await this.productRepo.findById(item.productId);
      
      if (!product) {
        issues.push({ itemId: item._id, message: `${item.name} is no longer available` });
        continue;
      }

      if (!product.isAvailable) {
        issues.push({ itemId: item._id, message: `${item.name} is currently unavailable` });
      }

      // Check stock
      if (item.variantId) {
        const variant = product.variants?.find(v => v._id.toString() === item.variantId.toString());
        if (variant && variant.stock < item.quantity) {
          issues.push({ itemId: item._id, message: `Only ${variant.stock} units of ${item.name} available` });
        }
      } else if (product.inventory?.totalStock < item.quantity) {
        issues.push({ itemId: item._id, message: `Only ${product.inventory.totalStock} units of ${item.name} available` });
      }

      // Update price if changed
      const currentPrice = this.calculateItemPrice(product, item.variantId);
      if (currentPrice !== item.price) {
        issues.push({ 
          itemId: item._id, 
          message: `Price for ${item.name} has been updated from $${item.price} to $${currentPrice}`,
          priceChanged: true,
          oldPrice: item.price,
          newPrice: currentPrice
        });
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  // Helper methods
  async validateCartItems(cart) {
    let needsUpdate = false;

    for (const item of cart.items) {
      const product = await this.productRepo.findById(item.productId);
      if (product) {
        const currentPrice = this.calculateItemPrice(product, item.variantId);
        if (currentPrice !== item.price) {
          item.price = currentPrice;
          needsUpdate = true;
        }
      }
    }

    if (needsUpdate) {
      await cart.save();
    }
  }

  calculateItemPrice(product, variantId) {
    let price = product.basePrice || 0;

    if (variantId) {
      const variant = product.variants?.find(v => v._id.toString() === variantId);
      if (variant?.price) {
        price = variant.price;
      }
    }

    // Apply active discount
    if (product.discount?.isActive && product.discount?.percentage) {
      const discountAmount = (price * product.discount.percentage) / 100;
      price = price - discountAmount;
    }

    return price;
  }

  async validateStock(item, requestedQuantity) {
    const product = await this.productRepo.findById(item.productId);
    if (!product) return;

    if (item.variantId) {
      const variant = product.variants?.find(v => v._id.toString() === item.variantId.toString());
      if (variant && variant.stock !== undefined && variant.stock < requestedQuantity) {
        throw new ApiError(400, `Only ${variant.stock} units available`);
      }
    } else if (product.inventory?.totalStock !== undefined && product.inventory.totalStock < requestedQuantity) {
      throw new ApiError(400, `Only ${product.inventory.totalStock} units available`);
    }
  }
}