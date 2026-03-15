import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import vendorRouters from "./routes/vendor.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

/**
 * global middlewares
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * routes
 */

app.use("/api/auth", authRoutes);
app.use("/api", vendorRouters);

/**
 * Health check
 */

app.get("/api/health", (req, res)=> {
    res.json({
        status: "server running"
    });
});

/**
 * Error middleware
 */

app.use(errorHandler);

export default app;