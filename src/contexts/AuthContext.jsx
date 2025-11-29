import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { tokenService } from '../utils/tokenService';
import { getRoleFromToken } from '../utils/authUtils';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = tokenService.getToken();
      if (token) {
        const userRole = getRoleFromToken(token);
        setRole(userRole);
        
        // Mock user data dựa trên token
        if (token.includes('mock')) {
          const mockUsers = {
            'mock-staff-token-nv001': { 
              username: 'nhanvien001', role: 'STAFF', hoTen: 'Nhân viên 1', email: 'nv001@gym.vn' 
            },
            'mock-admin-token-ql001': { 
              username: 'quanly001', role: 'ADMIN', hoTen: 'Quản lý 1', email: 'ql001@gym.vn' 
            },
            'mock-trainer-token-pt001': { 
              username: 'trainer001', role: 'TRAINER', hoTen: 'Huấn luyện viên 1', email: 'pt001@gym.vn' 
            },
            'mock-demo-user-token': { 
              username: 'demo', role: 'USER', hoTen: 'Nguyễn Văn A', email: 'demo@gym.vn', 
              sdt: '0123456789', maKH: 'DEMO01'
            },
            'mock-google-user-token': { 
              username: 'google_user', role: 'USER', hoTen: 'Google User', email: 'user@gmail.com' 
            }
          };
          
          const mockUser = Object.values(mockUsers).find(u => token.includes(u.username) || token.includes('google') || token.includes('demo'));
          if (mockUser) {
            setUser(mockUser);
            try { localStorage.setItem('auth_user', JSON.stringify(mockUser)); } catch (e) {}
          }
        } else {
          try {
            const response = await authService.getProfile();
            if (response.success) {
              setUser(response.user);
              try { localStorage.setItem('auth_user', JSON.stringify(response.user)); } catch (e) {}
            }
          } catch (apiError) {
            console.log('API not available, using token-based user data');
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      tokenService.removeToken();
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    if (response.success) {
      tokenService.setToken(response.token);
      const userRole = getRoleFromToken(response.token);
      setRole(userRole);
      if (response.user) {
        setUser(response.user);
        try { localStorage.setItem('auth_user', JSON.stringify(response.user)); } catch (e) {}
      }
      return { role: userRole };
    }
    throw new Error(response.message || 'Đăng nhập thất bại');
  };

  const loginWithGoogle = async (credential) => {
    const response = await authService.googleLogin({ credential });
    if (response.success) {
      tokenService.setToken(response.token);
      const userRole = getRoleFromToken(response.token);
      setRole(userRole);
      if (response.user) {
        setUser(response.user);
        try { localStorage.setItem('auth_user', JSON.stringify(response.user)); } catch (e) {}
      }
      return { role: userRole };
    }
    throw new Error(response.message || 'Đăng nhập Google thất bại');
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setRole(null);
    try { localStorage.removeItem('auth_user'); } catch (e) {}
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const setMockUser = (userData, token) => {
    tokenService.setToken(token);
    setUser(userData);
    setRole(userData.role);
    try { localStorage.setItem('auth_user', JSON.stringify(userData)); } catch (e) {}
  };

  const value = {
    user,
    role,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUser,
    setMockUser,
    isAuthenticated: !!user && tokenService.hasToken()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
