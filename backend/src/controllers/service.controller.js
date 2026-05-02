import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { ServiceService } from "../services/service.service.js";
import { processUploadedImages } from "../middlewares/productUpload.js";
import { VendorService } from "../services/vendor.service.js";

export class ServiceController {
    constructor(serviceService = new ServiceService()) {
        this.serviceService = serviceService;
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

    // =========================
    // VENDOR SIDE
    // =========================

    createService = asyncHandler(async (req, res, next) => {
        console.log('=== Creating service ===');
        console.log('Request body:', req.body);
        console.log('Files:', req.files?.length || 0);
        console.log('User:', req.user);
        
        // Get vendor document to get vendorId
        const vendor = await this.vendorService.getVendorByUserId(req.user._id);
        
        if (!vendor) {
            return sendResponse(res, 404, "Vendor profile not found", null);
        }
        
        if (!vendor.isApproved) {
            return sendResponse(res, 403, "Vendor not approved", null);
        }
        
        const vendorId = vendor._id;
        console.log('Vendor ID:', vendorId);
        
        let serviceImages = [];

        // Handle image uploads using product upload middleware
        if (req.files && req.files.length > 0) {
            try {
                console.log('Processing images...');
                serviceImages = await processUploadedImages(req.files);
                console.log('Processed images:', serviceImages);
            } catch (error) {
                console.error('Error uploading service images:', error);
                return sendResponse(res, 400, "Image upload failed", { error: error.message });
            }
        }

        const serviceData = {
            ...req.body,
            vendorId,
            images: serviceImages.map(img => img.url) // Convert to string URLs for service model
        };
        
        console.log('Service data before processing:', serviceData);

        // Convert string fields to appropriate types
        if (serviceData.basePrice) {
            serviceData.basePrice = parseFloat(serviceData.basePrice);
        }
        if (serviceData.minimumHours) {
            serviceData.minimumHours = parseFloat(serviceData.minimumHours);
        }
        if (serviceData.estimatedDuration) {
            serviceData.estimatedDuration = parseFloat(serviceData.estimatedDuration);
        }
        if (serviceData.travelRadius) {
            serviceData.travelRadius = parseFloat(serviceData.travelRadius);
        }
        if (serviceData.travelFee) {
            serviceData.travelFee = parseFloat(serviceData.travelFee);
        }

        // Parse boolean fields
        if (serviceData.canTravel !== undefined) {
            serviceData.canTravel = serviceData.canTravel === 'true';
        }
        if (serviceData.isActive !== undefined) {
            serviceData.isActive = serviceData.isActive === 'true';
        }
        if (serviceData.isFeatured !== undefined) {
            serviceData.isFeatured = serviceData.isFeatured === 'true';
        }

        // Parse availability object
        if (serviceData.availability) {
            try {
                serviceData.availability = JSON.parse(serviceData.availability);
            } catch (error) {
                console.warn('Failed to parse availability:', error);
            }
        }

        // Parse tags array
        if (serviceData.tags) {
            if (typeof serviceData.tags === 'string') {
                serviceData.tags = serviceData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            }
        }

        try {
            const service = await this.serviceService.createService(serviceData);
            console.log('Service created successfully:', service);
            sendResponse(res, 201, "Service created successfully", service);
        } catch (error) {
            console.error('Error creating service:', error);
            sendResponse(res, 500, "Failed to create service", { error: error.message });
        }
    });

    getMyServices = asyncHandler(async (req, res, next) => {
        const vendorId = await this.getVendorId(req);
        const { page = 1, limit = 20, status, category } = req.query;

        const services = await this.serviceService.getVendorServices(vendorId, {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            category
        });

        sendResponse(res, 200, "Vendor services fetched successfully", services);
    });

    updateService = asyncHandler(async (req, res, next) => {
        const { id: serviceId } = req.params;
        const vendorId = await this.getVendorId(req);

        // Check if service belongs to this vendor
        const existingService = await this.serviceService.getServiceById(serviceId);
        if (!existingService || existingService.vendorId.toString() !== vendorId) {
            return sendResponse(res, 403, "You can only update your own services");
        }

        let serviceImages = existingService.images; // Keep existing images

        // Handle new image uploads using product upload middleware
        if (req.files && req.files.length > 0) {
            try {
                const newImages = await processUploadedImages(req.files);
                serviceImages = [...serviceImages, ...newImages];
            } catch (error) {
                console.error('Error uploading service images:', error);
                return sendResponse(res, 400, "Image upload failed", { error: error.message });
            }
        }

        const updateData = {
            ...req.body,
            images: serviceImages
        };

        // Convert numeric fields
        if (updateData.basePrice) {
            updateData.basePrice = parseFloat(updateData.basePrice);
        }
        if (updateData.minimumHours) {
            updateData.minimumHours = parseFloat(updateData.minimumHours);
        }
        if (updateData.estimatedDuration) {
            updateData.estimatedDuration = parseFloat(updateData.estimatedDuration);
        }
        if (updateData.travelRadius) {
            updateData.travelRadius = parseFloat(updateData.travelRadius);
        }
        if (updateData.travelFee) {
            updateData.travelFee = parseFloat(updateData.travelFee);
        }

        // Parse boolean fields
        if (updateData.canTravel !== undefined) {
            updateData.canTravel = updateData.canTravel === 'true';
        }
        if (updateData.isActive !== undefined) {
            updateData.isActive = updateData.isActive === 'true';
        }
        if (updateData.isFeatured !== undefined) {
            updateData.isFeatured = updateData.isFeatured === 'true';
        }

        // Parse availability object
        if (updateData.availability) {
            try {
                updateData.availability = JSON.parse(updateData.availability);
            } catch (error) {
                console.warn('Failed to parse availability:', error);
            }
        }

        // Parse tags array
        if (updateData.tags) {
            if (typeof updateData.tags === 'string') {
                updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            }
        }

        const service = await this.serviceService.updateService(serviceId, updateData);
        sendResponse(res, 200, "Service updated successfully", service);
    });

    deleteService = asyncHandler(async (req, res, next) => {
        const { id: serviceId } = req.params;
        const vendorId = await this.getVendorId(req);

        // Check if service belongs to this vendor
        const existingService = await this.serviceService.getServiceById(serviceId);
        if (!existingService || existingService.vendorId.toString() !== vendorId) {
            return sendResponse(res, 403, "You can only delete your own services");
        }

        await this.serviceService.deleteService(serviceId);
        sendResponse(res, 200, "Service deleted successfully");
    });

    // =========================
    // PUBLIC (STUDENTS)
    // =========================

    getAllServices = asyncHandler(async (req, res, next) => {
        const {
            page = 1,
            limit = 20,
            category,
            pricingModel,
            location,
            minPrice,
            maxPrice,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            vendorId
        } = req.query;

        const filters = {
            category,
            pricingModel,
            location,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            search,
            vendorId
        };

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            sortOrder: sortOrder === 'asc' ? 'asc' : 'desc'
        };

        const services = await this.serviceService.getAllServices(filters, options);
        sendResponse(res, 200, "Services fetched successfully", services);
    });

    getService = asyncHandler(async (req, res, next) => {
        const { id: serviceId } = req.params;
        
        const service = await this.serviceService.getServiceById(serviceId);
        if (!service) {
            return sendResponse(res, 404, "Service not found");
        }

        sendResponse(res, 200, "Service fetched successfully", service);
    });

    getServicesByVendor = asyncHandler(async (req, res, next) => {
        const { vendorId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const services = await this.serviceService.getVendorServices(vendorId, {
            page: parseInt(page),
            limit: parseInt(limit)
        });

        sendResponse(res, 200, "Vendor services fetched successfully", services);
    });

    searchServices = asyncHandler(async (req, res, next) => {
        const {
            lng,
            lat,
            radius = 5000,
            searchItem,
            category,
            pricingModel,
            location,
            minPrice,
            maxPrice,
            sortBy = 'distance',
            page = 1,
            limit = 20
        } = req.query;

        const searchParams = {
            longitude: lng ? parseFloat(lng) : undefined,
            latitude: lat ? parseFloat(lat) : undefined,
            radius: parseFloat(radius),
            searchItem,
            category,
            pricingModel,
            location,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            sortBy,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await this.serviceService.searchServices(searchParams);
        sendResponse(res, 200, "Services search completed", result);
    });

    getServiceCategories = asyncHandler(async (req, res, next) => {
        console.log('Getting service categories...');
        const categories = await this.serviceService.getServiceCategories();
        console.log('Service categories result:', categories);
        sendResponse(res, 200, "Service categories fetched successfully", categories);
    });

    // =========================
    // SERVICE BOOKING (Future enhancement)
    // =========================

    // This could be expanded to include booking functionality
    // bookService = asyncHandler(async (req, res, next) => {
    //     // Implementation for service booking
    // });
}
