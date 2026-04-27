import ProductRepository from "../repositories/product.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { CloudinaryService } from "./cloudinary.service.js";
import Category from "../models/category.model.js";
import Vendor from "../models/vendor.model.js";

export class ProductService {

  constructor(productRepo = ProductRepository) {
    this.productRepo = productRepo;
  }

  async createProduct(data) {
    if (!data.name || !data.basePrice) {
      throw new ApiError(400, "Product name and price are required");
    }

    if (!data.vendorId) {
      throw new ApiError(400, "Vendor ID is required");
    }

    // Validate images if provided
    if (data.images && data.images.length > 0) {
      this.validateImages(data.images);
    }

    return this.productRepo.create(data);
  }

  async getProductById(id) {
    const product = await this.productRepo.findById(id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return product;
  }

  async getAllProducts(filters = {}) {
    const options = {
      populate: [
        { path: 'categories', model: Category, strictPopulate: false },
        { 
          path: 'vendorId', 
          select: 'storeName deliveryAvailable pickupAvailable _id isActive universityNear',
          model: Vendor
          // Removed match: { isActive: true } to include all vendors for now
        }
      ]
    };
    
    console.log('Product service: Getting all products with options:', options);
    const products = await this.productRepo.find(filters, options);
    console.log('Product service: First product vendorId:', products[0]?.vendorId);
    
    return products;
  }

  async searchProducts({ query, category, minPrice, maxPrice, university, sort = 'relevance' }) {
    if (!query && !category && !university) {
      throw new ApiError(400, "Search query, category, or university required");
    }

    const searchFilters = {};
    
    if (query) {
      searchFilters.query = query;
    }
    
    if (category) {
      searchFilters.category = category;
    }
    
    if (university) {
      searchFilters.university = university;
    }
    
    if (minPrice !== undefined) {
      searchFilters.minPrice = parseFloat(minPrice);
    }
    
    if (maxPrice !== undefined) {
      searchFilters.maxPrice = parseFloat(maxPrice);
    }
    
    searchFilters.sort = sort;

    console.log('Product service: Search filters:', searchFilters);

    // Try the main search method first, fallback to alternative if needed
    try {
      return this.productRepo.search(searchFilters);
    } catch (error) {
      console.log('Main search failed, trying alternative method:', error.message);
      return this.productRepo.searchWithUniversityFilter(searchFilters);
    }
  }

  async getPopularProducts(limit = 10) {
    return this.productRepo.getPopular(limit);
  }

  async getVendorProducts(vendorId, options = {}) {
    if (!vendorId) {
      throw new ApiError(400, "Vendor ID is required");
    }

    return this.productRepo.findByVendor(vendorId, options);
  }

  async deleteProduct(id, vendorId = null) {
    const product = await this.productRepo.findById(id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Check ownership if vendorId is provided
    if (vendorId && product.vendorId.toString() !== vendorId.toString()) {
      throw new ApiError(403, "You can only delete your own products");
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const publicIds = product.images.map(img => img.publicId);
      try {
        await CloudinaryService.deleteMultipleImages(publicIds);
      } catch (error) {
        console.error('Failed to delete images from Cloudinary:', error);
        // Continue with product deletion even if image cleanup fails
      }
    }

    return this.productRepo.delete(id);
  }

  async updateProduct(id, vendorId = null, data) {
    const product = await this.productRepo.findById(id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Check ownership if vendorId is provided
    if (vendorId && product.vendorId.toString() !== vendorId.toString()) {
      throw new ApiError(403, "You can only update your own products");
    }

    // Validate images if provided
    if (data.images && data.images.length > 0) {
      this.validateImages(data.images);
    }

    return this.productRepo.update(id, data);
  }

  async addProductImages(productId, vendorId, newImages) {
    const product = await this.productRepo.findById(productId);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Check ownership
    if (product.vendorId.toString() !== vendorId.toString()) {
      throw new ApiError(403, "You can only update your own products");
    }

    // Validate new images
    this.validateImages(newImages);

    // Add new images to existing ones
    const updatedImages = [...(product.images || []), ...newImages];
    
    return this.productRepo.update(productId, { images: updatedImages });
  }

  async removeProductImage(productId, vendorId, imageIndex) {
    const product = await this.productRepo.findById(productId);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Check ownership
    if (product.vendorId.toString() !== vendorId.toString()) {
      throw new ApiError(403, "You can only update your own products");
    }

    if (!product.images || product.images.length === 0) {
      throw new ApiError(400, "No images to remove");
    }

    if (imageIndex < 0 || imageIndex >= product.images.length) {
      throw new ApiError(400, "Invalid image index");
    }

    // Remove image from array
    const updatedImages = product.images.filter((_, index) => index !== imageIndex);
    
    // Delete image from Cloudinary
    const removedImage = product.images[imageIndex];
    try {
      await CloudinaryService.deleteImage(removedImage.publicId);
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
    }

    return this.productRepo.update(productId, { images: updatedImages });
  }

  async updateAvailability(productId, vendorId, isAvailable) {
    const product = await this.productRepo.findById(productId);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Check ownership
    if (product.vendorId.toString() !== vendorId.toString()) {
      throw new ApiError(403, "You can only update your own products");
    }

    return this.productRepo.update(productId, { isAvailable });
  }

  async updateInventory(productId, vendorId, inventoryData) {
    const product = await this.productRepo.findById(productId);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Check ownership
    if (product.vendorId.toString() !== vendorId.toString()) {
      throw new ApiError(403, "You can only update your own products");
    }

    return this.productRepo.update(productId, { inventory: inventoryData });
  }

  async incrementViews(id) {
    return this.productRepo.incrementViews(id);
  }

  async incrementPurchases(id) {
    return this.productRepo.incrementPurchases(id);
  }

  async updateRating(id, rating) {
    return this.productRepo.updateRating(id, rating);
  }

  // Helper method to validate image data
  validateImages(images) {
    for (const image of images) {
      if (!image.url || !image.publicId) {
        throw new ApiError(400, "Each image must have url and publicId");
      }

      // Validate URL format
      try {
        new URL(image.url);
      } catch (error) {
        throw new ApiError(400, "Invalid image URL format");
      }
    }
  }

  // Get optimized image URLs
  getOptimizedImages(images, options = {}) {
    if (!images || images.length === 0) {
      return [];
    }

    return images.map(image => ({
      ...image,
      optimizedUrl: CloudinaryService.getOptimizedUrl(image.publicId, options)
    }));
  }

  // Admin approve product
  async adminApproveProduct(productId, approved) {
    const product = await this.productRepo.findById(productId);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return this.productRepo.update(productId, { 
      isApproved: approved,
      approvedAt: approved ? new Date() : null,
      rejectedAt: approved ? null : new Date()
    });
  }

  // Admin reject product
  async adminRejectProduct(productId, rejectionReason) {
    const product = await this.productRepo.findById(productId);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return this.productRepo.update(productId, { 
      isApproved: false,
      rejectionReason,
      rejectedAt: new Date()
    });
  }
}