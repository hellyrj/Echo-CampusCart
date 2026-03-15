import { Router } from "express";
import { VendorController } from "../controllers/vendor.controller.js";
import {authenticate} from "../middlewares/auth.middleware.js";

const router = Router();
const vendorController = new VendorController();

router.post("/vendors", authenticate, vendorController.createVendor);

router.get("/vendors/:id",  vendorController.getVendor);

router.get("/vendors/nearby", vendorController.getNearbyVendors);

router.put("/vendors/:id", authenticate, vendorController.updateVendor);

router.delete("/vendors/:id", authenticate, vendorController.deleteVendor);

export default router;