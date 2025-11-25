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

export const paymentService = {
    createMomoPayment: async (maHD) => {
        const response = await api.post(`/momo/pay/${maHD}`);
        return response.data;
    }
};

export const invoiceService = {
    getHoaDon: async (maHD) => {
        const response = await api.get(`/thanh-toan/${maHD}`);
        return response.data;
    }
};

export const dichVuGymService = {
    getDanhSachBoMon: async () => {
        const response = await api.get('/dich-vu-gym/dang-kydv');
        return response.data;
    },
    getDichVuTheoBoMon: async (maBM, thoiHanFilter) => {
        const params = { maBM };
        if (thoiHanFilter) params.thoiHanFilter = thoiHanFilter;
        const response = await api.get('/dich-vu-gym/dich-vu-theo-bo-mon', { params });
        return response.data;
    },
    getChonLop: async (maDV) => {
        const response = await api.get('/dich-vu-gym/chonlop', { params: { maDV } });
        return response.data;
    },
    getChonPT: async (maDV) => {
        const response = await api.get('/dich-vu-gym/chonpt', { params: { maDV } });
        return response.data;
    },
    getDichVuCuaToi: async () => {
        const response = await api.get('/dich-vu-gym/dich-vu-cua-toi');
        return response.data;
    },
    dangKyDichVuUniversal: async (payload) => {
        const response = await api.post('/dich-vu-gym/dang-ky-dv-universal', payload);
        return response.data;
    }
};

export const trainerService = {
    getHome: async () => {
        const response = await api.get('/trainer/home');
        return response.data;
    }
};

// JWT Token helpers
export function parseJwt(token) {
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const payload = parts[1];
        const json = decodeURIComponent(
            Array.prototype.map
                .call(atob(payload.replace(/-/g, '+').replace(/_/g, '/')), (c) => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );
        return JSON.parse(json);
    } catch (e) {
        console.error('Failed to parse JWT:', e);
        return null;
    }
}

export function getRoleFromToken(token) {
    if (!token) return null;
    const payload = parseJwt(token);
    if (!payload) return null;
    
    // Check various role field names that backend might use
    const roleValue = payload.role || payload.roles || payload.loaiNguoiDung || payload.maLoaiNguoiDung || payload.type;
    
    if (!roleValue) return null;
    
    const roleStr = String(roleValue).toLowerCase();
    
    // Check for trainer keywords
    if (roleStr.includes('trainer') || roleStr.includes('pt') || roleStr === '2') {
        return 'trainer';
    }
    // Check for user keywords
    if (roleStr.includes('user') || roleStr.includes('khach') || roleStr === '1') {
        return 'user';
    }
    
    return null;
}

export default api;
