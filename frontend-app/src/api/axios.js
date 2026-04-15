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
        
        // Public endpoints that don't need authentication
        const publicEndpoints = ['/products', '/auth/login', '/auth/register', '/vendors/universities', '/vendors/categories'];
        const isPublicEndpoint = publicEndpoints.some(endpoint => 
            config.url === endpoint || config.url?.startsWith(endpoint)
        );
        
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
