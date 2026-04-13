import BaseRepository from "./base.repository.js";
import Vendor from "../models/vendor.model.js";

class VendorRepository extends BaseRepository {
  constructor() {
    super(Vendor);
  }

  async findByOwner(ownerId) {
    return this.model.findOne({ ownerId });
  }

  async findAll() {
    return this.model.findAll();
  }

  async findApproved() {
    return this.model.find({ isApproved: true, isActive: true });
  }

  async findPending() {
    return this.model.find({ isApproved: false });
  }

  async approveVendor(vendorId, adminId) {
    return this.model.findByIdAndUpdate(
      vendorId,
      {
        isApproved: true,
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectionReason: null
      },
      { new: true }
    );
  }

  async rejectVendor(vendorId, reason) {
    return this.model.findByIdAndUpdate(
      vendorId,
      {
        isApproved: false,
        rejectionReason: reason
      },
      { new: true }
    );
  }

  async findNearbyApproved({ longitude, latitude, radius }) {
    return this.model.find({
      isApproved: true,
      isActive: true,
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

  async findPending() {
  return this.model.find({ isApproved: false });
}

async approveVendor(vendorId, adminId) {
  return this.model.findByIdAndUpdate(
    vendorId,
    {
      isApproved: true,
      approvedBy: adminId,
      approvedAt: new Date(),
      rejectionReason: null
    },
    { new: true }
  );
}

async rejectVendor(vendorId, reason) {
  return this.model.findByIdAndUpdate(
    vendorId,
    {
      isApproved: false,
      rejectionReason: reason
    },
    { new: true }
  );
}
}

export default new VendorRepository();