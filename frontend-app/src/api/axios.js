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
        const publicEndpoints = ['/products', '/auth/login', '/auth/register', '/universities', '/categories', '/vendors'];
        const isPublicEndpoint = publicEndpoints.some(endpoint => 
            config.url?.includes(endpoint)
        );
        
        // Add token for authenticated endpoints
        if (token && !isPublicEndpoint) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`Adding token to ${config.method?.toUpperCase()} ${config.url}`);
        } else if (isPublicEndpoint) {
            console.log(`Skipping token for public endpoint: ${config.url}`);
        } else if (!token) {
            console.log(`No token available for ${config.url}`);
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
                console.log('401 Unauthorized - would normally logout user, but keeping for debugging');
                console.log('Request URL:', requestUrl);
                console.log('Error:', error.response?.data);
                
                // Temporarily comment out auto-logout for debugging
                // localStorage.removeItem('token');
                // window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
