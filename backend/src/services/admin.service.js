import vendorRepository from "../repositories/vendor.repository.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";

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
    
    console.log(`Approving vendor application ${vendorId} for user ${vendor.ownerId}`);
    
    try {
      // Approve the vendor application
      const approvedVendor = await this.vendorRepo.approveVendor(vendorId, adminUserId);
      
      // Update the user's role to "vendor"
      const updatedUser = await User.findByIdAndUpdate(
        vendor.ownerId,
        { role: "vendor" },
        { new: true }
      );
      
      if (!updatedUser) {
        console.error(`Failed to update user role for user ${vendor.ownerId}`);
        // Don't throw error here since vendor was already approved, but log it
      } else {
        console.log(`User ${vendor.ownerId} role updated to "vendor" successfully`);
      }
      
      return approvedVendor;
    } catch (error) {
      console.error(`Error approving vendor application: ${error.message}`);
      throw error;
    }
  }

  async rejectVendorApplication(adminUserId, vendorId, rejectionReason) {
    const vendor = await this.vendorRepo.findById(vendorId);
    
    if (!vendor) {
      throw new ApiError(404, "Vendor application not found");
    }
    
    if (!rejectionReason || rejectionReason.trim() === "") {
      throw new ApiError(400, "Rejection reason is required");
    }
    
    console.log(`Rejecting vendor application ${vendorId} for user ${vendor.ownerId}`);
    
    try {
      // Reject the vendor application
      const rejectedVendor = await this.vendorRepo.rejectVendor(vendorId, rejectionReason);
      
      // Ensure the user's role remains "student" (in case it was changed)
      const updatedUser = await User.findByIdAndUpdate(
        vendor.ownerId,
        { role: "student" },
        { new: true }
      );
      
      if (!updatedUser) {
        console.error(`Failed to update user role for user ${vendor.ownerId}`);
        // Don't throw error here since vendor was already rejected, but log it
      } else {
        console.log(`User ${vendor.ownerId} role ensured as "student" after rejection`);
      }
      
      return rejectedVendor;
    } catch (error) {
      console.error(`Error rejecting vendor application: ${error.message}`);
      throw error;
    }
  }

  async getVendorDetails(vendorId) {
    const vendor = await this.vendorRepo.findById(vendorId);
    
    if (!vendor) {
      throw new ApiError(404, "Vendor not found");
    }
    
    return vendor;
  }

  // Utility method to fix existing approved vendors whose user roles weren't updated
  async fixVendorUserRoles() {
    console.log("Starting vendor user role fix process...");
    
    try {
      // Find all approved vendors
      const approvedVendors = await this.vendorRepo.findApproved();
      console.log(`Found ${approvedVendors.length} approved vendors`);
      
      let fixedCount = 0;
      
      for (const vendor of approvedVendors) {
        // Check if the user's role is already "vendor"
        const user = await User.findById(vendor.ownerId);
        
        if (user && user.role !== "vendor") {
          // Update the user's role to "vendor"
          await User.findByIdAndUpdate(
            vendor.ownerId,
            { role: "vendor" },
            { new: true }
          );
          
          console.log(`Fixed user role for vendor ${vendor._id} (user: ${vendor.ownerId})`);
          fixedCount++;
        }
      }
      
      console.log(`Vendor user role fix completed. Fixed ${fixedCount} user roles.`);
      return { totalVendors: approvedVendors.length, fixedRoles: fixedCount };
      
    } catch (error) {
      console.error(`Error fixing vendor user roles: ${error.message}`);
      throw error;
    }
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