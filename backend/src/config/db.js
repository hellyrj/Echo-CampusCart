import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
/**
 * connectDB - Connect to MongoDB database
 * print connection status to console
 */
export const connectDB = asyncHandler( async() => {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
});