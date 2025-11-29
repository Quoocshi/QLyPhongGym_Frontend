import api from '../config/apiConfig.js';

export const paymentService = {
    createMomoPayment: async (maHD) => {
        const response = await api.post(`/momo/pay/${maHD}`);
        return response.data;
    }
};