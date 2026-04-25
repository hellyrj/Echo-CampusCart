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
    return this.model.find({}).populate('ownerId', 'name email');
  }

  async findApproved() {
    return this.model.find({ status: 'approved', isActive: true }).populate('ownerId', 'name email');
  }

  async findPending() {
    return this.model.find({ status: 'pending' }).populate('ownerId', 'name email');
  }

  async findRejected() {
    return this.model.find({ status: 'rejected' }).populate('ownerId', 'name email');
  }

  async approveVendor(vendorId, adminId) {
    return this.model.findByIdAndUpdate(
      vendorId,
      {
        status: 'approved',
        isApproved: true,
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectionReason: null
      },
      { returnDocument: 'after' }
    );
  }

  async rejectVendor(vendorId, reason) {
    return this.model.findByIdAndUpdate(
      vendorId,
      {
        status: 'rejected',
        isApproved: false,
        rejectionReason: reason
      },
      { returnDocument: 'after' }
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

  async deleteById(vendorId) {
    return this.model.findByIdAndDelete(vendorId);
  }
}

export default new VendorRepository();