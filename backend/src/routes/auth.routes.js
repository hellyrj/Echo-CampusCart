import {Routes} from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Routes();

router.post("/register" , authController.register);
router.post("/login" , authController.login);

export default router;