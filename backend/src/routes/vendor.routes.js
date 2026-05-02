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

router.get("/search", controller.searchVendors);

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

// Test endpoint to verify backend is receiving requests
router.get("/test", (req, res) => {
  console.log('=== Backend Test Endpoint Hit ===');
  console.log('Request headers:', req.headers);
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  res.json({ 
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method
  });
});

// Get single vendor by ID (must come after specific routes)
router.get("/:id", controller.getVendor);

// =========================
// FILE SERVING
// =========================

// Serve uploaded files from filesystem
router.get("/files/:fileId", async (req, res) => {
  try {
    console.log('=== File Request Debug ===');
    console.log('File request received for ID:', req.params.fileId);
    
    // Files are stored in filesystem, not GridFS
    const fs = await import('fs');
    const path = await import('path');
    
    const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
    const filePath = path.join(uploadsDir, req.params.fileId);
    
    console.log('Uploads directory:', uploadsDir);
    console.log('Full file path:', filePath);
    console.log('File exists:', fs.existsSync(filePath));
    
    // Check if uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      console.error('Uploads directory does not exist:', uploadsDir);
      return res.status(404).json({ message: 'Uploads directory not found' });
    }
    
    // List files in uploads directory for debugging
    try {
      const files = fs.readdirSync(uploadsDir);
      console.log('Files in uploads directory:', files);
    } catch (err) {
      console.error('Error reading uploads directory:', err);
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return res.status(404).json({ 
        message: 'File not found',
        fileId: req.params.fileId,
        uploadsDir: uploadsDir,
        filePath: filePath
      });
    }
    
    console.log('File found, serving:', filePath);
    
    // Get file stats
    const stats = fs.statSync(filePath);
    console.log('File size:', stats.size, 'bytes');
    console.log('File modified:', stats.mtime);
    
    // Set appropriate content type based on file extension
    const ext = path.extname(req.params.fileId).toLowerCase();
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png'
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    console.log('Content type:', contentType);
    
    res.set('Content-Type', contentType);
    res.set('Content-Disposition', `inline; filename="${req.params.fileId}"`);
    res.set('Content-Length', stats.size);
    
    // Serve the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      res.status(500).json({ message: 'Error serving file' });
    });
    
    fileStream.on('end', () => {
      console.log('File stream ended successfully');
    });
    
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ message: 'Error serving file' });
  }
});

export default router;