// server.js
import dotenv from "dotenv";
import path from "path";

// Load environment variables FIRST
console.log('=== Loading Environment Variables ===');
const result = dotenv.config();

if (result.error) {
    console.error('❌ Error loading .env:', result.error);
    process.exit(1);
}

console.log('✅ Environment variables loaded');

// IMPORTANT: Initialize Cloudinary BEFORE importing app
import { cloudinaryInstance } from "./config/cloudinary.config.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { seedCategories } from "./utils/seedCategories.js";
import { seedUniversities } from "./utils/seedUniversities.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    await seedCategories();
    await seedUniversities();
    app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`);
    });
};

startServer();