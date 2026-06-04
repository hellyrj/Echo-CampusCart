import mongoose from "mongoose";
import dns from "dns";
import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

/**
 * connectDB - Connect to MongoDB database
 * print connection status to console
 */

export const connectDB = async() => {
    // Only set custom DNS servers in development (if needed)
    if (!isProduction) {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
    }

    const mongooseOptions = {
        family: 4,  // Use IPv4
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
    };

    // Add SSL options for production (MongoDB Atlas requires this)
    if (isProduction) {
        mongooseOptions.ssl = true;
        // Optional: If you need to allow self-signed certificates
        // mongooseOptions.tlsAllowInvalidCertificates = true;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
};
