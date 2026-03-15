import Category from "../models/category.model.js";
import BaseRepository from "./base.repository.js";

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  async findBySlug(slug) {
    return this.model.findOne({ slug });
  }
}

export default new CategoryRepository();