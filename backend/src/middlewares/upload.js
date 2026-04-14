// middleware/upload.js
import multer from 'multer';
import { GridFSBucket } from 'mongodb';

// GridFS storage for file uploads
const storage = multer.memoryStorage();

// GridFS bucket instance (will be initialized when needed)
let gridFSBucket;

const getGridFSBucket = () => {
    if (!gridFSBucket) {
        // Use the existing mongoose connection instead of creating a new one
        const mongoose = require('mongoose');
        const db = mongoose.connection.db;
        gridFSBucket = new GridFSBucket(db, {
            bucketName: 'vendorDocuments'
        });
    }
    return gridFSBucket;
};

// Custom storage handler for GridFS
const gridFSStorage = multer.memoryStorage();

export const uploadDocuments = multer({
    storage: gridFSStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        cb(null, allowedTypes.includes(file.mimetype));
    }
}).array('documents', 5); // Max 5 documents

// Helper function to save files to GridFS
export const saveFilesToGridFS = async (files) => {
    const bucket = getGridFSBucket();
    const uploadedFiles = [];
    
    for (const file of files) {
        try {
            const uploadStream = bucket.openUploadStream(file.originalname, {
                metadata: {
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    uploadedAt: new Date()
                }
            });
            
            // Convert buffer to stream and upload
            uploadStream.end(file.buffer);
            
            // Wait for upload to complete
            const fileId = await new Promise((resolve, reject) => {
                uploadStream.on('finish', () => resolve(uploadStream.id));
                uploadStream.on('error', reject);
            });
            
            uploadedFiles.push({
                fileId,
                filename: file.originalname,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                url: `/api/vendors/files/${fileId}`
            });
        } catch (error) {
            console.error('Error uploading file to GridFS:', error);
            throw new Error(`Failed to upload ${file.originalname}: ${error.message}`);
        }
    }
    
    return uploadedFiles;
};