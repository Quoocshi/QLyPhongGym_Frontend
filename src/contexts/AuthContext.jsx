// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { tokenService } from '../utils/tokenService.js';
import { getRoleFromToken } from '../utils/authUtils.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const STORAGE_KEY = 'auth_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // {accountId, username, hoTen, email?, khachHang?}
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveUser = (u) => {
    try {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  };

  const readStoredUser = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  };

  const normalizeFromHome = (home) => {
    if (!home) return null;
    return {
      accountId: home.accountId ?? null,
      username: home.username ?? null,
      hoTen: home.hoTen ?? '',
      email: home.email ?? '',
    };
  };

  const normalizeFromProfile = (profile) => {
    // BE /api/user/taikhoan trả { accountId, username, khachHang: {...} }
    if (!profile) return null;
    return {
      accountId: profile.accountId ?? null,
      username: profile.username ?? null,
      hoTen: profile?.khachHang?.hoTen ?? '',
      email: profile?.khachHang?.email ?? '',
      khachHang: profile.khachHang ?? null,
    };
  };

  const checkAuth = async () => {
    setLoading(true);
    try {
      const token = tokenService.getToken();
      if (!token) {
        setUser(null);
        setRole(null);
        saveUser(null);
        return;
      }

      setRole(getRoleFromToken(token));

      // ưu tiên profile
      try {
        const profile = await authService.getProfile();
        const u = normalizeFromProfile(profile);
        setUser(u);
        saveUser(u);
        return;
      } catch (_) {
        // fallback home
      }

      try {
        const home = await authService.getHome();
        const u = normalizeFromHome(home);
        setUser(u);
        saveUser(u);
        return;
      } catch (_) {
        // fallback localStorage
      }

      const stored = readStoredUser();
      if (stored) setUser(stored);
      else setUser({ accountId: null, username: null, hoTen: '', email: '' });
    } catch (_) {
      tokenService.removeToken();
      setUser(null);
      setRole(null);
      saveUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (!res?.success) throw new Error(res?.message || 'Đăng nhập thất bại');

    const token = res.token || res.access_token;
    if (token) tokenService.setToken(token);

    const userRole = getRoleFromToken(token);
    setRole(userRole);

    // res.user đã có accountId (do authService.login gọi /api/user/home)
    const u = res.user || { accountId: null, username: res.username ?? null, hoTen: '', email: '' };
    setUser(u);
    saveUser(u);

    return { role: userRole, user: u };
  };

  const loginWithGoogle = async (credential) => {
    const res = await authService.googleLogin(credential);
    if (!res?.success) throw new Error(res?.message || 'Đăng nhập Google thất bại');

    const token = res.token || res.access_token;
    if (token) tokenService.setToken(token);

    const userRole = getRoleFromToken(token);
    setRole(userRole);

    const u = res.user || { accountId: null, username: res.email ?? null, hoTen: '', email: res.email ?? '' };
    setUser(u);
    saveUser(u);

    return { role: userRole, user: u };
  };

  const register = async (userData) => {
    const res = await authService.register(userData);

    // ✅ BE: accessToken
    const token = res?.token || res?.accessToken || res?.access_token;
    if (token) {
      tokenService.setToken(token);
      setRole(getRoleFromToken(token));

      // nếu authService.register có user/home thì set luôn
      if (res.user) {
        setUser(res.user);
        saveUser(res.user);
      } else {
        // fallback gọi checkAuth để lấy profile/home
        await checkAuth();
      }
    }

    return res;
  };

  const logout = () => {
    authService.logout();
    tokenService.removeToken();
    setUser(null);
    setRole(null);
    saveUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...(updatedData || {}) };
      saveUser(next);
      return next;
    });
  };

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      login,
      loginWithGoogle,
      register,
      logout,
      updateUser,
      isAuthenticated: !!user && !!tokenService.getToken(),
    }),
    [user, role, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
