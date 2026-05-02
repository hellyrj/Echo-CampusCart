import axiosInstance from './axios';

export const serviceApi = {
    // =========================
    // VENDOR ENDPOINTS
    // =========================

    // Create a new service
    createService: async (serviceData) => {
        const formData = new FormData();
        
        // Append all service data
        Object.keys(serviceData).forEach(key => {
            if (key === 'images' && Array.isArray(serviceData[key])) {
                serviceData[key].forEach(file => {
                    formData.append('images', file);
                });
            } else if (key === 'tags' && Array.isArray(serviceData[key])) {
                formData.append(key, serviceData[key].join(','));
            } else if (key === 'availability' && typeof serviceData[key] === 'object') {
                formData.append(key, JSON.stringify(serviceData[key]));
            } else if (serviceData[key] !== undefined && serviceData[key] !== null) {
                formData.append(key, serviceData[key]);
            }
        });

        const response = await axiosInstance.post('/services', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get all services for the logged-in vendor
    getMyServices: async (params = {}) => {
        const response = await axiosInstance.get('/services/my-services', { params });
        return response.data;
    },

    // Update a service
    updateService: async (serviceId, serviceData) => {
        const formData = new FormData();
        
        // Append all service data
        Object.keys(serviceData).forEach(key => {
            if (key === 'images' && Array.isArray(serviceData[key])) {
                serviceData[key].forEach(file => {
                    formData.append('images', file);
                });
            } else if (key === 'tags' && Array.isArray(serviceData[key])) {
                formData.append(key, serviceData[key].join(','));
            } else if (key === 'availability' && typeof serviceData[key] === 'object') {
                formData.append(key, JSON.stringify(serviceData[key]));
            } else if (serviceData[key] !== undefined && serviceData[key] !== null) {
                formData.append(key, serviceData[key]);
            }
        });

        const response = await axiosInstance.put(`/services/${serviceId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Delete a service
    deleteService: async (serviceId) => {
        const response = await axiosInstance.delete(`/services/${serviceId}`);
        return response.data;
    },

    // =========================
    // PUBLIC ENDPOINTS
    // =========================

    // Get all services with filtering
    getAllServices: async (params = {}) => {
        const response = await axiosInstance.get('/services', { params });
        return response.data;
    },

    // Get service by ID
    getService: async (serviceId) => {
        const response = await axiosInstance.get(`/services/${serviceId}`);
        return response.data;
    },

    // Get services by vendor ID
    getVendorServices: async (vendorId, params = {}) => {
        const response = await axiosInstance.get(`/services/vendor/${vendorId}`, { params });
        return response.data;
    },

    // Search services with location and filters
    searchServices: async (searchParams = {}) => {
        const response = await axiosInstance.get('/services/search', { params: searchParams });
        return response.data;
    },

    // Get service categories
    getServiceCategories: async () => {
        const response = await axiosInstance.get('/services/categories/list');
        return response.data;
    }
};

export default serviceApi;
