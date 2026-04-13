import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { VendorService } from "../services/vendor.service.js";

export class VendorController {
  constructor(vendSer = new VendorService()) {
    this.vendorSer = vendSer;
  }

  // =========================
  // USER SIDE
  // =========================

  submitVendorApplication = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const vendorApplication =
      await this.vendorSer.submitVendorApplication(userId, req.body);

    sendResponse(
      res,
      201,
      "Vendor application submitted. Awaiting admin approval.",
      vendorApplication
    );
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