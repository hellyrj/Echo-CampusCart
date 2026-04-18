import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import vendorRouters from "./routes/vendor.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import productRoutes from "./routes/product.routes.js";
import reviewRoutes from "./routes/review.routes.js";
const app = express();

/**
 * global middlewares
 */
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Custom middleware to handle requests without Content-Type
app.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        if (!req.headers['content-type'] && req.headers['content-length'] > '0') {
            req.headers['content-type'] = 'application/json';
        }
    }
    next();
});

app.use(express.json({ type: ['application/json', 'text/plain'] }));
app.use(express.urlencoded({ extended: true }));

/**
 * routes
 */

app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRouters);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);

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