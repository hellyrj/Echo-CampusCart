import { ApiError } from "../utils/ApiError.js";
import University from "../models/university.model.js";
import Vendor from "../models/vendor.model.js";

export class AdminService {
    constructor() {
        // Initialize repositories if needed
    }

    // Get all vendor applications with optional status filter
    async getVendorApplications(status = null) {
        try {
            const query = {};
            if (status) {
                query.isApproved = status === 'approved' ? true : status === 'rejected' ? false : null;
            }
            
            const applications = await Vendor.find(query)
                .populate('userId', 'name email')
                .sort({ createdAt: -1 });
            
            return applications;
        } catch (error) {
            throw new ApiError(500, "Failed to fetch vendor applications", error);
        }
    }

    // Approve vendor application
    async approveVendorApplication(adminUserId, vendorId) {
        try {
            const vendor = await Vendor.findByIdAndUpdate(
                vendorId,
                {
                    isApproved: true,
                    approvedBy: adminUserId,
                    approvedAt: new Date(),
                    rejectionReason: null
                },
                { new: true }
            );
            
            if (!vendor) {
                throw new ApiError(404, "Vendor application not found");
            }
            
            return vendor;
        } catch (error) {
            throw new ApiError(500, "Failed to approve vendor application", error);
        }
    }

    // Reject vendor application
    async rejectVendorApplication(adminUserId, vendorId, rejectionReason) {
        try {
            const vendor = await Vendor.findByIdAndUpdate(
                vendorId,
                {
                    isApproved: false,
                    approvedBy: adminUserId,
                    approvedAt: new Date(),
                    rejectionReason: rejectionReason
                },
                { new: true }
            );
            
            if (!vendor) {
                throw new ApiError(404, "Vendor application not found");
            }
            
            return vendor;
        } catch (error) {
            throw new ApiError(500, "Failed to reject vendor application", error);
        }
    }

    // Get all universities for admin
    async getUniversities() {
        try {
            const universities = await University.find({}).sort({ name: 1 });
            return universities;
        } catch (error) {
            throw new ApiError(500, "Failed to fetch universities", error);
        }
    }

    // Create new university
    async createUniversity(universityData) {
        try {
            const university = await University.create(universityData);
            return university;
        } catch (error) {
            throw new ApiError(500, "Failed to create university", error);
        }
    }

    // Update university
    async updateUniversity(universityId, universityData) {
        try {
            const university = await University.findByIdAndUpdate(
                universityId,
                universityData,
                { new: true }
            );
            
            if (!university) {
                throw new ApiError(404, "University not found");
            }
            
            return university;
        } catch (error) {
            throw new ApiError(500, "Failed to update university", error);
        }
    }

    // Delete university
    async deleteUniversity(universityId) {
        try {
            const result = await University.findByIdAndDelete(universityId);
            
            if (!result) {
                throw new ApiError(404, "University not found");
            }
            
            return { message: "University deleted successfully" };
        } catch (error) {
            throw new ApiError(500, "Failed to delete university", error);
        }
    }
}
