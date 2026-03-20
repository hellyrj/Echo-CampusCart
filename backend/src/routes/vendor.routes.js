import { Router } from "express";
import { VendorController } from "../controllers/vendor.controller.js";
import {authenticate} from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authenticate);

const vendorController = new VendorController();

//private route
router.post("/vendors", authenticate, vendorController.createVendor);

//public route
router.get("/vendors/nearby", vendorController.getNearbyVendors);

//public route
router.get("/vendors/:id",  vendorController.getVendor);

//private route
router.put("/vendors/:id", authenticate, vendorController.updateVendor);

//private route
router.delete("/vendors/:id", authenticate, vendorController.deleteVendor);

export default router;