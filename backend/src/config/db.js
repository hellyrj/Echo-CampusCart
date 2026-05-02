import mongoose from "mongoose";
/**
 * connectDB - Connect to MongoDB database
 * print connection status to console
 */
export const connectDB = async() => {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
};