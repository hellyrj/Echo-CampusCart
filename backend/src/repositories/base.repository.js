/**
 * BaseRepository provides common CRUD operations for all models.
 * Specific repositories can extend this class to inherit these methods.
 */

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async findOne(filter) {
    return this.model.findOne(filter);
  }

  async find(filter = {}, options = {}) {
    return this.model.find(filter, null, options);
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
