// services/cloudinary.service.js
import multer from 'multer';
import { cloudinaryInstance, uploadToCloudinary } from '../config/cloudinary.config.js';

// Custom storage for multer
const storage = multer.memoryStorage();

export class CloudinaryService {
    // Upload single image from buffer
    static async uploadImage(file, options = {}) {
        try {
            console.log(`📤 Uploading: ${file.originalname} (${file.size} bytes)`);
            
            const result = await uploadToCloudinary(file.buffer, options);
            
            console.log(`✅ Uploaded: ${result.public_id}`);
            
            return {
                url: result.secure_url,
                publicId: result.public_id,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                format: result.format,
                width: result.width,
                height: result.height
            };
        } catch (error) {
            console.error('Upload image error:', error);
            throw new Error(`Image upload failed: ${error.message}`);
        }
    }

    // Upload multiple images from buffer array
    static async uploadMultipleImages(files, options = {}) {
        try {
            if (!files || files.length === 0) {
                return [];
            }
            
            console.log(`📦 Uploading ${files.length} images...`);
            
            const uploadPromises = files.map(file => this.uploadImage(file, options));
            const results = await Promise.all(uploadPromises);
            
            console.log(`✅ Successfully uploaded ${results.length} images`);
            return results;
        } catch (error) {
            console.error('Multiple upload error:', error);
            throw new Error(`Multiple upload failed: ${error.message}`);
        }
    }

    // Delete image from Cloudinary
    static async deleteImage(publicId) {
        try {
            const result = await cloudinaryInstance.uploader.destroy(publicId);
            console.log(`🗑️ Deleted: ${publicId}`, result);
            return result;
        } catch (error) {
            console.error('Delete failed:', error);
            throw new Error(`Image deletion failed: ${error.message}`);
        }
    }

    // Delete multiple images
    static async deleteMultipleImages(publicIds) {
        try {
            const result = await cloudinaryInstance.api.delete_resources(publicIds);
            console.log(`🗑️ Deleted ${publicIds.length} images`);
            return result;
        } catch (error) {
            console.error('Multiple delete failed:', error);
            throw new Error(`Multiple image deletion failed: ${error.message}`);
        }
    }

    // Generate optimized URL
    static getOptimizedUrl(publicId, options = {}) {
        return cloudinaryInstance.url(publicId, {
            fetch_format: 'auto',
            quality: 'auto',
            ...options
        });
    }

    // Get storage engine for multer
    static getMulterStorage() {
        return storage;
    }

    // Transform image URL
    static transformImageUrl(url, transformations = {}) {
        const publicId = url.split('/').pop().split('.')[0];
        return cloudinaryInstance.url(publicId, transformations);
    }

    // Upload from file path (for existing files)
    static async uploadFromPath(filePath, options = {}) {
        try {
            const result = await cloudinaryInstance.uploader.upload(filePath, {
                folder: 'campus-cart/products',
                ...options
            });
            
            return {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                size: result.bytes,
                width: result.width,
                height: result.height,
                resourceType: result.resource_type
            };
        } catch (error) {
            throw new Error(`Cloudinary upload failed: ${error.message}`);
        }
    }
}

export default CloudinaryService;