import axiosInstance from './axios';

export const vendorApi = {
  // Create a new vendor store
  createVendor: (vendorData) => {
    return axiosInstance.post('/vendors', vendorData);
  },

  // Get vendor by ID
  getVendor: (vendorId) => {
    return axiosInstance.get(`/vendors/${vendorId}`);
  },

  // Update vendor information
  updateVendor: (vendorId, vendorData) => {
    return axiosInstance.put(`/vendors/${vendorId}`, vendorData);
  },

  // Delete vendor store
  deleteVendor: (vendorId) => {
    return axiosInstance.delete(`/vendors/${vendorId}`);
  },

  // Get nearby vendors (for customers)
  getNearbyVendors: (params) => {
    const { lng, lat, radius = 3000 } = params;
    return axiosInstance.get('/vendors/nearby', {
      params: { lng, lat, radius }
    });
  },

  // Get current user's vendor (if they own one)
  getMyVendor: () => {
    return axiosInstance.get('/vendors/my');
  },
};