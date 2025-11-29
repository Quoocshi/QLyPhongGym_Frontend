import api from '../config/apiConfig.js';

export const userService = {
    getHome: async () => {
        const response = await api.get('/user/home');
        return response.data;
    },
    getLichTap: async () => {
        const response = await api.get('/user/lich-tap');
        return response.data;
    },
    getTaiKhoan: async () => {
        const response = await api.get('/user/taikhoan');
        return response.data;
    },
    updateTaiKhoan: async (updateRequest) => {
        const response = await api.put('/user/taikhoan', updateRequest);
        return response.data;
    }
};