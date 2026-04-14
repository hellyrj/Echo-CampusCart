import express from "express";
import { ObjectId } from "mongodb";
import { VendorController } from "../controllers/vendor.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { uploadDocuments } from "../middlewares/upload.js";
import { MongoClient, GridFSBucket } from "mongodb";

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
// VENDOR PRODUCTS
// =========================

router.get(
  "/me/products",
  authenticate,
  controller.getMyProducts
);

router.post(
  "/me/products",
  authenticate,
  controller.createMyProduct
);

router.patch(
  "/me/products/:id",
  authenticate,
  controller.updateMyProduct
);

router.delete(
  "/me/products/:id",
  authenticate,
  controller.deleteMyProduct
);

// =========================
// PUBLIC
// =========================

router.get("/", controller.getApprovedVendors);

router.get("/nearby", controller.getNearbyVendors);

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