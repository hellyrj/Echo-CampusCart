import Vendor from "../models/vendor.model.js";
import BaseRepository from "./base.repository.js";

class VendorRepository extends BaseRepository {

  constructor() {
    super(Vendor);
  }

  async findByOwner(ownerId) {
    return this.findOne({ ownerId });
  }

  async findNearby({ longitude, latitude, radius }) {
    return this.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius
        }
      }
    });
  }

}

export default new VendorRepository();