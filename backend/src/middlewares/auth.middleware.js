import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import  UserRepository  from "../repositories/user.repository.js";

const userRepo =  UserRepository;

export const authenticate = asyncHandler( async(req , res , next) => {
    console.log('Auth middleware - Request URL:', req.originalUrl);
    console.log('Auth middleware - Auth header:', req.headers.authorization);
    
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log('Auth middleware - No valid Bearer token found');
        throw new ApiError(401 , "Unauthorized");
    }

    const token = authHeader.split(" ")[1];
    console.log('Auth middleware - Token extracted:', token.substring(0, 20) + '...');

    try {
        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        console.log('Auth middleware - Token decoded:', decoded);

        const user = await userRepo.findById(decoded.userId);
        console.log('Auth middleware - User found:', user ? user.email : 'null');

        if(!user) {
            console.log('Auth middleware - User not found');
            throw new ApiError(401 , "Unauthorized");
        }

        req.user = user;
        console.log('Auth middleware - Authentication successful');
        next();
    } catch (jwtError) {
        console.log('Auth middleware - JWT verification failed:', jwtError.message);
        throw new ApiError(401 , "Unauthorized");
    }
})