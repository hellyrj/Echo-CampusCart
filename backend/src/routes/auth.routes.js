import {Router} from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";


const router = Router();
const authController = new AuthController();

router.post("/register" , authController.register); //done
router.post("/login" , authController.login); //done
router.post("/logout" , authController.logout);
router.get("/profile", authenticate, authController.getProfile);


export default router;