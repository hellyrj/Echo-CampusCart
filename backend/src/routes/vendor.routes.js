import express from "express";
import { ObjectId } from "mongodb";
import { VendorController } from "../controllers/vendor.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { uploadDocuments } from "../middlewares/upload.js";
import { MongoClient, GridFSBucket } from "mongodb";
import { DEFAULT_CATEGORIES } from "../constants/defaultCategories.js";
import { DEFAULT_UNIVERSITIES } from "../constants/defaultUniversities.js";
import mongoose from "mongoose";

const router = express.Router();
const controller = new VendorController();

// =========================
// USER
// =========================

router.post(
  "/apply",
  authenticate,
  uploadDocuments,
  controller.submitVendorApplication
); //done

router.get(
  "/me",
  authenticate,
  controller.getMyVendorProfile
);  //done


/**
 router.get(
  "/me/all",
  authenticate,
  controller.getAllMyVendorProfiles
);
 */

// =========================
// PUBLIC
// =========================

router.get("/", controller.getApprovedVendors);

router.get("/nearby", controller.getNearbyVendors);

// Get default categories
router.get("/categories", (req, res) => {
  try {
    console.log('Categories endpoint called');
    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: DEFAULT_CATEGORIES
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories"
    });
  }
});

// Get default universities
router.get("/universities", (req, res) => {
  try {
    console.log('Universities endpoint called');
    console.log('DEFAULT_UNIVERSITIES:', DEFAULT_UNIVERSITIES);
    res.status(200).json({
      success: true,
      message: "Universities fetched successfully",
      data: DEFAULT_UNIVERSITIES
    });
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch universities"
    });
  }
});

// Get single vendor by ID (must come after specific routes)
router.get("/:id", controller.getVendor);

// =========================
// FILE SERVING
// =========================

// Serve uploaded files from GridFS
router.get("/files/:fileId", async (req, res) => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: 'vendorDocuments' });
    
    const fileId = new ObjectId(req.params.fileId);
    const downloadStream = bucket.openDownloadStream(fileId);
    
    downloadStream.on('error', (error) => {
      console.error('File download error:', error);
      res.status(404).json({ message: 'File not found' });
      client.close();
    });
    
    downloadStream.on('file', (file) => {
      res.set('Content-Type', file.metadata?.mimeType || 'application/octet-stream');
      res.set('Content-Disposition', `inline; filename="${file.filename}"`);
    });
    
    downloadStream.pipe(res);
    
    downloadStream.on('end', () => {
      client.close();
    });
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ message: 'Error serving file' });
  }
});

export default router;