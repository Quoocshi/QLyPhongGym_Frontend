import { tokenService } from '../utils/tokenService.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

const makeRequest = async (url, options = {}) => {
    const token = tokenService.getToken();
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
    
    const response = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'include',
    });

    const responseData = await response.json().catch(() => ({}));
    
    if (!response.ok) {
        const error = new Error(responseData.message || `HTTP ${response.status}`);
        error.response = {
            status: response.status,
            statusText: response.statusText,
            data: responseData
        };
        throw error;
    }

    return responseData;
};

export const trainerService = {
    getHome: async () => {
        const responseData = await makeRequest('/trainer/home', {
            method: 'GET'
        });
        return responseData;
    }
};