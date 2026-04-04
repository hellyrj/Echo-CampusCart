import vendorRepository from "../repositories/vendor.repository.js";
import productRepository from "../repositories/product.repository.js";
import {ApiError}  from "../utils/ApiError.js"

export class VendorService {
    // Dependency injection of repository for better testability and separation of concerns
    constructor(vendorRepo =  vendorRepository) {
        this.vendorRepo = vendorRepo;
    }
      
    // Vendor application submission (for users to become vendors)
    async submitVendorApplication(userId, data) {
        // Check if user already has a pending or approved vendor
        const existingVendor = await this.vendorRepo.findByOwner(userId);
        
        if(existingVendor) {
            throw new ApiError(400, "User already has a vendor application or store");
        }

        const vendorData = {
            ...data,
            ownerId: userId,
            isApproved: false, // New applications start as pending
            approvedBy: null,
            approvedAt: null,
            rejectionReason: null
        };

        const vendor = await this.vendorRepo.create(vendorData);
        return vendor;
    }

    // Get all vendor applications for admin
    async getVendorApplications(status = null) {
        const filter = {};
        if (status === 'pending') {
            filter.isApproved = false;
        } else if (status === 'approved') {
            filter.isApproved = true;
        } else if (status === 'rejected') {
            filter.isApproved = false;
            filter.rejectionReason = { $exists: true };
        }

        const applications = await this.vendorRepo.find(filter);
        return applications;
    }

    // Admin approval of vendor application
    async approveVendorApplication(adminUserId, vendorId) {
        const vendor = await this.vendorRepo.findById(vendorId);

        if(!vendor) {
            throw new ApiError(404, "Vendor application not found");
        }

        if(vendor.isApproved) {
            throw new ApiError(400, "Vendor is already approved");
        }

        // Update user role to vendor
        await this.vendorRepo.updateUserRole(vendor.ownerId, 'vendor');

        const updatedVendor = await this.vendorRepo.update(vendorId, {
            isApproved: true,
            approvedBy: adminUserId,
            approvedAt: new Date(),
            rejectionReason: null
        });

        return updatedVendor;
    }

    // Admin rejection of vendor application
    async rejectVendorApplication(adminUserId, vendorId, rejectionReason) {
        const vendor = await this.vendorRepo.findById(vendorId);

        if(!vendor) {
            throw new ApiError(404, "Vendor application not found");
        }

        if(vendor.isApproved) {
            throw new ApiError(400, "Cannot reject an already approved vendor");
        }

        const updatedVendor = await this.vendorRepo.update(vendorId, {
            isApproved: false,
            approvedBy: null,
            approvedAt: null,
            rejectionReason
        });

        return updatedVendor;
    }

    // Get vendor by user ID (for current vendor to see their own profile)
    async getVendorByUserId(userId) {
        const vendor = await this.vendorRepo.findByOwner(userId);
        
        if(!vendor) {
            throw new ApiError(404, "Vendor profile not found");
        }

        return vendor;
    }

    // Get all vendor profiles for a user (for users with multiple stores)
    async getAllVendorsByUserId(userId) {
        const vendors = await this.vendorRepo.findAllByOwner(userId);
        return vendors;
    }

    // Create vendor profile for users with vendor role but no vendor record
    async createVendorForVendorRole(userId, vendorData) {
        const existing = await this.vendorRepo.findByOwner(userId);
        
        if(existing) {
            throw new ApiError(400, "Vendor profile already exists");
        }

        const vendor = await this.vendorRepo.create(vendorData);
        return vendor;
    }

    // Get vendor's products (for current vendor to see their own products)
    async getVendorProducts(userId) {
        const products = await productRepository.findByVendorId(userId);
        return products;
    }

    // Create product for current vendor
    async createVendorProduct(userId, productData) {
        const vendor = await this.vendorRepo.findByOwner(userId);
        
        if(!vendor || !vendor.isApproved) {
            throw new ApiError(403, "Vendor not approved or not found");
        }

        const product = await productRepository.create({
            ...productData,
            vendorId: userId
        });

        return product;
    }

    // Update vendor's product
    async updateVendorProduct(userId, productId, productData) {
        const vendor = await this.vendorRepo.findByOwner(userId);
        
        if(!vendor || !vendor.isApproved) {
            throw new ApiError(403, "Vendor not approved or not found");
        }

        const product = await productRepository.findById(productId);
        
        if(!product) {
            throw new ApiError(404, "Product not found");
        }

        if(product.vendorId.toString() !== userId) {
            throw new ApiError(403, "Unauthorized to update this product");
        }

        const updatedProduct = await productRepository.update(productId, productData);
        return updatedProduct;
    }

    // Delete vendor's product
    async deleteVendorProduct(userId, productId) {
        const vendor = await this.vendorRepo.findByOwner(userId);
        
        if(!vendor || !vendor.isApproved) {
            throw new ApiError(403, "Vendor not approved or not found");
        }

        const product = await productRepository.findById(productId);
        
        if(!product) {
            throw new ApiError(404, "Product not found");
        }

        if(product.vendorId.toString() !== userId) {
            throw new ApiError(403, "Unauthorized to delete this product");
        }

        await productRepository.delete(productId);
        return { message: "Product deleted successfully" };
    }

    // Get vendor by ID (public)
    async getVendorById(vendorId) {
        const vendor = await this.vendorRepo.findById(vendorId);

        if(!vendor) {
            throw new ApiError(404, "Vendor not found");
        }

        // Only return vendor if approved or if user is the owner
        if(!vendor.isApproved) {
            throw new ApiError(404, "Vendor not found or not yet approved");
        }

        return vendor;
    }

    // Get nearby vendors (only approved vendors)
    async getNearbyVendors({longitude, latitude, radius}) {
        const vendors = await this.vendorRepo.findNearby({ 
            longitude, 
            latitude,
            radius,
            filter: { isApproved: true } // Only return approved vendors
        });

        return vendors;
    }

    // Legacy method for direct vendor creation (admin only)
    async creatingVendor(userId, data) {
        const existing = await this.vendorRepo.findByOwner(userId);

        if(existing) {
            throw new ApiError(400, "User already own a vendor");
        }

        const vendorData = {
            ...data,
            ownerId: userId,
            isApproved: true, // Admin-created vendors are auto-approved
            approvedBy: userId,
            approvedAt: new Date()
        };

        const vendor = await this.vendorRepo.create(vendorData);
        return vendor;
    }

    async updateVendor(userId, vendorId, data){
        const vendor = await this.vendorRepo.findById(vendorId);

        if(!vendor) {
            throw new ApiError(404, "Vendor not found");
        }

        if(vendor.ownerId.toString() !== userId) {
            throw new ApiError(403, "Unauthorized to update this vendor");
        }

        const updatedVendor = await this.vendorRepo.update(vendorId, data);
        return updatedVendor;
    }

    async deleteVendor(userId, vendorId) {
        const vendor = await this.vendorRepo.findById(vendorId);

        if(!vendor) {
            throw new ApiError(404, "Vendor not found");
        }
        
        if(vendor.ownerId.toString() !== userId) {
            throw new ApiError(403, "Unauthorized to delete this vendor");
        }

        await this.vendorRepo.delete(vendorId);
        return { message: "Vendor deleted successfully" };
    }
}