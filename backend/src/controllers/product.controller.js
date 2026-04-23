import { ProductService } from "../services/product.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { processUploadedImages, cleanupProductImages } from "../middlewares/productUpload.js";
import { VendorService } from "../services/vendor.service.js";

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
                processedImages = await processUploadedImages(req.files);
            }
            
            // Parse numeric fields
            const productData = {
                name: req.body.name,
                description: req.body.description,
                vendorId: vendorId,
                images: processedImages,
                basePrice: parseFloat(req.body.basePrice || req.body.price || 0),
                categories: req.body.categories ? JSON.parse(req.body.categories) : [],
                variants: req.body.variants ? JSON.parse(req.body.variants) : [],
                tags: req.body.tags ? JSON.parse(req.body.tags) : [],
                isAvailable: req.body.isAvailable === 'true' || req.body.isAvailable === true,
                dimensions: req.body.dimensions ? JSON.parse(req.body.dimensions) : undefined,
                inventory: req.body.inventory ? JSON.parse(req.body.inventory) : undefined,
                discount: req.body.discount ? JSON.parse(req.body.discount) : undefined
            };
            
            // Remove undefined fields
            Object.keys(productData).forEach(key => 
                productData[key] === undefined && delete productData[key]
            );
            
            const product = await this.productService.createProduct(productData);
            sendResponse(res, 201, "Product created successfully", product);
        } catch (error) {
            console.error('Failed to create product:', error);
            // Clean up uploaded images if product creation fails
            if (req.files && req.files.length > 0 && processedImages.length > 0) {
                try {
                    await cleanupProductImages(processedImages);
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
        const { q, category, minPrice, maxPrice, sort = 'relevance' } = req.query;
        const products = await this.productService.searchProducts({ 
            query: q, 
            category, 
            minPrice, 
            maxPrice, 
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
        
        const updateData = {
            ...req.body,
            ...(processedImages.length > 0 && { images: processedImages }),
            ...(req.body.categories && { categories: JSON.parse(req.body.categories) }),
            ...(req.body.variants && { variants: JSON.parse(req.body.variants) }),
            ...(req.body.tags && { tags: JSON.parse(req.body.tags) }),
            ...(req.body.dimensions && { dimensions: JSON.parse(req.body.dimensions) }),
            ...(req.body.inventory && { inventory: JSON.parse(req.body.inventory) }),
            ...(req.body.discount && { discount: JSON.parse(req.body.discount) })
        };
        
        const product = await this.productService.updateProduct(productId, vendor._id, updateData);
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