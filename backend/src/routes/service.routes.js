import { Router } from "express";
import { ServiceController } from "../controllers/service.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { uploadProductImages, uploadSingleProductImage } from "../middlewares/productUpload.js";


const router = Router();
const serviceController = new ServiceController();

// =========================
// VENDOR ROUTES (Protected)
// =========================

// Create a new service
router.post(
    "/",
    authenticate,
    authorize('vendor'),
    uploadProductImages,
    serviceController.createService
);

// Get all services for the logged-in vendor
router.get(
    "/my-services",
    authenticate,
    authorize('vendor'),
    serviceController.getMyServices
);

// Update a service
router.put(
    "/:id",
    authenticate,
    authorize('vendor'),
    uploadProductImages,
    serviceController.updateService
);

// Delete a service
router.delete(
    "/:id",
    authenticate,
    authorize('vendor'),
    serviceController.deleteService
);

// =========================
// PUBLIC ROUTES (Students)
// =========================

// Get all active services with filtering
router.get(
    "/",
    serviceController.getAllServices
);

// Get service by ID
router.get(
    "/:id",
    serviceController.getService
);

// Get services by vendor ID
router.get(
    "/vendor/:vendorId",
    serviceController.getServicesByVendor
);

// Search services with location and filters
router.get(
    "/search",
    serviceController.searchServices
);

// Get service categories
router.get(
    "/categories/list",
    serviceController.getServiceCategories
);

export default router;
