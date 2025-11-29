import api from '../config/apiConfig.js';

// dichVuService now uses the shared `api` axios instance from `src/config/apiConfig.js`
export const dichVuService = {
    getDanhSachDichVu: async () => {
        try {
            const response = await api.get('/api/public/dich-vu/danh-sach');
            return response.data;
        } catch (error) {
            console.warn('⚠️ getDanhSachDichVu failed, falling back to caller handling:', error.message);
            throw error;
        }
    },

    getDichVuDetail: async (maDV) => {
        try {
            const response = await api.get(`/api/public/dich-vu/${maDV}`);
            return response.data;
        } catch (error) {
            console.warn('⚠️ getDichVuDetail failed:', error.message);
            throw error;
        }
    },

    getDichVuByLoai: async (loaiDV) => {
        try {
            const response = await api.get(`/public/dich-vu/loai/${loaiDV}`);
            return response.data;
        } catch (error) {
            console.error('⚠️ getDichVuByLoai error:', error.message);
            throw error;
        }
    },

    searchDichVu: async (keyword) => {
        try {
            const response = await api.get('/public/dich-vu/tim-kiem', { params: { keyword } });
            return response.data;
        } catch (error) {
            console.error('⚠️ searchDichVu error:', error.message);
            throw error;
        }
    },

    dangKyDichVu: async (payload) => {
        try {
            // `api` already attaches Authorization header from tokenService if present
            const response = await api.post('/dich-vu-gym/dang-ky-dv-universal', payload, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            return response.data;
        } catch (error) {
            console.warn('⚠️ dangKyDichVu error:', error.message);
            throw error;
        }
    }
};