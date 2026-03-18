import axios from './axios';

export const authApi = {
    register: (userData) => axios.post('/auth/register', userData),
    login: (Credentials) => axios.post('/auth/login', Credentials),
    logout: () => axios.get('/auth/logout'),
    getProfile: () => axios.get('/auth/profile'),
};