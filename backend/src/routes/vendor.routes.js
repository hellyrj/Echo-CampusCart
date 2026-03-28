import { Router } from "express";
import { VendorController } from "../controllers/vendor.controller.js";
import {authenticate} from "../middlewares/auth.middleware.js";
import {authorize, requireRole} from "../middlewares/role.middleware.js";
import University from "../models/university.model.js";

const router = Router();

const vendorController = new VendorController();

// Public routes (no authentication required)
router.get("/vendors/:id", vendorController.getVendor);
router.get("/vendors/nearby", vendorController.getNearbyVendors);

// Public universities endpoint
router.get("/universities", async (req, res) => {
    try {
        const universities = await University.find({});
        console.log('Universities from DB:', universities); // Debug log
        res.json({
            success: true,
            message: "Universities fetched successfully",
            data: universities
        });
    } catch (error) {
        console.error('Error fetching universities:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch universities",
            error: error.message
        });
    }
});

// Protected routes (require authentication)
router.post("/vendors/apply", authenticate, vendorController.submitVendorApplication);

// Vendor management (for vendor owners)
router.put("/vendors/:id", authenticate, vendorController.updateVendor);
router.delete("/vendors/:id", authenticate, vendorController.deleteVendor);

// Admin routes (require admin role)
router.get("/vendors/applications", authenticate, authorize("admin"), vendorController.getVendorApplications);
router.put("/vendors/applications/:id/approve", authenticate, authorize("admin"), vendorController.approveVendorApplication);
router.put("/vendors/applications/:id/reject", authenticate, authorize("admin"), vendorController.rejectVendorApplication);

export default router;