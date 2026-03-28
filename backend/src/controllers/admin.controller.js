import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { AdminService } from "../services/admin.service.js";

export class AdminController {
    constructor(adminSer = new AdminService()) {
        this.adminSer = adminSer;
    }

    // Get all vendor applications for admin
    getVendorApplications = asyncHandler(async (req, res) => {
        const { status } = req.query;
        const applications = await this.adminSer.getVendorApplications(status);
        sendResponse(res, 200, "Vendor applications fetched successfully", applications);
    });

    // Approve vendor application
    approveVendorApplication = asyncHandler(async (req, res) => {
        const adminUserId = req.user._id;
        const vendorId = req.params.id;
        const approvedVendor = await this.adminSer.approveVendorApplication(adminUserId, vendorId);
        sendResponse(res, 200, "Vendor application approved successfully", approvedVendor);
    });

    // Reject vendor application
    rejectVendorApplication = asyncHandler(async (req, res) => {
        const adminUserId = req.user._id;
        const vendorId = req.params.id;
        const { rejectionReason } = req.body;
        const rejectedVendor = await this.adminSer.rejectVendorApplication(adminUserId, vendorId, rejectionReason);
        sendResponse(res, 200, "Vendor application rejected successfully", rejectedVendor);
    });

    // Get all universities for admin management
    getUniversities = asyncHandler(async (req, res) => {
        const universities = await this.adminSer.getUniversities();
        sendResponse(res, 200, "Universities fetched successfully", universities);
    });

    // Add new university
    createUniversity = asyncHandler(async (req, res) => {
        const university = await this.adminSer.createUniversity(req.body);
        sendResponse(res, 201, "University created successfully", university);
    });

    // Update university
    updateUniversity = asyncHandler(async (req, res) => {
        const university = await this.adminSer.updateUniversity(req.params.id, req.body);
        sendResponse(res, 200, "University updated successfully", university);
    });

    // Delete university
    deleteUniversity = asyncHandler(async (req, res) => {
        const result = await this.adminSer.deleteUniversity(req.params.id);
        sendResponse(res, 200, "University deleted successfully", result);
    });
}
