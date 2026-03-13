import {Router} from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";


const router = Router();
const authController = new AuthController();

router.post("/register" , authController.register);
router.post("/login" , authController.login);
router.post("/logout" , authController.logout);
router.get("/profile", authenticate, authController.getProfile);


export default router;