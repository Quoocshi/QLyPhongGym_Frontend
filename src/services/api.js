import axios from 'axios';

// Change this to your actual Laravel Backend URL
// You can override this in .env.local file: VITE_API_URL=your_backend_url
// Using '/api' will use Vite proxy to avoid CORS issues
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // Important for Laravel Sanctum/Session
});

// Add a request interceptor to attach the token if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (credentials) => {
        // Backend expects: { username, password }
        const response = await api.post('/auth/login', {
            username: credentials.username || credentials.email, // Support both
            password: credentials.password
        });
        return response.data;
    },
    register: async (userData) => {
        // Backend expects Vietnamese field names
        const response = await api.post('/auth/register', {
            username: userData.username,
            password: userData.password,
            hoTen: userData.name || userData.fullName,
            gioiTinh: userData.gender,
            ngaySinh: userData.dob, // Format: DD/MM/YYYY
            email: userData.email,
            soDienThoai: userData.phone,
            diaChi: userData.address
        });
        return response.data;
    },
    googleLogin: async (googleToken) => {
        // Send Google ID Token to Laravel backend for verification
        const response = await api.post('/auth/google', { 
            token: googleToken,
            provider: 'google'
        });
        return response.data;
    },
    logout: async () => {
        await api.post('/logout');
        localStorage.removeItem('auth_token');
    },
    getProfile: async () => {
        const response = await api.get('/user');
        return response.data;
    }
};

export default api;
