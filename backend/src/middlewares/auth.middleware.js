import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import  UserRepository  from "../repositories/user.repository.js";

const userRepo =  UserRepository;

export const authenticate = asyncHandler( async(req , res , next) => {
    console.log('=== Auth Middleware Debug ===');
    console.log('Auth header:', req.headers.authorization);
    
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log('❌ No valid auth header found');
        throw new ApiError(401 , "Unauthorized");
    }

    const token = authHeader.split(" ")[1];
    console.log('Token extracted:', token.substring(0, 20) + '...');

    try {
        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        console.log('Token decoded:', decoded);

        const user = await userRepo.findById(decoded.userId);
        console.log('User found:', user ? `${user.name} (${user.role})` : 'null');

        if(!user) {
            console.log('❌ User not found in database');
            throw new ApiError(401 , "Unauthorized");
        }

        req.user = user;
        console.log('✅ User attached to request:', req.user.name, req.user.role);

        next();
    } catch (jwtError) {
        console.log('❌ JWT verification failed:', jwtError.message);
        throw new ApiError(401 , "Unauthorized");
    }
})