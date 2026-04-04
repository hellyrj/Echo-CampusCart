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

    // Get current vendor's profile (for authenticated vendors)
    getMyVendorProfile = asyncHandler(async(req, res) => {
        const userId = req.user._id;
        try {
            const vendor = await this.vendorSer.getVendorByUserId(userId);
            sendResponse(res, 200, "Vendor profile fetched successfully", vendor);
        } catch (error) {
            // If vendor not found, create one automatically for users with vendor role
            if (error.message.includes('Vendor profile not found') && req.user.role === 'vendor') {
                console.log('Auto-creating vendor profile for user with vendor role');
                const vendorData = {
                    storeName: `${req.user.name}'s Store`,
                    description: 'Vendor store',
                    address: 'Default Address',
                    phone: 'Default Phone',
                    universityNear: 'University of Lagos',
                    location: {
                        type: "Point",
                        coordinates: [3.3792, 6.9722]
                    },
                    ownerId: userId,
                    isApproved: true,
                    approvedBy: userId,
                    approvedAt: new Date(),
                    rejectionReason: null,
                    legalDocuments: [],
                    logo: null,
                    deliveryAvailable: true
                };
                
                console.log('Creating vendor with data:', vendorData);
                const newVendor = await this.vendorSer.createVendorForVendorRole(userId, vendorData);
                console.log('Vendor created successfully:', newVendor);
                sendResponse(res, 201, "Vendor profile created successfully", newVendor);
            } else {
                console.error('Error in getMyVendorProfile:', error);
                throw error;
            }
        }
    });

    // Get all vendor profiles for a user (for users with multiple stores)
    getAllMyVendorProfiles = asyncHandler(async(req, res) => {
        const userId = req.user._id;
        const vendors = await this.vendorSer.getAllVendorsByUserId(userId);
        sendResponse(res, 200, "All vendor profiles fetched successfully", vendors);
    });

    // Get current vendor's products (for authenticated vendors)
    getMyProducts = asyncHandler(async(req, res) => {
        const userId = req.user._id;
        const products = await this.vendorSer.getVendorProducts(userId);
        sendResponse(res, 200, "Vendor products fetched successfully", products);
    });

    // Create product for current vendor
    createMyProduct = asyncHandler(async(req, res) => {
        const userId = req.user._id;
        const product = await this.vendorSer.createVendorProduct(userId, req.body);
        sendResponse(res, 201, "Product created successfully", product);
    });

    // Update product for current vendor
    updateMyProduct = asyncHandler(async(req, res) => {
        const userId = req.user._id;
        const productId = req.params.id;
        const product = await this.vendorSer.updateVendorProduct(userId, productId, req.body);
        sendResponse(res, 200, "Product updated successfully", product);
    });

    // Delete product for current vendor
    deleteMyProduct = asyncHandler(async(req, res) => {
        const userId = req.user._id;
        const productId = req.params.id;
        const result = await this.vendorSer.deleteVendorProduct(userId, productId);
        sendResponse(res, 200, "Product deleted successfully", result);
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