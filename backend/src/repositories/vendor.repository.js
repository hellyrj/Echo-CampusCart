import Vendor from "../models/vendor.model.js";
import BaseRepository from "./base.repository.js";
import User from "../models/user.model.js";

class VendorRepository extends BaseRepository {

  constructor() {
    super(Vendor);
  }

  async findByOwner(ownerId) {
    return this.findOne({ ownerId });
  }

  async findNearby({ longitude, latitude, radius, filter = {} }) {
    const locationFilter = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius
        }
      }
    };

    // Merge with additional filter if provided
    const finalFilter = { ...locationFilter, ...filter };

    return this.find(finalFilter);
  }

  // Update user role when vendor is approved
  async updateUserRole(userId, newRole) {
    await User.findByIdAndUpdate(userId, { role: newRole });
  }

}

export default new VendorRepository();