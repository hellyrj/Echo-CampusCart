import { Router } from "express";
import { VendorController } from "../controllers/vendor.controller.js";
import {authenticate} from "../middlewares/auth.middleware.js";
import {authorize, requireRole} from "../middlewares/role.middleware.js";
import { DEFAULT_UNIVERSITIES } from "../constants/defaultUniversities.js";

const router = Router();

const vendorController = new VendorController();

// Public routes (no authentication required)
router.get("/vendors/nearby", vendorController.getNearbyVendors);
router.get("/vendors/:id", vendorController.getVendor);

// Public universities endpoint - using constants
router.get("/universities", async (req, res) => {
    try {
        console.log('Universities from constants:', DEFAULT_UNIVERSITIES); // Debug log
        res.json({
            success: true,
            message: "Universities fetched successfully",
            data: DEFAULT_UNIVERSITIES
        });
    } catch (error) {
        console.error('Error fetching universities:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch universities",
            error: error.message
        });
    } 
});   //done

// Protected routes (require authentication)
router.post("/vendors/apply", authenticate, vendorController.submitVendorApplication);

// Vendor-specific routes (for authenticated vendors to see their own data)
router.get("/vendors/profile/me", authenticate, vendorController.getMyVendorProfile);

// the api endpoint is not working, the need is to get all stores in owner id
//router.get("/vendors/profiles/me", authenticate, vendorController.getAllMyVendorProfiles);

// Vendor-specific routes (for authenticated vendors to manage their products)
router.get("/vendors/products/me", authenticate, vendorController.getMyProducts);

//all products available
router.post("/vendors/products", authenticate, vendorController.createMyProduct);
router.put("/vendors/products/:id", authenticate, vendorController.updateMyProduct);
router.delete("/vendors/products/:id", authenticate, vendorController.deleteMyProduct);

// Vendor management (for vendor owners)
router.put("/vendors/:id", authenticate, vendorController.updateVendor);
router.delete("/vendors/:id", authenticate, vendorController.deleteVendor);

// Admin routes (require admin role)
router.get("/vendors/applications", authenticate, authorize("admin"), vendorController.getVendorApplications);
router.put("/vendors/applications/:id/approve", authenticate, authorize("admin"), vendorController.approveVendorApplication);
router.put("/vendors/applications/:id/reject", authenticate, authorize("admin"), vendorController.rejectVendorApplication);

export default router;