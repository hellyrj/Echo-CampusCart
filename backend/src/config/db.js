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
    // Use public DNS servers for SRV resolution if local DNS is refusing requests.
    dns.setServers(["8.8.8.8", "1.1.1.1"]);

    const conn = await mongoose.connect(process.env.MONGODB_URI,
         {
        family: 4,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        dialectOptions: isProduction? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }: {}
    }
);

    console.log(`MongoDB connected: ${conn.connection.host}`);
};
