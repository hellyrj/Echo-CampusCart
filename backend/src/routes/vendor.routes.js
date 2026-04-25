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
import geocodingService from "../services/geocoding.service.js";

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
router.get("/categories", async (req, res) => {
  try {
    console.log('Categories endpoint called');
    
    // Import Category model to get actual database categories
    const Category = (await import("../models/category.model.js")).default;
    
    // Try to get categories from database first
    const dbCategories = await Category.find({ isActive: true });
    
    if (dbCategories.length > 0) {
      res.status(200).json({
        success: true,
        message: "Categories fetched successfully",
        data: dbCategories
      });
    } else {
      // Fallback to default categories if none in database
      res.status(200).json({
        success: true,
        message: "Categories fetched successfully",
        data: DEFAULT_CATEGORIES
      });
    }
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

// Get place suggestions for location autocomplete
router.get("/place-suggestions", async (req, res) => {
  try {
    const { query, country = 'ET' } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Query parameter is required and must be at least 2 characters"
      });
    }
    
    console.log('Getting place suggestions for:', query);
    
    const suggestions = await geocodingService.getSuggestions(query, country);
    
    res.status(200).json({
      success: true,
      message: "Place suggestions fetched successfully",
      data: suggestions
    });
  } catch (error) {
    console.error('Error fetching place suggestions:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch place suggestions"
    });
  }
});

// Get vendor products (must come before /:id route)
router.get("/:id/products", controller.getVendorProducts);

// Temporary debug endpoint to check all products
router.get("/debug/all-products", async (req, res) => {
  try {
    const Product = (await import("../models/product.model.js")).default;
    const allProducts = await Product.find({});
    console.log('All products in database:', allProducts.length);
    console.log('Sample product:', allProducts[0]);
    res.json({
      success: true,
      count: allProducts.length,
      products: allProducts.map(p => ({
        _id: p._id,
        name: p.name,
        vendorId: p.vendorId,
        vendorIdType: typeof p.vendorId
      }))
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
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