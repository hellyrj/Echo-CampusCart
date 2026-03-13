import { asyncHandler } from "../utils/asyncHandler";
import { AuthService } from "../services/auth.service";

export class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
     register = asyncHandler(async(req , res) => {

        const { name , email , password , university } = req.body;

        const result = await registerUser ({
            name, 
            email,
            password,
            university
        });

        res.status(201).json({
            success: true,
            data: result
        });

    });

    login = asyncHandler(async(req , res) => {
        const { email , password} = req.body;

        const result = await this.authService.login(email, password);

        res.status({
            success: true,
            data: result
        });
    });
}