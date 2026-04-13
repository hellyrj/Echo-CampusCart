import vendorRepository from "../repositories/vendor.repository.js";
import productRepository from "../repositories/product.repository.js";
import { ApiError } from "../utils/ApiError.js";

export class VendorService {

     constructor(vendorRepo = vendorRepository, productRepo = productRepository) {
           this.vendorRepo = vendorRepo;
           this.productRepo = productRepo;
         }

  async createVendor(userId, data) {
    const existing = await this.vendorRepo.findByOwner(userId);

    if (existing) {
      throw new ApiError(400, "User already owns a vendor");
    }

    return this.vendorRepo.create({
      ...data,
      ownerId: userId,
      isApproved: false
    });
  }

  async submitVendorApplication(userId, data) {

  const existing = await this.vendorRepo.findByOwner(userId);

  if (existing) {
    throw new ApiError(400, "You already have a vendor application");
  }

  return this.vendorRepo.create({
    ...data,
    ownerId: userId,
    isApproved: false
  });

}

  async getVendorByUserId(userId) {
    const vendor = await this.vendorRepo.findByOwner(userId);

    if (!vendor) throw new ApiError(404, "Vendor not found");

    return vendor;
  }

  async getVendorProducts(userId) {

  const vendor = await this.vendorRepo.findByOwner(userId);

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  if (!vendor.isApproved) {
    throw new ApiError(403, "Vendor not approved yet");
  }

  return this.productRepo.findByVendorId(vendor._id);
}

  async getApprovedVendors() {
    return this.vendorRepo.findApproved();
  }

  async getNearbyVendors(params) {
    return this.vendorRepo.findNearbyApproved(params);
  }

  async approveVendor(adminId, vendorId) {
    const vendor = await this.vendorRepo.findById(vendorId);
    if (!vendor) throw new ApiError(404, "Vendor not found");

    return this.vendorRepo.approveVendor(vendorId, adminId);
  }

  async rejectVendor(vendorId, reason) {
    const vendor = await this.vendorRepo.findById(vendorId);
    if (!vendor) throw new ApiError(404, "Vendor not found");

    if (!reason) throw new ApiError(400, "Rejection reason required");

    return this.vendorRepo.rejectVendor(vendorId, reason);
  }

  async getVendorApplications(status) {

  if (status === "pending") {
    return this.vendorRepository.findPending();
  }

  if (status === "approved") {
    return this.vendorRepository.findApproved();
  }

  return this.vendorRepository.find(); // all
}

async approveVendorApplication(adminId, vendorId) {

  const vendor = await this.vendorRepository.findById(vendorId);

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  if (vendor.isApproved) {
    throw new ApiError(400, "Vendor already approved");
  }

  return this.vendorRepository.approveVendor(vendorId, adminId);
}

async rejectVendorApplication(adminId, vendorId, reason) {

  const vendor = await this.vendorRepository.findById(vendorId);

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  if (!reason) {
    throw new ApiError(400, "Rejection reason required");
  }

  return this.vendorRepository.rejectVendor(vendorId, reason);
}

}

