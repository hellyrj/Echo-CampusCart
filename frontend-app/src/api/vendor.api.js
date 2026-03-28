import axiosInstance from './axios';

export const vendorApi = {
    // Vendor application
    submitVendorApplication: (applicationData) => axiosInstance.post('/vendors/apply', applicationData),
    
    // Get vendor applications (admin only)
    getVendorApplications: (status) => axiosInstance.get('/vendors/applications', { params: { status } }),
    
    // Approve vendor application (admin only)
    approveVendorApplication: (id, approvalData) => axiosInstance.put(`/vendors/applications/${id}/approve`, approvalData),
    
    // Reject vendor application (admin only)
    rejectVendorApplication: (id, rejectionData) => axiosInstance.put(`/vendors/applications/${id}/reject`, rejectionData),
    
    // Get vendor by ID
    getVendor: (id) => axiosInstance.get(`/vendors/${id}`),
    
    // Get nearby vendors (public)
    getNearbyVendors: (params) => axiosInstance.get('/vendors/nearby', { params }),
    
    // Update vendor (vendor owner only)
    updateVendor: (id, vendorData) => axiosInstance.put(`/vendors/${id}`, vendorData),
    
    // Delete vendor (vendor owner only)
    deleteVendor: (id) => axiosInstance.delete(`/vendors/${id}`),
};
