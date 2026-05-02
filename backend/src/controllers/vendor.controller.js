import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { VendorService } from "../services/vendor.service.js";
import { saveFilesToGridFS } from "../middlewares/upload.js";
import geocodingService from "../services/geocoding.service.js";

export class VendorController {
  constructor(vendSer = new VendorService()) {
    this.vendorSer = vendSer;
  }

  // =========================
  // USER SIDE
  // =========================

  submitVendorApplication = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    
    console.log('Vendor application submission started');
    console.log('req.files:', req.files);
    console.log('req.body:', req.body);
    
    // If files were uploaded, save them to GridFS
    let legalDocuments = [];
    if (req.files && req.files.length > 0) {
      console.log('Files detected:', req.files.length);
      try {
        const uploadedFiles = await saveFilesToGridFS(req.files);
        legalDocuments = uploadedFiles.map((file, index) => ({
          documentType: 'other', // Use valid enum value
          fileId: file.fileId,
          uploadedAt: new Date(),
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size
        }));
      } catch (error) {
        console.error('Error uploading files:', error);
        return sendResponse(res, 400, "File upload failed", { error: error.message });
      }
    } else {
      console.log('No files uploaded, using fallback');
      // Fallback to empty array if no files uploaded
      legalDocuments = [];
    }
    
    // Process location - prioritize map coordinates, fallback to geocoding
    let location = {
      type: "Point",
      coordinates: [38.7578, 9.0092] // Addis Ababa, Ethiopia coordinates as fallback
    };
    
    let locationDetails = {
      placeName: req.body.storeName || 'Unknown Location',
      fullAddress: req.body.address || 'Unknown Address',
      landmark: null,
      area: null,
      city: 'Unknown',
      state: 'Unknown',
      postalCode: null,
      country: 'Ethiopia'
    };

    // First, try to parse location from frontend map selection
    if (req.body.location) {
      try {
        const parsedLocation = JSON.parse(req.body.location);
        if (parsedLocation.type === "Point" && Array.isArray(parsedLocation.coordinates)) {
          location = parsedLocation;
          console.log('Using map coordinates from frontend:', location);
        }
      } catch (error) {
        console.warn('Failed to parse location from frontend:', error);
      }
    }
    
    // If location details are provided, use them for locationDetails
    if (req.body.placeName || req.body.fullAddress || req.body.city) {
      locationDetails = {
        placeName: req.body.placeName || req.body.storeName || 'Unknown Location',
        fullAddress: req.body.fullAddress || req.body.address || 'Unknown Address',
        landmark: req.body.landmark || null,
        area: req.body.area || null,
        city: req.body.city || 'Unknown',
        state: req.body.state || 'Unknown',
        postalCode: req.body.postalCode || null,
        country: req.body.country || 'Ethiopia'
      };
      
      // If we don't have map coordinates, try geocoding
      if (!req.body.location || location.coordinates[0] === 38.7578) {
        const query = req.body.fullAddress || req.body.placeName || req.body.address;
        if (query && query !== 'Unknown Address') {
          console.log('Geocoding location:', query);
          
          try {
            const geocodeResult = await geocodingService.geocode(query);
            if (geocodeResult.success) {
              location = {
                type: "Point",
                coordinates: geocodeResult.data.coordinates
              };
              locationDetails = { ...locationDetails, ...geocodeResult.data };
              console.log('Geocoded location:', locationDetails);
            } else {
              console.warn('Geocoding failed, using default coordinates:', geocodeResult.message);
            }
          } catch (error) {
            console.warn('Geocoding service error:', error);
          }
        }
      }
    }
    
    const vendorData = {
      ...req.body,
      legalDocuments,
      location,
      locationDetails,
      ownerId: userId
    };
    
    console.log('Final vendor data:', {
      ...vendorData,
      legalDocuments: `${vendorData.legalDocuments.length} documents`
    });
    
    const vendorApplication = await this.vendorSer.submitVendorApplication(userId, vendorData);
    
    sendResponse(res, 201, "Vendor application submitted. Awaiting admin approval.", vendorApplication);
  });

  getMyVendorProfile = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const vendor = await this.vendorSer.getVendorByUserId(userId);

    sendResponse(res, 200, "Vendor profile fetched successfully", vendor);
  });

  getAllMyVendorProfiles = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const vendors = await this.vendorSer.getAllVendorsByUserId(userId);

    sendResponse(res, 200, "All vendor profiles fetched", vendors);
  });

  // =========================
  // PUBLIC (STUDENTS)
  // =========================

  getApprovedVendors = asyncHandler(async (req, res, next) => {
    const vendors = await this.vendorSer.getApprovedVendors();

    sendResponse(res, 200, "Approved vendors fetched", vendors);
  });

  getNearbyVendors = asyncHandler(async (req, res, next) => {
    const { lng, lat, radius = 3000 } = req.query;

    const vendors = await this.vendorSer.getNearbyVendors({
      longitude: Number(lng),
      latitude: Number(lat),
      radius: Number(radius),
    });

    sendResponse(res, 200, "Nearby vendors fetched", vendors);
  });

  searchVendors = asyncHandler(async (req, res, next) => {
    const { 
      lng, 
      lat, 
      radius = 3000, 
      searchItem, 
      category, 
      minPrice, 
      maxPrice,
      sortBy = 'distance',
      page = 1,
      limit = 20
    } = req.query;

    console.log('Searching vendors with params:', {
      lng, lat, radius, searchItem, category, minPrice, maxPrice, sortBy, page, limit
    });

    const result = await this.vendorSer.searchVendors({
      longitude: lng,
      latitude: lat,
      radius: Number(radius),
      searchItem,
      category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy,
      page: Number(page),
      limit: Number(limit)
    });

    sendResponse(res, 200, "Vendors search completed", result);
  });

  getVendor = asyncHandler(async (req, res, next) => {
    console.log('Getting vendor with ID:', req.params.id);
    const vendor = await this.vendorSer.getVendorById(req.params.id);
    console.log('Vendor found:', vendor ? vendor.storeName : 'Not found');

    sendResponse(res, 200, "Vendor fetched", vendor);
  });

  getVendorProducts = asyncHandler(async (req, res, next) => {
    const { id: vendorId } = req.params;
    const { search, category, minPrice, maxPrice, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    console.log('Getting products for vendor:', vendorId);
    console.log('Filters:', { search, category, minPrice, maxPrice, sortBy, sortOrder });
    
    const products = await this.vendorSer.getVendorProductsByVendorId(vendorId, {
        search,
        category,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        sortBy,
        sortOrder
    });
    
    console.log('Products found:', products?.length || 0);

    sendResponse(res, 200, "Vendor products fetched successfully", products);
  });

  
}