// app.js
import express from "express";
import cors from "cors";
import path from "path";
import Category from "./models/category.model.js"; // Import Category model for population

import authRoutes from "./routes/auth.routes.js";
import vendorRouters from "./routes/vendor.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import productRoutes from "./routes/product.routes.js";
import reviewRoutes from "./routes/review.routes.js";

const app = express();

// Global middlewares
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// IMPORTANT: Configure body parsers AFTER multer middleware in routes
// For JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Note: Don't parse JSON for multipart/form-data - multer will handle it
// The express.json() middleware will be skipped for multipart requests

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRouters);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "server running"
    });
});

// Error middleware
app.use(errorHandler);

export default app;