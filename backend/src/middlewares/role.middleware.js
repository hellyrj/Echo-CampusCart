import { ApiError } from "../utils/ApiError";

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.res.role)) {
            throw new ApiError(403, "Access denied");
        }
        next();
    };
};