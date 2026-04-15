import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthService } from "../services/auth.service.js";
import { sendResponse } from "../utils/apiResponse.js";

export class AuthController {
    constructor() {
        this.authService = new AuthService();
    }
    
    getProfile = asyncHandler(async(req , res) => {
        const result = await this.authService.getProfile(req.user);
        sendResponse(res, 200, "Profile fetched successfully", result);
    });

    register = asyncHandler(async(req, res) => {
        console.log('Register request body:', req.body);
        console.log('Register request headers:', req.headers);
        
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: name, email, password"
            });
        }

        const result = await this.authService.register(
            name, 
            email,
            password,
            role
        );

        sendResponse(res, 201, "user registered successfully", result);
    });

    login = asyncHandler(async(req , res) => {
        const { email , password} = req.body;

        const result = await this.authService.login(email, password);

        sendResponse(res, 200, "Login successful", result);
    });

    logout = asyncHandler(async(req , res) => {
        const result = await this.authService.logout();
        sendResponse(res, 200, "Logout successful", result);
    });
}