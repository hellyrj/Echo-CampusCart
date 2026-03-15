import {asyncHandler} from "../utils/asyncHandler.js";
import {sendResponse} from "../utils/apiResponse.js";
import { VendorService } from "../services/vendor.service.js";

export class VendorController {
    constructor(vendSer = new VendorService()) {
        this.vendorSer = vendSer;
    }
    createVendor = asyncHandler(async(req , res) => {
        const userId = req.user._id;
        const vendor = await this.vendorSer.creatingVendor(userId, req.body);
        sendResponse(res, 201, vendor);
    });

    getVendor = asyncHandler(async (req, res) => {

    const vendor = await this.vendorSer.getVendorById(req.params.id);

    sendResponse(res, 200, "Vendor fetched successfully", vendor);

  });

  getNearbyVendors = asyncHandler(async (req, res) => {

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