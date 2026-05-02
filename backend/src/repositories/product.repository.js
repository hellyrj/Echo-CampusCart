import BaseRepository from "./base.repository.js";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import Vendor from "../models/vendor.model.js";
import mongoose from "mongoose";

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async search(filters = {}) {
    const { query, category, minPrice, maxPrice, university, sort = 'relevance' } = filters;
    
    // Build search query
    let searchQuery = {};
    
    // Text search
    if (query) {
        searchQuery.$text = { $search: query };
    }
    
    // Category filter
    if (category) {
        searchQuery.categories = category;
    }
    
    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
        searchQuery.basePrice = {};
        if (minPrice !== undefined) {
            searchQuery.basePrice.$gte = parseFloat(minPrice);
        }
        if (maxPrice !== undefined) {
            searchQuery.basePrice.$lte = parseFloat(maxPrice);
        }
    }
    
    // Only available products
    searchQuery.isAvailable = true;
    
    // Build sort options
    let sortOptions = {};
    switch (sort) {
        case 'price-low':
            sortOptions.basePrice = 1;
            break;
        case 'price-high':
            sortOptions.basePrice = -1;
            break;
        case 'newest':
            sortOptions.createdAt = -1;
            break;
        case 'popular':
            sortOptions.purchases = -1;
            break;
        case 'rating':
            sortOptions.averageRating = -1;
            break;
        case 'relevance':
        default:
            if (query) {
                sortOptions.score = { $meta: 'textScore' };
            } else {
                sortOptions.createdAt = -1;
            }
            break;
    }
    
    console.log('Repository search query:', searchQuery);
    console.log('Repository sort options:', sortOptions);
    
    let productQuery = this.model.find(searchQuery);
    
    // Add text score projection if searching
    if (query && sortOptions.score) {
        productQuery = productQuery.select('score');
    }
    
    // Build population with university filter
    let vendorPopulation = {
        path: 'vendorId',
        select: 'storeName isActive universityNear',
        model: 'Vendor'
    };
    
    // Add university filter if specified
    if (university) {
        vendorPopulation.match = { universityNear: university };
    }
    
    return productQuery
        .populate(vendorPopulation)
        .populate({
            path: 'categories',
            model: Category,
            strictPopulate: false
        })
        .sort(sortOptions);
  }

  // Alternative method for university filtering (if population match doesn't work)
  async searchWithUniversityFilter(filters = {}) {
    const { query, category, minPrice, maxPrice, university, sort = 'relevance' } = filters;
    
    // First get vendor IDs for the university
    let vendorMatchQuery = {};
    if (university) {
        vendorMatchQuery.universityNear = university;
    }
    
    const vendors = await mongoose.model('Vendor').find(vendorMatchQuery).select('_id');
    const vendorIds = vendors.map(v => v._id);
    
    // Build search query
    let searchQuery = {
        vendorId: { $in: vendorIds },
        isAvailable: true
    };
    
    // Text search
    if (query) {
        searchQuery.$text = { $search: query };
    }
    
    // Category filter
    if (category) {
        searchQuery.categories = category;
    }
    
    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
        searchQuery.basePrice = {};
        if (minPrice !== undefined) {
            searchQuery.basePrice.$gte = parseFloat(minPrice);
        }
        if (maxPrice !== undefined) {
            searchQuery.basePrice.$lte = parseFloat(maxPrice);
        }
    }
    
    // Build sort options
    let sortOptions = {};
    switch (sort) {
        case 'price-low':
            sortOptions.basePrice = 1;
            break;
        case 'price-high':
            sortOptions.basePrice = -1;
            break;
        case 'newest':
            sortOptions.createdAt = -1;
            break;
        case 'popular':
            sortOptions.purchases = -1;
            break;
        case 'rating':
            sortOptions.averageRating = -1;
            break;
        case 'relevance':
        default:
            if (query) {
                sortOptions.score = { $meta: 'textScore' };
            } else {
                sortOptions.createdAt = -1;
            }
            break;
    }
    
    console.log('Repository search with university filter query:', searchQuery);
    console.log('Repository sort options:', sortOptions);
    
    let productQuery = this.model.find(searchQuery);
    
    // Add text score projection if searching
    if (query && sortOptions.score) {
        productQuery = productQuery.select('score');
    }
    
    return productQuery
        .populate({
            path: 'vendorId',
            select: 'storeName isActive universityNear',
            model: 'Vendor'
        })
        .populate({
            path: 'categories',
            model: Category,
            strictPopulate: false
        })
        .sort(sortOptions);
  }

  async getPopular(limit = 20) {
    return this.model
      .find({ isAvailable: true })
      .populate({
        path: 'vendorId',
        select: 'isActive',
        model: 'Vendor',
        match: { isActive: true } // Only include products from active vendors
      })
      .sort({ purchases: -1, views: -1 })
      .limit(limit);
  }

  async findByVendorId(vendorId) {
    console.log('Repository: Finding products for vendorId:', vendorId);
    const products = await this.model.find({ vendorId });
    console.log('Repository: Found products:', products?.length || 0);
    return products;
  }

  async findByVendor(vendorId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    
    const query = { vendorId };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    return this.model
      .find(query)
      .populate({ path: 'categories', model: Category, strictPopulate: false })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async incrementViews(productId) {
    return this.model.findByIdAndUpdate(
      productId,
      { $inc: { views: 1 } },
      { new: true }
    );
  }

  async incrementPurchases(productId) {
    return this.model.findByIdAndUpdate(
      productId,
      { $inc: { purchases: 1 } },
      { new: true }
    );
  }

  async findById(id, options = {}) {
    console.log('Repository: Finding product by ID:', id);
    
    const defaultOptions = {
      populate: [
        { path: 'categories', model: Category, strictPopulate: false },
        { 
          path: 'vendorId', 
          select: 'storeName deliveryAvailable pickupAvailable _id isActive universityNear',
          model: Vendor
        }
      ]
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    console.log('Repository: Population options:', mergedOptions.populate);
    
    const product = await this.model.findById(id).populate(mergedOptions.populate);
    console.log('Repository: Found product vendorId:', product?.vendorId);
    
    return product;
  }

  async updateRating(productId, newRating) {
    const product = await this.model.findById(productId);
    if (!product) return null;
    
    const newAverageRating = (product.averageRating * product.reviewCount + newRating) / (product.reviewCount + 1);
    
    return this.model.findByIdAndUpdate(
      productId,
      {
        $set: { averageRating: newAverageRating },
        $inc: { reviewCount: 1 }
      },
      { new: true }
    );
  }
}

export default new ProductRepository();