import BaseRepository from "./base.repository.js";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async search(query) {
    return this.model.find({
      $text: { $search: query }
    });
  }

  async getPopular(limit = 20) {
    return this.model
      .find({ isAvailable: true })
      .sort({ purchases: -1, views: -1 })
      .limit(limit);
  }

  async findByVendorId(vendorId) {
    return this.model.find({ vendorId });
  }

  async findByVendor(vendorId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    
    const query = { vendorId };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    return this.model
      .find(query)
      .populate({ path: 'categories', model: Category, strictPopulate: false })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async incrementViews(productId) {
    return this.model.findByIdAndUpdate(
      productId,
      { $inc: { views: 1 } },
      { new: true }
    );
  }

  async incrementPurchases(productId) {
    return this.model.findByIdAndUpdate(
      productId,
      { $inc: { purchases: 1 } },
      { new: true }
    );
  }

  async updateRating(productId, newRating) {
    const product = await this.model.findById(productId);
    if (!product) return null;
    
    const newAverageRating = (product.averageRating * product.reviewCount + newRating) / (product.reviewCount + 1);
    
    return this.model.findByIdAndUpdate(
      productId,
      {
        $set: { averageRating: newAverageRating },
        $inc: { reviewCount: 1 }
      },
      { new: true }
    );
  }
}

export default new ProductRepository();