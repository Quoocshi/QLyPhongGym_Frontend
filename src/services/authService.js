import api from '../config/apiConfig.js';
import { tokenService } from '../utils/tokenService.js';

export const authService = {
    login: async (credentials) => {
        try {
            console.log('🔄 Đang thử đăng nhập với backend API...');
            const response = await api.post('/api/auth/login', {
                username: credentials.username || credentials.email,
                password: credentials.password
            });
            
            // Backend trả về { message, username, access_token }
            const { access_token, username, message } = response.data;
            
            if (access_token) {
                console.log('✅ Đăng nhập backend API thành công cho user:', username);
                tokenService.setToken(access_token);
                return {
                    success: true,
                    token: access_token,
                    access_token: access_token,
                    username: username,
                    message: message || 'Đăng nhập thành công'
                };
            } else {
                throw new Error(message || 'Đăng nhập thất bại');
            }
        } catch (error) {
            console.warn('⚠️ Đăng nhập backend API thất bại:', error.message);
            throw {
                response: {
                    data: {
                        message: error.response?.data?.message || error.message || 'Đăng nhập thất bại'
                    }
                }
            };
        }
    },

    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', {
                username: userData.username,
                password: userData.password,
                hoTen: userData.name || userData.fullName,
                gioiTinh: userData.gender === 'male' ? 'Nam' : 'Nữ',
                ngaySinh: userData.dob, // Format: DD/MM/YYYY
                email: userData.email,
                soDienThoai: userData.phone,
                diaChi: userData.address
            });
            
            // Backend trả về { message, accessToken }
            const { accessToken, message } = response.data;
            
            if (accessToken) {
                tokenService.setToken(accessToken);
                return {
                    success: true,
                    token: accessToken,
                    message: message || 'Đăng ký thành công'
                };
            } else {
                return {
                    success: true,
                    message: message || 'Đăng ký thành công'
                };
            }
        } catch (error) {
            console.error('Register error:', error);
            throw {
                response: {
                    data: {
                        message: error.response?.data?.message || error.message || 'Đăng ký thất bại'
                    }
                }
            };
        }
    },

    googleLogin: async (googleToken) => {
        try {
            const response = await api.post('/auth/google', { 
                idToken: googleToken
            });
            
            // Backend trả về { message, email, access_token }
            const { access_token, email, message } = response.data;
            
            if (access_token) {
                tokenService.setToken(access_token);
                return {
                    success: true,
                    access_token: access_token,
                    email: email,
                    message: message || 'Đăng nhập Google thành công'
                };
            } else {
                throw new Error(message || 'Đăng nhập Google thất bại');
            }
        } catch (error) {
            console.error('Google login error:', error);
            throw {
                response: {
                    data: {
                        error: error.response?.data?.error || error.message || 'Đăng nhập Google thất bại'
                    }
                }
            };
        }
    },

    logout: async () => {
        try {
            // Gọi API logout nếu cần
            // await api.post('/auth/logout');
            tokenService.removeToken();
            return { success: true, message: 'Đăng xuất thành công' };
        } catch (error) {
            console.error('Logout error:', error);
            tokenService.removeToken(); // Vẫn xóa token local dù API lỗi
            return { success: true, message: 'Đăng xuất thành công' };
        }
    },

    getProfile: async () => {
        try {
            const response = await api.get('/user/profile');
            return response.data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    }
};