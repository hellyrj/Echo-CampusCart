import BaseRepository from "./base.repository.js";
import Review from "../models/review.model.js";

class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  async findByUserAndProduct(userId, productId) {
    return this.model.findOne({ userId, productId });
  }

  async getProductReviews(productId) {
    return this.model
      .find({ productId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
  }

  async deleteByProduct(productId) {
    return this.model.deleteMany({ productId });
  }
}

export default new ReviewRepository();