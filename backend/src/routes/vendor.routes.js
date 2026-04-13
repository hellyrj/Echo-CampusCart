import express from "express";
import { VendorController } from "../controllers/vendor.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = express.Router();
const controller = new VendorController();

// =========================
// USER
// =========================

router.post(
  "/apply",
  authenticate,
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



export default router;