import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { VendorService } from "../services/vendor.service.js";
import { saveFilesToGridFS } from "../middlewares/upload.js";

export class VendorController {
  constructor(vendSer = new VendorService()) {
    this.vendorSer = vendSer;
  }

  // =========================
  // USER SIDE
  // =========================

  submitVendorApplication = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    console.log('Vendor application submission started');
    console.log('req.files:', req.files);
    console.log('req.body:', req.body);
    
    // If files were uploaded, save them to GridFS
    let legalDocuments = [];
    if (req.files && req.files.length > 0) {
      console.log('Files detected:', req.files.length);
      try {
        const uploadedFiles = await saveFilesToGridFS(req.files);
        legalDocuments = uploadedFiles.map((file, index) => ({
          documentType: 'other', // Use valid enum value
          documentUrl: file.url,
          uploadedAt: new Date(),
          fileId: file.fileId,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size
        }));
      } catch (error) {
        console.error('Error uploading files:', error);
        return sendResponse(res, 400, "File upload failed", { error: error.message });
      }
    } else {
      console.log('No files uploaded, using fallback');
      // Fallback to empty array if no files uploaded
      legalDocuments = [];
    }
    
    // Parse location from string if needed
    let location = req.body.location;
    if (typeof location === 'string') {
      try {
        location = JSON.parse(location);
      } catch (e) {
        console.error('Error parsing location:', e);
        // Default location if parsing fails
        location = {
          type: "Point",
          coordinates: [3.3792, 6.9722] // Lagos coordinates
        };
      }
    }
    
    const vendorData = {
      ...req.body,
      legalDocuments,
      location,
      ownerId: userId
    };
    
    const vendorApplication = await this.vendorSer.submitVendorApplication(userId, vendorData);
    
    sendResponse(res, 201, "Vendor application submitted. Awaiting admin approval.", vendorApplication);
  });

  getMyVendorProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const vendor = await this.vendorSer.getVendorByUserId(userId);

    sendResponse(res, 200, "Vendor profile fetched successfully", vendor);
  });

  getAllMyVendorProfiles = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const vendors = await this.vendorSer.getAllVendorsByUserId(userId);

    sendResponse(res, 200, "All vendor profiles fetched", vendors);
  });

  // =========================
  // PRODUCT MANAGEMENT (Vendor Only)
  // =========================

  createMyProduct = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const product = await this.vendorSer.createVendorProduct(
      userId,
      req.body
    );

    sendResponse(res, 201, "Product created successfully", product);
  });

  updateMyProduct = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const product = await this.vendorSer.updateVendorProduct(
      userId,
      req.params.id,
      req.body
    );

    sendResponse(res, 200, "Product updated successfully", product);
  });

  deleteMyProduct = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const result = await this.vendorSer.deleteVendorProduct(
      userId,
      req.params.id
    );

    sendResponse(res, 200, "Product deleted successfully", result);
  });

  getMyProducts = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const products = await this.vendorSer.getVendorProducts(userId);

    sendResponse(res, 200, "Vendor products fetched", products);
  });

  // =========================
  // PUBLIC (STUDENTS)
  // =========================

  getApprovedVendors = asyncHandler(async (req, res) => {
    const vendors = await this.vendorSer.getApprovedVendors();

    sendResponse(res, 200, "Approved vendors fetched", vendors);
  });

  getNearbyVendors = asyncHandler(async (req, res) => {
    const { lng, lat, radius = 3000 } = req.query;

    const vendors = await this.vendorSer.getNearbyVendors({
      longitude: Number(lng),
      latitude: Number(lat),
      radius: Number(radius),
    });

    sendResponse(res, 200, "Nearby vendors fetched", vendors);
  });

  getVendor = asyncHandler(async (req, res) => {
    const vendor = await this.vendorSer.getVendorById(req.params.id);

    sendResponse(res, 200, "Vendor fetched", vendor);
  });

  
}