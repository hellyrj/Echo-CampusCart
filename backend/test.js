// test-cloudinary-upload.js
import { loadEnv } from './src/config/env.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Load environment
loadEnv();

console.log('=== Testing Cloudinary Direct Upload ===');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create a simple text file as buffer for testing
const testBuffer = Buffer.from('This is a test file for Cloudinary', 'utf-8');

// Test upload
async function testUpload() {
    try {
        console.log('\n📤 Testing upload with buffer...');
        
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'test-folder',
                    resource_type: 'auto'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(testBuffer);
        });
        
        console.log('✅ Upload successful!');
        console.log('Result:', result);
        
        // Clean up
        if (result.public_id) {
            console.log('\n🗑️ Cleaning up...');
            await cloudinary.uploader.destroy(result.public_id);
            console.log('✅ Test file deleted');
        }
        
    } catch (error) {
        console.error('❌ Upload failed:', error);
    }
}

testUpload();