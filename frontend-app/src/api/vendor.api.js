import axiosInstance from './axios';

export const vendorApi = {
    createVendor: (vendorData) => axiosInstance.post('/vendors/vendors', vendorData),
    getNearbyVendors: (params) => axiosInstance.get('/vendors/vendors/nearby', { params }),
    getVendor: (id) => axiosInstance.get(`/vendors/vendors/${id}`),
    updateVendor: (id, vendorData) => axiosInstance.put(`/vendors/vendors/${id}`, vendorData),
    deleteVendor: (id) => axiosInstance.delete(`/vendors/vendors/${id}`),
};
