// server.js
import dotenv from "dotenv";
import path from "path";

// Load environment variables FIRST
console.log('=== Loading Environment Variables ===');

// Only try to load .env file in non-production environments
if (process.env.NODE_ENV !== 'production') {
    const result = dotenv.config();
    
    if (result.error) {
        console.warn('⚠️ No .env file found, using existing environment variables');
    } else {
        console.log('✅ Environment variables loaded from .env file');
    }
} else {
    console.log('✅ Running in production mode, using Render environment variables');
}

// IMPORTANT: Initialize Cloudinary BEFORE importing app
import { cloudinaryInstance } from "./config/cloudinary.config.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { seedCategories } from "./utils/seedCategories.js";
import { seedUniversities } from "./utils/seedUniversities.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        await seedCategories();
        await seedUniversities();
        app.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
