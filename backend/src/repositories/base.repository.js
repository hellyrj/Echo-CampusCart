/**
 * BaseRepository provides common CRUD operations for all models.
 * Specific repositories can extend this class to inherit these methods.
 */
/**
 * BaseRepository provides common CRUD operations for all models.
 * Specific repositories can extend this class to inherit these methods.
 */
import Category from "../models/category.model.js";

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id) {
    return this.model.findById(id).populate({ path: 'categories', model: Category, strictPopulate: false });
  }

  async findOne(filter) {
    return this.model.findOne(filter);
  }

  async find(filter = {}, options = {}) {
    const defaultOptions = {
      populate: { path: 'categories', model: Category, strictPopulate: false }
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    return this.model.find(filter, null, mergedOptions);
  }

  async update(id, data) {
    return this.model.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
  }

  async delete(id) {
    return this.model.findByIdAndDelete(id);
  }
}

export default BaseRepository;
