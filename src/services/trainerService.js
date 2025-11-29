import api from '../config/apiConfig.js';

export const trainerService = {
    getHome: async () => {
        const response = await api.get('/trainer/home');
        return response.data;
    }
};