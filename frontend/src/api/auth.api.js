import axios from './axios';

export const authApi = {
    register: (userData) => axios.post('/auth/register', userData),
    login: (Credential) => axios.post('/auth/login', Credential),
    logout: () => axios.get('/auth/logout'),
    getProfile: () => axios.get('/auth/profile'),
};