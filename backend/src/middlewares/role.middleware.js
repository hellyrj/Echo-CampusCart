import { ApiError } from "../utils/ApiError.js";

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, "Access denied");
        }
        next();
    };
};

export const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, "Authentication required"));
        }

        if (req.user.role !== requiredRole) {
            return next(new ApiError(403, `Access denied. ${requiredRole} role required`));
        }

        next();
    };
};