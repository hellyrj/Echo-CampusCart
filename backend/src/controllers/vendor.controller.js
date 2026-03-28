import {asyncHandler} from "../utils/asyncHandler.js";
import {sendResponse} from "../utils/apiResponse.js";
import { VendorService } from "../services/vendor.service.js";

export class VendorController {
    constructor(vendSer = new VendorService()) {
        this.vendorSer = vendSer;
    }

    // Submit vendor application (for users to become vendors)
    submitVendorApplication = asyncHandler(async(req, res) => {
        const userId = req.user._id;
        const vendorApplication = await this.vendorSer.submitVendorApplication(userId, req.body);
        sendResponse(res, 201, "Vendor application submitted successfully. Pending admin approval.", vendorApplication);
    });

    // Get all vendor applications for admin
    getVendorApplications = asyncHandler(async(req, res) => {
        const { status } = req.query;
        const applications = await this.vendorSer.getVendorApplications(status);
        sendResponse(res, 200, "Vendor applications fetched successfully", applications);
    });

    // Approve vendor application
    approveVendorApplication = asyncHandler(async(req, res) => {
        const adminUserId = req.user._id;
        const vendorId = req.params.id;
        const approvedVendor = await this.vendorSer.approveVendorApplication(adminUserId, vendorId);
        sendResponse(res, 200, "Vendor application approved successfully", approvedVendor);
    });

    // Reject vendor application
    rejectVendorApplication = asyncHandler(async(req, res) => {
        const adminUserId = req.user._id;
        const vendorId = req.params.id;
        const { rejectionReason } = req.body;
        const rejectedVendor = await this.vendorSer.rejectVendorApplication(adminUserId, vendorId, rejectionReason);
        sendResponse(res, 200, "Vendor application rejected successfully", rejectedVendor);
    });

    // Legacy methods for backward compatibility
    createVendor = asyncHandler(async(req , res) => {
        const userId = req.user._id;
        const vendor = await this.vendorSer.creatingVendor(userId, req.body);
        sendResponse(res, 201, vendor);
    });

    getVendor = asyncHandler(async(req, res) => {
        const vendor = await this.vendorSer.getVendorById(req.params.id);
        sendResponse(res, 200, "Vendor fetched successfully", vendor);
    });

    getNearbyVendors = asyncHandler(async(req, res) => {
        const { lng, lat, radius = 3000 } = req.query;
        const vendors = await this.vendorSer.getNearbyVendors({
            longitude: Number(lng),
            latitude: Number(lat),
            radius: Number(radius)
        });
        sendResponse(res, 200, "Nearby vendors fetched successfully", vendors);
    });

    updateVendor = asyncHandler(async(req, res) => {
        const userId = req.user._id;
        const vendor = await this.vendorSer.updateVendor(
            userId,
            req.params.id,
            req.body
        );
        sendResponse(res, 200, "Vendor updated successfully", vendor);
    });

    deleteVendor = asyncHandler(async(req, res) => {
        const userId = req.user._id;
        const result = await this.vendorSer.deleteVendor(userId, req.params.id);
        sendResponse(res, 200, "Vendor deleted successfully", result);
    });
}