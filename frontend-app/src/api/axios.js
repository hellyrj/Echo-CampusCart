// axios.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json'
    },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        
        // Public endpoints that don't need authentication (GET requests only for products)
        const publicEndpoints = [
            '/products', 
            '/products/search', 
            '/products/popular',
            '/auth/login', 
            '/auth/register', 
            '/vendors/universities', 
            '/vendors/categories',
            '/vendors',
            '/vendors/nearby',
            '/services',
            '/services/search',
            '/services/categories/list'
        ];
        
        // Check if it's exactly a public endpoint AND GET method
        const isPublicEndpoint = publicEndpoints.includes(config.url) && config.method === 'get';
        
        // Add token for authenticated endpoints
        if (token && !isPublicEndpoint) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only logout on 401 for protected endpoints, not for login/register attempts
        if (error.response?.status === 401) {
            const requestUrl = error.config?.url || '';
            const authEndpoints = ['/auth/login', '/auth/register'];
            const isAuthEndpoint = authEndpoints.some(endpoint => 
                requestUrl.includes(endpoint)
            );
            
            // Don't logout if it's a failed login/register attempt
            if (!isAuthEndpoint) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
