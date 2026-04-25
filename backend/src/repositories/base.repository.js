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
    
    let query = this.model.find(filter, null);
    
    // Handle populate - can be object or array
    if (mergedOptions.populate) {
      if (Array.isArray(mergedOptions.populate)) {
        mergedOptions.populate.forEach(populateOption => {
          query = query.populate(populateOption);
        });
      } else {
        query = query.populate(mergedOptions.populate);
      }
    }
    
    // Handle other options
    if (mergedOptions.sort) {
      query = query.sort(mergedOptions.sort);
    }
    
    if (mergedOptions.skip) {
      query = query.skip(mergedOptions.skip);
    }
    
    if (mergedOptions.limit) {
      query = query.limit(mergedOptions.limit);
    }
    
    return query;
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
