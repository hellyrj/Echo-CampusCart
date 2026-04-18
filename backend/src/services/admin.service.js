import vendorRepository from "../repositories/vendor.repository.js";
import { ApiError } from "../utils/ApiError.js";

export class AdminVendorService {
  constructor(vendorRepo = vendorRepository) {
    this.vendorRepo = vendorRepo;
  }

  async getVendorApplications(status) {
    if (status === "pending") {
      return this.vendorRepo.findPending();
    }
    
    if (status === "approved") {
      return this.vendorRepo.findApproved();
    }
    
    // Return all applications if no status filter
    return this.vendorRepo.findAll();
  }

  async approveVendorApplication(adminUserId, vendorId) {
    const vendor = await this.vendorRepo.findById(vendorId);
    
    if (!vendor) {
      throw new ApiError(404, "Vendor application not found");
    }
    
    if (vendor.isApproved) {
      throw new ApiError(400, "Vendor is already approved");
    }
    
    return this.vendorRepo.approveVendor(vendorId, adminUserId);
  }

  async rejectVendorApplication(adminUserId, vendorId, rejectionReason) {
    const vendor = await this.vendorRepo.findById(vendorId);
    
    if (!vendor) {
      throw new ApiError(404, "Vendor application not found");
    }
    
    if (!rejectionReason || rejectionReason.trim() === "") {
      throw new ApiError(400, "Rejection reason is required");
    }
    
    return this.vendorRepo.rejectVendor(vendorId, rejectionReason);
  }

  async getVendorDetails(vendorId) {
    const vendor = await this.vendorRepo.findById(vendorId);
    
    if (!vendor) {
      throw new ApiError(404, "Vendor not found");
    }
    
    return vendor;
  }

  async getAllVendors(filters = {}) {
    const query = {};
    
    if (filters.isApproved !== undefined) {
      query.isApproved = filters.isApproved;
    }
    
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    
    return this.vendorRepo.find(query);
  }

  async toggleVendorStatus(vendorId, isActive) {
    const vendor = await this.vendorRepo.findById(vendorId);
    
    if (!vendor) {
      throw new ApiError(404, "Vendor not found");
    }
    
    return this.vendorRepo.update(vendorId, { isActive });
  }
}