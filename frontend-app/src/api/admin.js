import axiosInstance from "./axios";

export const adminApi = {
    // Get all vendor applications (with optional status filter)
    getVendorApplications: (status) => axiosInstance.get('/admin/applications', { params: { status } }),

    // Approve vendor application (admin only)
   approveVendorApplication: (id, approvalData) => axiosInstance.put(`/admin/${id}/approve`, approvalData),

 // Reject vendor application (admin only)
    rejectVendorApplication: (id, rejectionData) => axiosInstance.put(`/admin/${id}/reject`, rejectionData),
    
    // Get vendor by ID
    getVendor: (id) => axiosInstance.get(`/admin/${id}`),

}