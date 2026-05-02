import BaseRepository from "./base.repository.js";
import Vendor from "../models/vendor.model.js";

class VendorRepository extends BaseRepository {
  constructor() {
    super(Vendor);
  }

  async findByOwner(ownerId) {
    return this.model.findOne({ ownerId });
  }

  async findAll() {
    return this.model.find({}).populate('ownerId', 'name email');
  }

  async findApproved() {
    return this.model.find({ status: 'approved', isActive: true }).populate('ownerId', 'name email');
  }

  async findPending() {
    return this.model.find({ status: 'pending' }).populate('ownerId', 'name email');
  }

  async findRejected() {
    return this.model.find({ status: 'rejected' }).populate('ownerId', 'name email');
  }

  async approveVendor(vendorId, adminId) {
    return this.model.findByIdAndUpdate(
      vendorId,
      {
        status: 'approved',
        isApproved: true,
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectionReason: null
      },
      { returnDocument: 'after' }
    );
  }

  async rejectVendor(vendorId, reason) {
    return this.model.findByIdAndUpdate(
      vendorId,
      {
        status: 'rejected',
        isApproved: false,
        rejectionReason: reason
      },
      { returnDocument: 'after' }
    );
  }

  async findNearbyApproved({ longitude, latitude, radius }) {
    return this.model.find({
      isApproved: true,
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius
        }
      }
    });
  }

  async searchVendorsWithItems({ searchItem, category, minPrice, maxPrice, sortBy = 'name', page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;
    
    // Build product filter
    let productFilter = {};
    if (searchItem && searchItem.trim()) {
      const searchRegex = { $regex: searchItem.trim(), $options: 'i' };
      productFilter.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }
    
    if (category) {
      productFilter.categories = category;
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      productFilter.basePrice = {};
      if (minPrice !== undefined) {
        productFilter.basePrice.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        productFilter.basePrice.$lte = maxPrice;
      }
    }

    // Find vendors that have products matching the filter
    const vendors = await this.model.aggregate([
      {
        $match: {
          isApproved: true,
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'vendorId',
          as: 'products'
        }
      },
      {
        $match: {
          'products': { $exists: true, $ne: [] },
          ...(Object.keys(productFilter).length > 0 && {
            'products': { $elemMatch: productFilter }
          })
        }
      },
      {
        $addFields: {
          avgProductPrice: { $avg: '$products.basePrice' },
          productCount: { $size: '$products' },
          matchingProducts: {
            $filter: {
              input: '$products',
              as: 'product',
              cond: Object.keys(productFilter).length === 0 ? true : {
                $and: Object.keys(productFilter).map(key => {
                  if (key === '$or') {
                    return {
                      $or: productFilter[key].map(orCondition => ({
                        $regexMatch: {
                          input: { $toString: `$$product.${orCondition.field || key}` },
                          regex: orCondition.$regex,
                          options: orCondition.$options
                        }
                      }))
                    };
                  } else {
                    return { [key]: productFilter[key] };
                  }
                })
              }
            }
          }
        }
      },
      {
        $addFields: {
          matchingProductCount: { $size: '$matchingProducts' }
        }
      },
      {
        $sort: this.getSortOptions(sortBy)
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $project: {
          storeName: 1,
          description: 1,
          locationDetails: 1,
          location: 1,
          phone: 1,
          logo: 1,
          rating: 1,
          deliveryAvailable: 1,
          pickupAvailable: 1,
          deliveryFee: 1,
          deliveryRadius: 1,
          universityNear: 1,
          avgProductPrice: 1,
          productCount: 1,
          matchingProductCount: 1,
          matchingProducts: {
            $map: {
              input: { $slice: ['$matchingProducts', 3] }, // Show first 3 matching products
              as: 'product',
              in: {
                _id: '$$product._id',
                name: '$$product.name',
                basePrice: '$$product.basePrice',
                images: '$$product.images',
                categories: '$$product.categories'
              }
            }
          }
        }
      }
    ]);

    // Get total count for pagination
    const totalCount = await this.model.aggregate([
      {
        $match: {
          isApproved: true,
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'vendorId',
          as: 'products'
        }
      },
      {
        $match: {
          'products': { $exists: true, $ne: [] },
          ...(Object.keys(productFilter).length > 0 && {
            'products': { $elemMatch: productFilter }
          })
        }
      },
      {
        $count: 'total'
      }
    ]);

    return {
      vendors,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.total || 0,
        pages: Math.ceil((totalCount[0]?.total || 0) / limit)
      }
    };
  }

  async searchNearbyVendorsWithItems({ longitude, latitude, radius, searchItem, category, minPrice, maxPrice, sortBy = 'distance', page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;
    
    // Build product filter
    let productFilter = {};
    if (searchItem && searchItem.trim()) {
      const searchRegex = { $regex: searchItem.trim(), $options: 'i' };
      productFilter.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }
    
    if (category) {
      productFilter.categories = category;
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      productFilter.basePrice = {};
      if (minPrice !== undefined) {
        productFilter.basePrice.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        productFilter.basePrice.$lte = maxPrice;
      }
    }

    // Find nearby vendors with products matching the filter
    const vendors = await this.model.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          distanceField: "distance",
          maxDistance: radius,
          spherical: true
        }
      },
      {
        $match: {
          isApproved: true,
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'vendorId',
          as: 'products'
        }
      },
      {
        $match: {
          'products': { $exists: true, $ne: [] },
          ...(Object.keys(productFilter).length > 0 && {
            'products': { $elemMatch: productFilter }
          })
        }
      },
      {
        $addFields: {
          avgProductPrice: { $avg: '$products.basePrice' },
          productCount: { $size: '$products' },
          matchingProducts: {
            $filter: {
              input: '$products',
              as: 'product',
              cond: Object.keys(productFilter).length === 0 ? true : {
                $and: Object.keys(productFilter).map(key => {
                  if (key === '$or') {
                    return {
                      $or: productFilter[key].map(orCondition => ({
                        $regexMatch: {
                          input: { $toString: `$$product.${orCondition.field || key}` },
                          regex: orCondition.$regex,
                          options: orCondition.$options
                        }
                      }))
                    };
                  } else {
                    return { [key]: productFilter[key] };
                  }
                })
              }
            }
          }
        }
      },
      {
        $addFields: {
          matchingProductCount: { $size: '$matchingProducts' }
        }
      },
      {
        $sort: this.getSortOptions(sortBy)
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $project: {
          storeName: 1,
          description: 1,
          locationDetails: 1,
          location: 1,
          phone: 1,
          logo: 1,
          rating: 1,
          deliveryAvailable: 1,
          pickupAvailable: 1,
          deliveryFee: 1,
          deliveryRadius: 1,
          universityNear: 1,
          distance: 1,
          avgProductPrice: 1,
          productCount: 1,
          matchingProductCount: 1,
          matchingProducts: {
            $map: {
              input: { $slice: ['$matchingProducts', 3] }, // Show first 3 matching products
              as: 'product',
              in: {
                _id: '$$product._id',
                name: '$$product.name',
                basePrice: '$$product.basePrice',
                images: '$$product.images',
                categories: '$$product.categories'
              }
            }
          }
        }
      }
    ]);

    // Get total count for pagination
    const totalCount = await this.model.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          distanceField: "distance",
          maxDistance: radius,
          spherical: true
        }
      },
      {
        $match: {
          isApproved: true,
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'vendorId',
          as: 'products'
        }
      },
      {
        $match: {
          'products': { $exists: true, $ne: [] },
          ...(Object.keys(productFilter).length > 0 && {
            'products': { $elemMatch: productFilter }
          })
        }
      },
      {
        $count: 'total'
      }
    ]);

    return {
      vendors,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.total || 0,
        pages: Math.ceil((totalCount[0]?.total || 0) / limit)
      }
    };
  }

  getSortOptions(sortBy) {
    switch (sortBy) {
      case 'distance':
        return { distance: 1 };
      case 'rating':
        return { rating: -1 };
      case 'price_low':
        return { avgProductPrice: 1 };
      case 'price_high':
        return { avgProductPrice: -1 };
      case 'products':
        return { matchingProductCount: -1 };
      case 'name':
      default:
        return { storeName: 1 };
    }
  }

  async deleteById(vendorId) {
    return this.model.findByIdAndDelete(vendorId);
  }
}

export default new VendorRepository();