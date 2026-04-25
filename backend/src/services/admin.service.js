import vendorRepository from "../repositories/vendor.repository.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { NotificationService } from "./notification.service.js";

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
    
    if (status === "rejected") {
      return this.vendorRepo.findRejected();
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
      
      // Send approval notification to the user
      try {
        await NotificationService.sendApprovalNotification(
          vendor.ownerId,
          vendor.storeName
        );
        console.log(`Approval notification sent to user ${vendor.ownerId}`);
      } catch (notificationError) {
        console.error('Failed to send approval notification:', notificationError);
        // Don't fail the approval if notification fails
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
      
      // Send rejection notification to the user
      try {
        await NotificationService.sendRejectionNotification(
          vendor.ownerId,
          vendor.storeName,
          rejectionReason
        );
        console.log(`Rejection notification sent to user ${vendor.ownerId}`);
      } catch (notificationError) {
        console.error('Failed to send rejection notification:', notificationError);
        // Don't fail the rejection if notification fails
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
    if (filters.isApproved !== undefined || filters.isActive !== undefined) {
      // Build query for filtered results
      const query = {};
      
      if (filters.isApproved !== undefined) {
        if (filters.isApproved === 'true') {
          query.status = 'approved';
        } else if (filters.isApproved === 'false') {
          query.status = { $in: ['pending', 'rejected'] };
        }
      }
      
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive === 'true';
      }
      
      return this.vendorRepo.model.find(query).populate('ownerId', 'name email');
    } else {
      // Use the findAll method which includes population
      return this.vendorRepo.findAll();
    }
  }

  async toggleVendorStatus(vendorId, isActive) {
    const vendor = await this.vendorRepo.findById(vendorId);
    
    if (!vendor) {
      throw new ApiError(404, "Vendor not found");
    }
    
    return this.vendorRepo.update(vendorId, { isActive });
  }
}