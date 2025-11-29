import axios from 'axios';
import { tokenService } from '../utils/tokenService.js';

// Backend Spring Boot URL - khớp với backend thực tế
// You can override this in .env.local file: VITE_API_URL=your_backend_url  
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

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
        const token = tokenService.getToken();
        // Debug: log baseURL, url and whether token exists
        try {
            // full request target (will be proxied by Vite if baseURL='/api')
            const target = (config.baseURL || '') + (config.url || '');
            // eslint-disable-next-line no-console
            console.log('[api] request ->', config.method?.toUpperCase(), target, token ? '(token attached)' : '(no token)');
        } catch (e) {
            // ignore logging errors
        }
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;