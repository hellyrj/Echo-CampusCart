import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { UserRepository } from "../repositories/user.repository.js";

const userRepo = new UserRepository();

export const authenticate = asyncHandler( async(req , res , next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(401 , "Unauthorized");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token , process.env.JWT_SECRET);

    const user = await userRepo.findById(decoded.userId);

    if(!user) {
        throw new ApiError(401 , "Unauthorized");
    }

    req.user = user;

    next();
})