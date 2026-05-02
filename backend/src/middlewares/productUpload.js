// middlewares/productUpload.js
import multer from 'multer';

// Configure multer with memory storage
/**
 * the memory storage engine stores the files in memory as a buffer objects. it does not have any options.
 * the file info will contain a field clalled buffer that contain the entire file
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 , // 10MB per image 
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, and WebP are allowed.`));
    }
  }
});

// Create wrapped middleware functions
export const uploadProductImages = (req, res, next) => {
  console.log('=== uploadProductImages middleware started ===');
  
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      
      if (err instanceof multer.MulterError) {
        if (err.code === 'FILE_TOO_LARGE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB per image'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files. Maximum 10 images allowed'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Unexpected field. Please use "images" as the field name'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      }
      
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    console.log('Files uploaded successfully:', req.files?.length || 0);
    next();
  });
};

export const uploadSingleProductImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      
      if (err instanceof multer.MulterError) {
        if (err.code === 'FILE_TOO_LARGE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      }
      
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    next();
  });
};

export const processUploadedImages = async (files) => {
  try {
    if (!files || files.length === 0) {
      return [];
    }

    // Import CloudinaryService dynamically to avoid circular dependencies
    const { CloudinaryService } = await import('../services/cloudinary.service.js');
    
    // Upload files to Cloudinary from memory buffer
    const uploadedImages = await CloudinaryService.uploadMultipleImages(files);

    if (!uploadedImages || uploadedImages.length === 0) {
      throw new Error('No images were uploaded to Cloudinary');
    }

    const processedImages = uploadedImages.map((image, index) => ({
      url: image.url,
      publicId: image.publicId,
      alt: files[index].originalname || `Product image ${index + 1}`,
      isMain: index === 0,
      order: index,
      format: image.format,
      size: image.size,
      dimensions: {
        width: image.width || 0,
        height: image.height || 0
      }
    }));

    console.log(`✅ Successfully processed ${processedImages.length} images`);
    return processedImages;
  } catch (error) {
    console.error('❌ Image processing error:', error);
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

export const validateImageData = (imageData) => {
  const requiredFields = ['url', 'publicId'];
  
  for (const field of requiredFields) {
    if (!imageData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  try {
    new URL(imageData.url);
  } catch (error) {
    throw new Error('Invalid image URL format');
  }

  return true;
};

export const cleanupProductImages = async (images) => {
  try {
    if (!images || images.length === 0) {
      return;
    }

    const publicIds = images.map(img => img.publicId);
    
    const { CloudinaryService } = await import('../services/cloudinary.service.js');
    await CloudinaryService.deleteMultipleImages(publicIds);
    console.log(`Successfully deleted ${publicIds.length} images from Cloudinary`);
  } catch (error) {
    console.error('Failed to cleanup images:', error);
  }
};

export const getOptimizedProductImages = async (images, options = {}) => {
  if (!images || images.length === 0) {
    return [];
  }

  const { CloudinaryService } = await import('../services/cloudinary.service.js');

  return images.map(image => ({
    ...image,
    optimizedUrl: CloudinaryService.getOptimizedUrl(image.publicId, {
      width: 300,
      height: 300,
      crop: 'fill',
      ...options
    }),
    thumbnailUrl: CloudinaryService.getOptimizedUrl(image.publicId, {
      width: 150,
      height: 150,
      crop: 'fill'
    }),
    largeUrl: CloudinaryService.getOptimizedUrl(image.publicId, {
      width: 800,
      height: 800,
      crop: 'limit'
    })
  }));
};

export default {
  uploadProductImages,
  uploadSingleProductImage,
  processUploadedImages,
  validateImageData,
  cleanupProductImages,
  getOptimizedProductImages
};