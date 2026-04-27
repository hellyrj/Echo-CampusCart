import { ProductService } from "../services/product.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { processUploadedImages, cleanupProductImages } from "../middlewares/productUpload.js";
import { VendorService } from "../services/vendor.service.js";
import mongoose from "mongoose";

export class ProductController {
    constructor() {
        this.productService = new ProductService();
        this.vendorService = new VendorService();
    }

    // Helper method to get vendor ID from user
    async getVendorId(req) {
        const vendor = await this.vendorService.getVendorByUserId(req.user._id);
        if (!vendor) {
            throw new Error("Vendor profile not found");
        }
        if (!vendor.isApproved) {
            throw new Error("Vendor not approved");
        }
        return vendor._id;
    }

   createProduct = asyncHandler(async (req, res, next) => {
    let processedImages = []; // Define here to make it available in catch block
    
    try {
        console.log('=== Creating new product ===');
        console.log('Request body:', req.body);
        console.log('Files:', req.files?.length || 0);
        
        // Get vendor document to get vendorId
        const vendor = await this.vendorService.getVendorByUserId(req.user._id);
        
        if (!vendor) {
            return sendResponse(res, 404, "Vendor profile not found", null);
        }
        
        if (!vendor.isApproved) {
            return sendResponse(res, 403, "Vendor not approved", null);
        }
        
        const vendorId = vendor._id;
        
        // Process uploaded images if any
        if (req.files && req.files.length > 0) {
            console.log(`Processing ${req.files.length} images...`);
            processedImages = await processUploadedImages(req.files);
            console.log('Images processed successfully:', processedImages.length);
        }
        
        // Parse categories - handle both array and JSON string (including double-encoded)
        let categories = [];
        if (req.body.categories) {
            try {
                console.log('Raw categories from request:', req.body.categories);
                console.log('Raw categories type:', typeof req.body.categories);
                
                // Check if categories is already an array (from multiple form fields)
                if (Array.isArray(req.body.categories)) {
                    categories = req.body.categories;
                    console.log('Categories already array:', categories);
                } else {
                    // Try to parse as JSON string with multiple attempts
                    let parsedCategories = req.body.categories;
                    let attempts = 0;
                    
                    while (typeof parsedCategories === 'string' && attempts < 3) {
                        console.log(`Parse attempt ${attempts + 1}:`, parsedCategories);
                        try {
                            parsedCategories = JSON.parse(parsedCategories);
                            console.log('Parse successful:', parsedCategories);
                        } catch (e) {
                            console.log('Parse failed, breaking out');
                            break;
                        }
                        attempts++;
                    }
                    
                    // If after all attempts it's still a string, treat it as a single category
                    if (typeof parsedCategories === 'string') {
                        console.log('Treating as single category:', parsedCategories);
                        parsedCategories = [parsedCategories];
                    }
                    
                    categories = parsedCategories;
                }
                console.log('Final parsed categories:', categories);
                
                // Convert category names to ObjectIds if needed
                if (categories.length > 0 && typeof categories[0] === 'string') {
                    console.log('Converting category strings to ObjectIds...');
                    const Category = (await import("../models/category.model.js")).default;
                    
                    // Check if these are ObjectIds or category names
                    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
                    
                    if (categories.every(cat => objectIdPattern.test(cat))) {
                        // These are already ObjectIds, use them directly
                        console.log('Categories are already ObjectIds:', categories);
                        categories = categories.map(cat => new mongoose.Types.ObjectId(cat));
                    } else {
                        // These are category names, convert to ObjectIds
                        console.log('Categories are names, converting to ObjectIds...');
                        const categoryObjects = await Category.find({ 
                            name: { $in: categories },
                            isActive: true 
                        });
                        
                        if (categoryObjects.length > 0) {
                            categories = categoryObjects.map(cat => cat._id);
                            console.log('Converted categories to ObjectIds:', categories);
                        } else {
                            console.warn('No categories found in database for names:', categories);
                            // Create categories if they don't exist
                            const newCategories = await Category.insertMany(
                                categories.map(name => ({ name, isActive: true }))
                            );
                            categories = newCategories.map(cat => cat._id);
                            console.log('Created new categories:', categories);
                        }
                    }
                }
                
            } catch (parseError) {
                console.error('Failed to parse categories:', parseError);
                // If parsing fails, try to use as is (might be single value)
                categories = [req.body.categories];
            }
        }
        
        // Parse tags - handle both array and JSON string
        let tags = [];
        if (req.body.tags) {
            try {
                if (Array.isArray(req.body.tags)) {
                    tags = req.body.tags;
                } else {
                    tags = JSON.parse(req.body.tags);
                }
                console.log('Parsed tags:', tags);
            } catch (parseError) {
                console.error('Failed to parse tags:', parseError);
                tags = [req.body.tags];
            }
        }
        
        // Parse nested objects with better error handling
        let dimensions = undefined;
        if (req.body.dimensions) {
            try {
                dimensions = typeof req.body.dimensions === 'string' 
                    ? JSON.parse(req.body.dimensions) 
                    : req.body.dimensions;
                
                // Convert empty strings to undefined or keep as is
                Object.keys(dimensions).forEach(key => {
                    if (dimensions[key] === '' || dimensions[key] === null) {
                        delete dimensions[key];
                    } else if (!isNaN(dimensions[key])) {
                        dimensions[key] = parseFloat(dimensions[key]);
                    }
                });
                
                // Remove if all fields are empty
                if (Object.keys(dimensions).length === 0) {
                    dimensions = undefined;
                }
            } catch (parseError) {
                console.error('Failed to parse dimensions:', parseError);
                dimensions = undefined;
            }
        }
        
        let inventory = undefined;
        if (req.body.inventory) {
            try {
                inventory = typeof req.body.inventory === 'string' 
                    ? JSON.parse(req.body.inventory) 
                    : req.body.inventory;
                
                // Ensure numeric fields are numbers
                if (inventory.totalStock !== undefined && inventory.totalStock !== '') {
                    inventory.totalStock = parseInt(inventory.totalStock) || 0;
                }
                if (inventory.lowStockThreshold !== undefined && inventory.lowStockThreshold !== '') {
                    inventory.lowStockThreshold = parseInt(inventory.lowStockThreshold) || 5;
                }
                if (inventory.trackInventory !== undefined) {
                    inventory.trackInventory = inventory.trackInventory === true || 
                                              inventory.trackInventory === 'true';
                }
            } catch (parseError) {
                console.error('Failed to parse inventory:', parseError);
                inventory = undefined;
            }
        }
        
        let discount = undefined;
        if (req.body.discount) {
            try {
                discount = typeof req.body.discount === 'string' 
                    ? JSON.parse(req.body.discount) 
                    : req.body.discount;
                
                // Ensure proper types
                if (discount.percentage !== undefined && discount.percentage !== '') {
                    discount.percentage = parseFloat(discount.percentage) || 0;
                }
                if (discount.isActive !== undefined) {
                    discount.isActive = discount.isActive === true || 
                                       discount.isActive === 'true';
                }
                if (discount.validUntil && typeof discount.validUntil === 'string' && discount.validUntil === '') {
                    delete discount.validUntil;
                }
                
                // Remove if no percentage or not active
                if (!discount.percentage || discount.percentage === 0) {
                    discount = undefined;
                }
            } catch (parseError) {
                console.error('Failed to parse discount:', parseError);
                discount = undefined;
            }
        }
        
        // Parse variants if they exist
        let variants = [];
        if (req.body.variants) {
            try {
                variants = Array.isArray(req.body.variants) 
                    ? req.body.variants 
                    : JSON.parse(req.body.variants);
                
                // Ensure each variant has proper types
                variants = variants.map(variant => ({
                    ...variant,
                    price: variant.price ? parseFloat(variant.price) : undefined,
                    stock: variant.stock ? parseInt(variant.stock) : 0
                }));
            } catch (parseError) {
                console.error('Failed to parse variants:', parseError);
                variants = [];
            }
        }
        
        // Build the product data object
        const productData = {
            name: req.body.name,
            description: req.body.description || '',
            vendorId: vendorId,
            images: processedImages,
            basePrice: parseFloat(req.body.basePrice || req.body.price || 0),
            categories: categories,
            variants: variants,
            tags: tags,
            isAvailable: req.body.isAvailable === true || 
                        req.body.isAvailable === 'true' || 
                        req.body.isAvailable === undefined, // Default to true
            dimensions: dimensions,
            inventory: inventory,
            discount: discount
        };
        
        // Log the final product data for debugging
        console.log('Final product data to create:', JSON.stringify({
            ...productData,
            images: `${productData.images.length} images`
        }, null, 2));
        
        // Remove undefined fields
        Object.keys(productData).forEach(key => {
            if (productData[key] === undefined || productData[key] === null) {
                delete productData[key];
            }
        });
        
        // Create the product
        const product = await this.productService.createProduct(productData);
        
        // Populate categories before sending response
        if (product.categories && product.categories.length > 0) {
            await product.populate('categories');
        }
        
        console.log('Product created successfully:', product._id);
        console.log('Categories saved:', product.categories);
        
        sendResponse(res, 201, "Product created successfully", product);
        
    } catch (error) {
        console.error('Failed to create product:', error);
        
        // Clean up uploaded images if product creation fails
        if (processedImages.length > 0) {
            try {
                await cleanupProductImages(processedImages);
                console.log('Cleaned up images after failed product creation');
            } catch (cleanupError) {
                console.error('Failed to cleanup images:', cleanupError);
            }
        }
        
        throw error; // Let asyncHandler handle it
    }
});

    getProducts = asyncHandler(async (req, res, next) => {
        const products = await this.productService.getAllProducts(req.query);
        sendResponse(res, 200, "Products fetched successfully", products);
    });

    getProduct = asyncHandler(async (req, res, next) => {
        const product = await this.productService.getProductById(req.params.id);
        await this.productService.incrementViews(req.params.id);
        sendResponse(res, 200, "Product fetched successfully", product);
    });

    searchProducts = asyncHandler(async (req, res, next) => {
        const { q, category, minPrice, maxPrice, university, sort = 'relevance' } = req.query;
        console.log('Search products controller:', { q, category, minPrice, maxPrice, university, sort });
        
        const products = await this.productService.searchProducts({ 
            query: q, 
            category, 
            minPrice, 
            maxPrice, 
            university,
            sort 
        });
        sendResponse(res, 200, "Search results", products);
    });

    getPopularProducts = asyncHandler(async (req, res, next) => {
        const { limit = 10 } = req.query;
        const products = await this.productService.getPopularProducts(parseInt(limit));
        sendResponse(res, 200, "Popular products fetched successfully", products);
    });

    getVendorProducts = asyncHandler(async (req, res, next) => {
        // FIXED: Get actual vendor ID instead of using user._id
        const vendor = await this.vendorService.getVendorByUserId(req.user._id);
        if (!vendor) {
            return sendResponse(res, 404, "Vendor profile not found", null);
        }
        
        const { page = 1, limit = 10, status } = req.query;
        const products = await this.productService.getVendorProducts(vendor._id, {
            page: parseInt(page),
            limit: parseInt(limit),
            status
        });
        
        // Populate categories for each product
        if (products && Array.isArray(products)) {
            for (const product of products) {
                if (product.categories && product.categories.length > 0) {
                    await product.populate('categories');
                }
            }
        }
        
        sendResponse(res, 200, "Vendor products fetched successfully", products);
    });

    updateProduct = asyncHandler(async (req, res, next) => {
    const productId = req.params.id;
    
    // FIXED: Get actual vendor ID
    const vendor = await this.vendorService.getVendorByUserId(req.user._id);
    if (!vendor) {
        return sendResponse(res, 404, "Vendor profile not found", null);
    }
    
    let processedImages = [];
    if (req.files && req.files.length > 0) {
        processedImages = await processUploadedImages(req.files);
    }
    
    // Build update data with proper parsing (same as create)
    const updateData = {
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.description && { description: req.body.description }),
        ...(req.body.basePrice && { basePrice: parseFloat(req.body.basePrice) }),
        ...(req.body.price && !req.body.basePrice && { basePrice: parseFloat(req.body.price) }),
        ...(processedImages.length > 0 && { images: processedImages }),
        ...(req.body.isAvailable !== undefined && { 
            isAvailable: req.body.isAvailable === true || req.body.isAvailable === 'true' 
        }),
    };
    
    // Parse categories
    if (req.body.categories) {
        try {
            updateData.categories = Array.isArray(req.body.categories) 
                ? req.body.categories 
                : JSON.parse(req.body.categories);
        } catch (e) {
            updateData.categories = [req.body.categories];
        }
    }
    
    // Parse tags
    if (req.body.tags) {
        try {
            updateData.tags = Array.isArray(req.body.tags) 
                ? req.body.tags 
                : JSON.parse(req.body.tags);
        } catch (e) {
            updateData.tags = [req.body.tags];
        }
    }
    
    // Parse nested objects
    if (req.body.dimensions) {
        try {
            updateData.dimensions = typeof req.body.dimensions === 'string' 
                ? JSON.parse(req.body.dimensions) 
                : req.body.dimensions;
        } catch (e) {
            console.error('Failed to parse dimensions:', e);
        }
    }
    
    if (req.body.inventory) {
        try {
            updateData.inventory = typeof req.body.inventory === 'string' 
                ? JSON.parse(req.body.inventory) 
                : req.body.inventory;
        } catch (e) {
            console.error('Failed to parse inventory:', e);
        }
    }
    
    if (req.body.discount) {
        try {
            updateData.discount = typeof req.body.discount === 'string' 
                ? JSON.parse(req.body.discount) 
                : req.body.discount;
        } catch (e) {
            console.error('Failed to parse discount:', e);
        }
    }
    
    if (req.body.variants) {
        try {
            updateData.variants = Array.isArray(req.body.variants) 
                ? req.body.variants 
                : JSON.parse(req.body.variants);
        } catch (e) {
            console.error('Failed to parse variants:', e);
        }
    }
    
    console.log('Update data:', updateData);
    
    const product = await this.productService.updateProduct(productId, vendor._id, updateData);
    
    // Populate categories if they were updated
    if (updateData.categories) {
        await product.populate('categories');
    }
    
    sendResponse(res, 200, "Product updated successfully", product);
});

    deleteProduct = asyncHandler(async (req, res, next) => {
        const productId = req.params.id;
        
        // FIXED: Get actual vendor ID
        const vendor = await this.vendorService.getVendorByUserId(req.user._id);
        if (!vendor) {
            return sendResponse(res, 404, "Vendor profile not found", null);
        }
        
        const product = await this.productService.getProductById(productId);
        const result = await this.productService.deleteProduct(productId, vendor._id);
        
        if (product && product.images && product.images.length > 0) {
            await cleanupProductImages(product.images);
        }
        
        sendResponse(res, 200, "Product deleted successfully", result);
    });

    // Add new images to existing product
    addProductImages = asyncHandler(async (req, res, next) => {
        const productId = req.params.id;
        
        // FIXED: Get actual vendor ID
        const vendor = await this.vendorService.getVendorByUserId(req.user._id);
        if (!vendor) {
            return sendResponse(res, 404, "Vendor profile not found", null);
        }
        
        if (!req.files || req.files.length === 0) {
            return sendResponse(res, 400, "No images provided");
        }
        
        const newImages = await processUploadedImages(req.files);
        const product = await this.productService.addProductImages(productId, vendor._id, newImages);
        sendResponse(res, 200, "Images added successfully", product);
    });

    // Remove image from product
    removeProductImage = asyncHandler(async (req, res, next) => {
        const { productId, imageIndex } = req.params;
        
        // FIXED: Get actual vendor ID
        const vendor = await this.vendorService.getVendorByUserId(req.user._id);
        if (!vendor) {
            return sendResponse(res, 404, "Vendor profile not found", null);
        }
        
        const result = await this.productService.removeProductImage(productId, vendor._id, parseInt(imageIndex));
        sendResponse(res, 200, "Image removed successfully", result);
    });

    // Update product availability
    updateAvailability = asyncHandler(async (req, res, next) => {
        const productId = req.params.id;
        
        // FIXED: Get actual vendor ID
        const vendor = await this.vendorService.getVendorByUserId(req.user._id);
        if (!vendor) {
            return sendResponse(res, 404, "Vendor profile not found", null);
        }
        
        const { isAvailable } = req.body;
        const product = await this.productService.updateAvailability(productId, vendor._id, isAvailable);
        sendResponse(res, 200, "Product availability updated", product);
    });

    // Update inventory
    updateInventory = asyncHandler(async (req, res, next) => {
        const productId = req.params.id;
        
        // FIXED: Get actual vendor ID
        const vendor = await this.vendorService.getVendorByUserId(req.user._id);
        if (!vendor) {
            return sendResponse(res, 404, "Vendor profile not found", null);
        }
        
        const { totalStock, lowStockThreshold, trackInventory } = req.body;
        const product = await this.productService.updateInventory(productId, vendor._id, {
            totalStock,
            lowStockThreshold,
            trackInventory
        });
        sendResponse(res, 200, "Product inventory updated", product);
    });

    // Admin approve product
    adminApprove = asyncHandler(async (req, res, next) => {
        const productId = req.params.id;
        const { approved } = req.body;
        const product = await this.productService.adminApproveProduct(productId, approved);
        sendResponse(res, 200, "Product approval status updated", product);
    });

    // Admin reject product
    adminReject = asyncHandler(async (req, res, next) => {
        const productId = req.params.id;
        const { rejectionReason } = req.body;
        const product = await this.productService.adminRejectProduct(productId, rejectionReason);
        sendResponse(res, 200, "Product rejected", product);
    });
}