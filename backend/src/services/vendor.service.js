import vendorRepository from "../repositories/vendor.repository.js";
import {ApiError }  from "../utils/ApiError.js"

export class VendorService {
    // Dependency injection of the repository for better testability and separation of concerns
    constructor(vendorRepo =  vendorRepository) {
        this.vendorRepo = vendorRepo;
    }
      
    async creatingVendor(userId , data) {
        const existing = await this.vendorRepo.findByOwner(userId);

        if(existing) {
            throw new ApiError(400, "User already own a vendor");
        }

        const vendorData = {
            ...data,
            ownerId: userId
        };

        const vendor = await this.vendorRepo.create(vendorData);
        return vendor;
    }

    async getVendorById(vendorId) {
        const vendor = await this.vendorRepo.findById(vendorId);

        if(!vendor) {
            throw new ApiError(404, "Vendor not founf");
        }
        return vendor;
    }

    async getNearbyVendors({longitude , latitude , radius}) {
        const vendors = await this.vendorRepo.findNearby({ 
            longitude, 
            latitude,
            radius });

        return vendors;
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