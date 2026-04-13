import { Router } from "express";
import { AdminVendorController } from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();
const adminVendorController = new AdminVendorController();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize("admin"));

// Get all vendor applications (with optional status filter)
// Query params: ?status=pending|approved
router.get("/applications", adminVendorController.getVendorApplications); //done

// Get all vendors with filters
// Query params: ?isApproved=true|false&isActive=true|false
router.get("/", adminVendorController.getAllVendors); //done

// Get single vendor details
router.get("/:vendorId", adminVendorController.getVendorDetails); //done

// Approve vendor application
router.patch("/:vendorId/approve", adminVendorController.approveVendorApplication); //done

// Reject vendor application
router.patch("/:vendorId/reject", adminVendorController.rejectVendorApplication);

// Toggle vendor active status (activate/deactivate)
router.patch("/:vendorId/toggle-status", adminVendorController.toggleVendorStatus);

export default router;