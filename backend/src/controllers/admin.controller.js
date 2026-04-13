import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { AdminVendorService } from "../services/admin.service.js";

export class AdminVendorController {
  constructor(adminVendorSer = new AdminVendorService()) {
    this.adminVendorSer = adminVendorSer;
  }

  // Get all vendor applications with optional status filter
  getVendorApplications = asyncHandler(async (req, res) => {
    const { status } = req.query;
    
    const applications = await this.adminVendorSer.getVendorApplications(status);
    
    sendResponse(res, 200, "Vendor applications fetched successfully", {
      total: applications.length,
      applications
    });
  });

  // Get single vendor details
  getVendorDetails = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;
    
    const vendor = await this.adminVendorSer.getVendorDetails(vendorId);
    
    sendResponse(res, 200, "Vendor details fetched successfully", vendor);
  });

  // Get all vendors with filters
  getAllVendors = asyncHandler(async (req, res) => {
    const { isApproved, isActive } = req.query;
    
    const filters = {};
    if (isApproved !== undefined) filters.isApproved = isApproved === 'true';
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    
    const vendors = await this.adminVendorSer.getAllVendors(filters);
    
    sendResponse(res, 200, "Vendors fetched successfully", {
      total: vendors.length,
      vendors
    });
  });

  // Approve vendor application
  approveVendorApplication = asyncHandler(async (req, res) => {
    const adminUserId = req.user._id;
    const { vendorId } = req.params;
    
    const approvedVendor = await this.adminVendorSer.approveVendorApplication(
      adminUserId,
      vendorId
    );
    
    sendResponse(res, 200, "Vendor application approved successfully", approvedVendor);
  });

  // Reject vendor application
  rejectVendorApplication = asyncHandler(async (req, res) => {
    const adminUserId = req.user._id;
    const { vendorId } = req.params;
    const { rejectionReason } = req.body;
    
    const rejectedVendor = await this.adminVendorSer.rejectVendorApplication(
      adminUserId,
      vendorId,
      rejectionReason
    );
    
    sendResponse(res, 200, "Vendor application rejected successfully", rejectedVendor);
  });

  // Toggle vendor active status
  toggleVendorStatus = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;
    const { isActive } = req.body;
    
    if (isActive === undefined) {
      throw new ApiError(400, "isActive field is required");
    }
    
    const updatedVendor = await this.adminVendorSer.toggleVendorStatus(vendorId, isActive);
    
    const message = isActive ? "Vendor activated successfully" : "Vendor deactivated successfully";
    sendResponse(res, 200, message, updatedVendor);
  });
}