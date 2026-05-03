import mongoose from "mongoose";
import dns from "dns";
/**
 * connectDB - Connect to MongoDB database
 * print connection status to console
 */
export const connectDB = async() => {
    // Use public DNS servers for SRV resolution if local DNS is refusing requests.
    dns.setServers(["8.8.8.8", "1.1.1.1"]);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
        family: 4,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
};