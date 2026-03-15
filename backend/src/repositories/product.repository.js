import  BaseRepository  from "./base.repository.js";
import Product from "../models/product.model.js";

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

  async incrementViews(productId) {
    return this.model.findByIdAndUpdate(
      productId,
      { $inc: { views: 1 } },
      { new: true }
    );
  }
}

export default new ProductRepository();