import vendorRepository from "../repositories/vendor.repository.js";
import productRepository from "../repositories/product.repository.js";
import { ApiError } from "../utils/ApiError.js";

export class VendorService {

     constructor(vendorRepo = vendorRepository, productRepo = productRepository) {
           this.vendorRepo = vendorRepo;
           this.productRepo = productRepo;
         }

  async createVendor(userId, data) {
    const existing = await this.vendorRepo.findByOwner(userId);

    if (existing) {
      throw new ApiError(400, "User already owns a vendor");
    }

    return this.vendorRepo.create({
      ...data,
      ownerId: userId,
      isApproved: false
    });
  }

  async submitVendorApplication(userId, data) {

  const existing = await this.vendorRepo.findByOwner(userId);

  if (existing) {
    // Allow resubmission if the existing application was rejected
    if (existing.status === 'rejected') {
      console.log(`User ${userId} is resubmitting after rejection. Deleting previous rejected application.`);
      
      // Delete the rejected application to allow fresh submission
      await this.vendorRepo.deleteById(existing._id);
      
      // Continue with new application creation
    } else {
      // Block if they have pending or approved application
      throw new ApiError(400, `You already have a ${existing.status} vendor application`);
    }
  }

  return this.vendorRepo.create({
    ...data,
    ownerId: userId,
    isApproved: false,
    status: 'pending' // Ensure new application starts as pending
  });

}

  async getVendorByUserId(userId) {
    const vendor = await this.vendorRepo.findByOwner(userId);

    if (!vendor) throw new ApiError(404, "Vendor not found");

    return vendor;
  }

  async getVendorById(vendorId) {
    const vendor = await this.vendorRepo.findById(vendorId);

    if (!vendor) throw new ApiError(404, "Vendor not found");

    return vendor;
  }

  async getVendorProducts(userId) {

  const vendor = await this.vendorRepo.findByOwner(userId);

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  if (!vendor.isApproved) {
    throw new ApiError(403, "Vendor not approved yet");
  }

  return this.productRepo.findByVendorId(vendor._id);
}

async getVendorProductsByVendorId(vendorId, filters = {}) {
  console.log('Service: Getting products for vendor:', vendorId);
  console.log('Service: Filters applied:', filters);
  
  const vendor = await this.vendorRepo.findById(vendorId);

  if (!vendor) {
    console.log('Service: Vendor not found:', vendorId);
    throw new ApiError(404, "Vendor not found");
  }

  if (!vendor.isApproved) {
    console.log('Service: Vendor not approved:', vendorId);
    throw new ApiError(403, "Vendor not approved yet");
  }

  console.log('Service: Finding products for vendor:', vendorId);
  
  // Build query based on filters
  let query = { vendorId };
  
  // Add search filter - search in both name and description
  if (filters.search && filters.search.trim()) {
    const searchRegex = { $regex: filters.search.trim(), $options: 'i' };
    query.$or = [
      { name: searchRegex },
      { description: searchRegex }
    ];
  }
  
  // Add category filter
  if (filters.category) {
    query.categories = filters.category;
  }
  
  // Add price range filters
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.basePrice = {};
    if (filters.minPrice !== undefined) {
      query.basePrice.$gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      query.basePrice.$lte = filters.maxPrice;
    }
  }
  
  // Build sort options
  let sortOptions = {};
  if (filters.sortBy) {
    const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
    sortOptions[filters.sortBy] = sortOrder;
  } else {
    sortOptions = { name: 1 }; // Default sort by name ascending
  }
  
  console.log('Service: Query:', JSON.stringify(query, null, 2));
  console.log('Service: Sort options:', sortOptions);
  
  const products = await this.productRepo.model
    .find(query)
    .sort(sortOptions)
    .populate({
      path: 'categories',
      model: 'Category',
      strictPopulate: false
    });
  
  console.log('Service: Products found:', products?.length || 0);
  
  return products;
}

  async getApprovedVendors() {
    return this.vendorRepo.findApproved();
  }

  async getNearbyVendors(params) {
    return this.vendorRepo.findNearbyApproved(params);
  }

  async approveVendor(adminId, vendorId) {
    const vendor = await this.vendorRepo.findById(vendorId);
    if (!vendor) throw new ApiError(404, "Vendor not found");

    return this.vendorRepo.approveVendor(vendorId, adminId);
  }

  async rejectVendor(vendorId, reason) {
    const vendor = await this.vendorRepo.findById(vendorId);
    if (!vendor) throw new ApiError(404, "Vendor not found");

    if (!reason) throw new ApiError(400, "Rejection reason required");

    return this.vendorRepo.rejectVendor(vendorId, reason);
  }

  async getVendorApplications(status) {

  if (status === "pending") {
    return this.vendorRepository.findPending();
  }

  if (status === "approved") {
    return this.vendorRepository.findApproved();
  }

  return this.vendorRepository.find(); // all
}

async approveVendorApplication(adminId, vendorId) {

  const vendor = await this.vendorRepository.findById(vendorId);

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  if (vendor.isApproved) {
    throw new ApiError(400, "Vendor already approved");
  }

  return this.vendorRepository.approveVendor(vendorId, adminId);
}

async rejectVendorApplication(adminId, vendorId, reason) {

  const vendor = await this.vendorRepository.findById(vendorId);

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  if (!reason) {
    throw new ApiError(400, "Rejection reason required");
  }

  return this.vendorRepository.rejectVendor(vendorId, reason);
}

}

