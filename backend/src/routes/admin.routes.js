import { Router } from "express";
import { VendorController } from "../controllers/vendor.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import University from "../models/university.model.js";

const router = Router();

// Apply admin authentication and role check to all admin routes
router.use(authenticate);
router.use(requireRole('admin'));

const vendorController = new VendorController();

// Get all vendor applications (with optional status filter)
router.get('/vendors/applications', vendorController.getVendorApplications);

// Approve vendor application
router.put('/vendors/applications/:id/approve', vendorController.approveVendorApplication);

// Reject vendor application
router.put('/vendors/applications/:id/reject', vendorController.rejectVendorApplication);

// Get all universities for admin management
router.get('/universities', async (req, res) => {
    try {
        const universities = await University.find({ isActive: true });
        res.json({
            success: true,
            message: "Universities fetched successfully",
            data: universities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch universities",
            error: error.message
        });
    }
});

// Add new university
router.post('/universities', async (req, res) => {
    try {
        const university = await University.create(req.body);
        res.status(201).json({
            success: true,
            message: "University created successfully",
            data: university
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create university",
            error: error.message
        });
    }
});

// Update university
router.put('/universities/:id', async (req, res) => {
    try {
        const university = await University.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({
            success: true,
            message: "University updated successfully",
            data: university
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update university",
            error: error.message
        });
    }
});

// Delete university
router.delete('/universities/:id', async (req, res) => {
    try {
        await University.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: "University deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete university",
            error: error.message
        });
    }
});

export default router;
