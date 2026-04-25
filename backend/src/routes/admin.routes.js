import { Router } from "express";
import { AdminVendorController } from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import User from "../models/user.model.js";
import Vendor from "../models/vendor.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

const router = Router();
const adminVendorController = new AdminVendorController();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize("admin"));

// Get system statistics (must come before /:vendorId)
router.get("/stats", async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalVendors = await Vendor.countDocuments();
        const totalProducts = await Product.countDocuments();
        const pendingApplications = await Vendor.countDocuments({ status: 'pending' });

        res.json({
            success: true,
            data: {
                totalUsers,
                totalVendors,
                totalProducts,
                pendingApplications
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch system stats"
        });
    }
});

// Get all vendor applications (with optional status filter)
// Query params: ?status=pending|approved
router.get("/applications", adminVendorController.getVendorApplications); //done

// Get all vendors with filters
// Query params: ?isApproved=true|false&isActive=true|false
router.get("/", adminVendorController.getAllVendors); //done

// Serve GridFS files (must come before /:vendorId)
router.get("/files/:fileId", async (req, res) => {
    try {
        const { fileId } = req.params;
        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: 'vendorDocuments' });
        
        const file = await bucket.find({ _id: mongoose.Types.ObjectId(fileId) }).toArray();
        
        if (!file || file.length === 0) {
            return res.status(404).json({ message: "File not found" });
        }
        
        const downloadStream = bucket.openDownloadStream(file[0]._id);
        
        res.set('Content-Type', file[0].contentType || 'application/octet-stream');
        res.set('Content-Disposition', `inline; filename="${file[0].filename}"`);
        
        downloadStream.pipe(res);
    } catch (error) {
        console.error('Error serving file:', error);
        res.status(500).json({ message: "Error serving file" });
    }
});

// Get single vendor details
router.get("/:vendorId", adminVendorController.getVendorDetails); //done

// Approve vendor application
router.patch("/:vendorId/approve", adminVendorController.approveVendorApplication); //done

// Reject vendor application
router.patch("/:vendorId/reject", adminVendorController.rejectVendorApplication);

// Fix vendor user roles (utility endpoint)
router.post("/fix-vendor-roles", adminVendorController.fixVendorUserRoles);

// Toggle vendor active status (activate/deactivate)
router.patch("/:vendorId/toggle-status", adminVendorController.toggleVendorStatus);

export default router;