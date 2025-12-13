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

export const dangKyDichVuService = {
    // 1. Lấy danh sách bộ môn và thông tin khách hàng
    getDanhSachBoMon: async () => {
        try {
            const responseData = await makeRequest('/api/dich-vu-gym/dang-kydv', {
                method: 'GET'
            });
            return responseData;
        } catch (error) {
            console.error('⚠️ getDanhSachBoMon error:', error.message);
            throw error;
        }
    },

    // 2. Lấy danh sách dịch vụ theo bộ môn
    getDichVuTheoBoMon: async (maBM, thoiHanFilter = null) => {
        try {
            let url = `/api/dich-vu-gym/dich-vu-theo-bo-mon?maBM=${encodeURIComponent(maBM)}`;
            if (thoiHanFilter) {
                url += `&thoiHanFilter=${encodeURIComponent(thoiHanFilter)}`;
            }
            
            const responseData = await makeRequest(url, {
                method: 'GET'
            });
            return responseData;
        } catch (error) {
            console.error('⚠️ getDichVuTheoBoMon error:', error.message);
            throw error;
        }
    },

    // 3. Chọn lớp cho dịch vụ loại "Lớp"
    getChonLop: async (maDV) => {
        try {
            const responseData = await makeRequest(`/api/dich-vu-gym/chonlop?maDV=${encodeURIComponent(maDV)}`, {
                method: 'GET'
            });
            return responseData;
        } catch (error) {
            console.error('⚠️ getChonLop error:', error.message);
            throw error;
        }
    },

    // 4. Chọn PT cho dịch vụ loại "PT"
    getChonPT: async (maDV) => {
        try {
            const responseData = await makeRequest(`/api/dich-vu-gym/chonpt?maDV=${encodeURIComponent(maDV)}`, {
                method: 'GET'
            });
            return responseData;
        } catch (error) {
            console.error('⚠️ getChonPT error:', error.message);
            throw error;
        }
    },

    // 5. Lấy danh sách dịch vụ của tôi
    getDichVuCuaToi: async () => {
        try {
            const responseData = await makeRequest('/api/dich-vu-gym/dich-vu-cua-toi', {
                method: 'GET'
            });
            return responseData;
        } catch (error) {
            console.error('⚠️ getDichVuCuaToi error:', error.message);
            throw error;
        }
    },

    // 6. Đăng ký dịch vụ universal
    dangKyDichVu: async (dangKyData) => {
        try {
            const responseData = await makeRequest('/api/dich-vu-gym/dang-ky-dv-universal', {
                method: 'POST',
                body: JSON.stringify(dangKyData)
            });
            return responseData;
        } catch (error) {
            console.error('⚠️ dangKyDichVu error:', error.message);
            throw error;
        }
    }
};