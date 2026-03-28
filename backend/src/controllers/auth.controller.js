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
        const { name, email, password, university, role } = req.body;

        const result = await this.authService.register(
            name, 
            email,
            password,
            university,
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