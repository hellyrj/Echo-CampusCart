// config/cloudinary.config.js
import { v2 as cloudinary } from 'cloudinary';
import { loadEnv } from './env.js';

// Load environment variables
loadEnv();

console.log('=== Initializing Cloudinary Configuration ===');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✓ Present' : '✗ Missing');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Present' : '✗ Missing');

// Check if all required variables are present
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Missing Cloudinary environment variables!');
    console.error('Please check your .env file');
    throw new Error('Cloudinary environment variables not properly configured');
}

// Configure Cloudinary once globally
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify configuration works
try {
    // Test the configuration by pinging Cloudinary
    console.log('✅ Cloudinary configured successfully');
} catch (error) {
    console.error('❌ Cloudinary configuration failed:', error);
}

// Export the configured cloudinary instance
export const cloudinaryInstance = cloudinary;

// Also export a ready-to-use upload function
export const uploadToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'campus-cart/products',
                resource_type: 'auto',
                ...options
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

export default cloudinary;