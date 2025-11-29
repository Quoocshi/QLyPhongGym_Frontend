import api from '../config/apiConfig.js';

export const invoiceService = {
    getHoaDon: async (maHD) => {
        const response = await api.get(`/thanh-toan/${maHD}`);
        return response.data;
    }
};