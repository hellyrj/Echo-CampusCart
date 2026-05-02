import Service from "../models/service.model.js";
import Vendor from "../models/vendor.model.js";

export class ServiceService {
    // =========================
    // VENDOR OPERATIONS
    // =========================

    async createService(serviceData) {
        try {
            // Verify vendor exists and is approved
            const vendor = await Vendor.findById(serviceData.vendorId);
            if (!vendor) {
                throw new Error("Vendor not found");
            }
            if (vendor.status !== 'approved') {
                throw new Error("Vendor is not approved");
            }
            if (vendor.vendorType === 'products') {
                throw new Error("Product vendors cannot create services");
            }

            const service = new Service(serviceData);
            await service.save();
            
            // Populate vendor details for response
            await service.populate('vendorId', 'storeName universityNear location rating');
            
            return service;
        } catch (error) {
            throw new Error(`Failed to create service: ${error.message}`);
        }
    }

    async getVendorServices(vendorId, options = {}) {
        try {
            const { page = 1, limit = 20, status, category } = options;
            const skip = (page - 1) * limit;

            let query = { vendorId };
            
            if (status === 'active') {
                query.isActive = true;
            } else if (status === 'inactive') {
                query.isActive = false;
            }
            
            if (category) {
                query.serviceCategory = category;
            }

            const services = await Service.find(query)
                .populate('vendorId', 'storeName universityNear location rating')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Service.countDocuments(query);

            return {
                services,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to get vendor services: ${error.message}`);
        }
    }

    async updateService(serviceId, updateData) {
        try {
            const service = await Service.findByIdAndUpdate(
                serviceId,
                updateData,
                { new: true, runValidators: true }
            ).populate('vendorId', 'storeName universityNear location rating');

            if (!service) {
                throw new Error("Service not found");
            }

            return service;
        } catch (error) {
            throw new Error(`Failed to update service: ${error.message}`);
        }
    }

    async deleteService(serviceId) {
        try {
            const service = await Service.findByIdAndDelete(serviceId);
            if (!service) {
                throw new Error("Service not found");
            }
            return service;
        } catch (error) {
            throw new Error(`Failed to delete service: ${error.message}`);
        }
    }

    // =========================
    // PUBLIC OPERATIONS
    // =========================

    async getAllServices(filters = {}, options = {}) {
        try {
            const {
                category,
                pricingModel,
                location,
                minPrice,
                maxPrice,
                search,
                vendorId
            } = filters;

            const {
                page = 1,
                limit = 20,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = options;

            const skip = (page - 1) * limit;
            
            // Build query
            let query = { isActive: true };

            if (category) {
                query.serviceCategory = category;
            }

            if (pricingModel) {
                query.pricingModel = pricingModel;
            }

            if (location) {
                query.serviceLocation = location;
            }

            if (vendorId) {
                query.vendorId = vendorId;
            }

            if (minPrice !== undefined || maxPrice !== undefined) {
                query.basePrice = {};
                if (minPrice !== undefined) {
                    query.basePrice.$gte = minPrice;
                }
                if (maxPrice !== undefined) {
                    query.basePrice.$lte = maxPrice;
                }
            }

            if (search) {
                query.$text = { $search: search };
            }

            // Build sort object
            let sort = {};
            if (sortBy === 'price') {
                sort.basePrice = sortOrder === 'asc' ? 1 : -1;
            } else if (sortBy === 'rating') {
                sort.averageRating = sortOrder === 'asc' ? 1 : -1;
            } else if (sortBy === 'popularity') {
                sort.completedCount = sortOrder === 'asc' ? 1 : -1;
            } else {
                sort.createdAt = sortOrder === 'asc' ? 1 : -1;
            }

            const services = await Service.find(query)
                .populate('vendorId', 'storeName universityNear location rating')
                .sort(sort)
                .skip(skip)
                .limit(limit);

            const total = await Service.countDocuments(query);

            return {
                services,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to get services: ${error.message}`);
        }
    }

    async getServiceById(serviceId) {
        try {
            const service = await Service.findById(serviceId)
                .populate('vendorId', 'storeName universityNear location rating phone');

            if (!service) {
                return null;
            }

            if (!service.isActive) {
                return null;
            }

            return service;
        } catch (error) {
            throw new Error(`Failed to get service: ${error.message}`);
        }
    }

    async searchServices(searchParams) {
        try {
            const {
                longitude,
                latitude,
                radius,
                searchItem,
                category,
                pricingModel,
                location,
                minPrice,
                maxPrice,
                sortBy = 'distance',
                page = 1,
                limit = 20
            } = searchParams;

            const skip = (page - 1) * limit;

            // Build base query
            let query = { isActive: true };

            if (category) {
                query.serviceCategory = category;
            }

            if (pricingModel) {
                query.pricingModel = pricingModel;
            }

            if (location) {
                query.serviceLocation = location;
            }

            if (minPrice !== undefined || maxPrice !== undefined) {
                query.basePrice = {};
                if (minPrice !== undefined) {
                    query.basePrice.$gte = minPrice;
                }
                if (maxPrice !== undefined) {
                    query.basePrice.$lte = maxPrice;
                }
            }

            if (searchItem) {
                query.$text = { $search: searchItem };
            }

            // Start with the base query
            let servicesQuery = Service.find(query);

            // Add geospatial search if coordinates are provided
            if (longitude && latitude) {
                // First get vendors within radius
                const vendors = await Vendor.find({
                    location: {
                        $near: {
                            $geometry: {
                                type: "Point",
                                coordinates: [parseFloat(longitude), parseFloat(latitude)]
                            },
                            $maxDistance: parseFloat(radius)
                        }
                    },
                    status: 'approved',
                    vendorType: { $in: ['services', 'both'] }
                }).select('_id');

                const vendorIds = vendors.map(vendor => vendor._id);
                query.vendorId = { $in: vendorIds };
            } else {
                // If no location, just filter by vendor type
                const serviceVendors = await Vendor.find({
                    status: 'approved',
                    vendorType: { $in: ['services', 'both'] }
                }).select('_id');

                const vendorIds = serviceVendors.map(vendor => vendor._id);
                query.vendorId = { $in: vendorIds };
            }

            // Apply sorting
            let sort = {};
            if (sortBy === 'distance' && longitude && latitude) {
                // For distance sorting, we'd need to use aggregation pipeline
                // For now, fallback to rating
                sort.averageRating = -1;
            } else if (sortBy === 'price') {
                sort.basePrice = 1;
            } else if (sortBy === 'rating') {
                sort.averageRating = -1;
            } else {
                sort.createdAt = -1;
            }

            const services = await Service.find(query)
                .populate('vendorId', 'storeName universityNear location rating')
                .sort(sort)
                .skip(skip)
                .limit(limit);

            const total = await Service.countDocuments(query);

            return {
                services,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                },
                searchParams
            };
        } catch (error) {
            throw new Error(`Failed to search services: ${error.message}`);
        }
    }

    async getServiceCategories() {
        try {
            // Get categories from the schema enum
            const schema = Service.schema;
            const categoryPath = schema.path('serviceCategory');
            
            if (!categoryPath || !categoryPath.enumValues) {
                // Fallback to hardcoded categories if schema isn't loaded
                const fallbackCategories = [
                    'tutoring', 'consulting', 'repair', 'design', 'writing',
                    'photography', 'event', 'fitness', 'beauty', 'technology',
                    'language', 'transport', 'cleaning', 'other'
                ];
                
                return fallbackCategories.map(category => ({
                    value: category,
                    label: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')
                }));
            }
            
            const categories = categoryPath.enumValues;
            return categories.map(category => ({
                value: category,
                label: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')
            }));
        } catch (error) {
            console.error('Error getting service categories:', error);
            // Return fallback categories on error
            const fallbackCategories = [
                'tutoring', 'consulting', 'repair', 'design', 'writing',
                'photography', 'event', 'fitness', 'beauty', 'technology',
                'language', 'transport', 'cleaning', 'other'
            ];
            
            return fallbackCategories.map(category => ({
                value: category,
                label: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')
            }));
        }
    }

    // =========================
    // UTILITY METHODS
    // =========================

    async getServiceStats(vendorId) {
        try {
            const stats = await Service.aggregate([
                { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
                {
                    $group: {
                        _id: null,
                        totalServices: { $sum: 1 },
                        activeServices: { $sum: { $cond: ['$isActive', 1, 0] } },
                        averageRating: { $avg: '$averageRating' },
                        totalReviews: { $sum: '$reviewCount' },
                        totalCompletions: { $sum: '$completedCount' }
                    }
                }
            ]);

            return stats[0] || {
                totalServices: 0,
                activeServices: 0,
                averageRating: 0,
                totalReviews: 0,
                totalCompletions: 0
            };
        } catch (error) {
            throw new Error(`Failed to get service stats: ${error.message}`);
        }
    }
}
