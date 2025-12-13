// src/services/authService.js
import { tokenService } from '../utils/tokenService.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

const makeRequest = async (url, options = {}) => {
  const token = tokenService.getToken();

  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  const hasBody = options.body !== undefined && options.body !== null;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (hasBody && !isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) headers.Authorization = `Bearer ${token}`;

  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include',
  });

  let responseData = {};
  const contentType = response.headers.get('content-type') || '';

  if (response.status === 204) {
    responseData = null;
  } else if (contentType.includes('application/json')) {
    responseData = await response.json().catch(() => ({}));
  } else {
    const text = await response.text().catch(() => '');
    responseData = text ? { message: text } : {};
  }

  if (!response.ok) {
    const message = responseData?.message || responseData?.error || `HTTP ${response.status}`;
    const error = new Error(message);
    error.response = {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
    };
    throw error;
  }

  return responseData;
};

// ✅ helper: lấy home info sau khi đã có token
const fetchHomeInfo = async () => {
  // đúng BE: /api/user/home
  return makeRequest('/api/user/home', { method: 'GET' });
};

export async function login(credentials) {
  try {
    const responseData = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: credentials.username || credentials.email,
        password: credentials.password,
      }),
    });

    const { access_token, username, message } = responseData;

    if (!access_token) throw new Error(message || 'Đăng nhập thất bại');

    // ✅ set token trước để gọi /api/user/home
    tokenService.setToken(access_token);

    let home = null;
    try {
      home = await fetchHomeInfo();
    } catch (_) {
      // nếu home fail vẫn cho login thành công, nhưng thiếu accountId
    }

    return {
      success: true,
      access_token,
      token: access_token,
      username: home?.username || username || null,
      user: {
        accountId: home?.accountId ?? null,
        username: home?.username || username || null,
        hoTen: home?.hoTen || '',
      },
      message: message || 'Đăng nhập thành công',
    };
  } catch (error) {
    // chuẩn hóa lỗi giống axios-style để bạn dùng err.response?.data?.message
    throw {
      response: {
        status: error?.response?.status,
        data: {
          message: error?.response?.data?.message || error?.message || 'Đăng nhập thất bại',
        },
      },
      message: error?.message,
    };
  }
}

export async function register(userData) {
  try {
    const responseData = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: userData.username,
        password: userData.password,
        hoTen: userData.hoTen,
        gioiTinh: userData.gioiTinh,
        ngaySinh: userData.ngaySinh,
        email: userData.email,
        soDienThoai: userData.soDienThoai,
        diaChi: userData.diaChi,
      }),
    });

    // ✅ BE trả accessToken
    const token = responseData?.accessToken || responseData?.access_token || responseData?.token || null;

    if (token) {
      tokenService.setToken(token);

      // optional: lấy home cho đủ accountId
      let home = null;
      try {
        home = await fetchHomeInfo();
      } catch (_) {}

      return {
        success: true,
        access_token: token,
        token,
        user: home
          ? { accountId: home.accountId ?? null, username: home.username ?? null, hoTen: home.hoTen ?? '' }
          : null,
        message: responseData?.message || 'Đăng ký thành công',
      };
    }

    return {
      success: true,
      message: responseData?.message || 'Đăng ký thành công',
    };
  } catch (error) {
    throw {
      response: {
        status: error?.response?.status,
        data: {
          message: error?.response?.data?.message || error?.message || 'Đăng ký thất bại',
        },
      },
      message: error?.message,
    };
  }
}

export async function googleLogin(idToken) {
  try {
    const responseData = await makeRequest('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    const token = responseData?.access_token || null;

    if (!token) throw new Error(responseData?.message || 'Đăng nhập Google thất bại');

    tokenService.setToken(token);

    let home = null;
    try {
      home = await fetchHomeInfo();
    } catch (_) {}

    return {
      success: true,
      access_token: token,
      token,
      email: responseData?.email || null,
      user: home
        ? { accountId: home.accountId ?? null, username: home.username ?? responseData?.email ?? null, hoTen: home.hoTen ?? '' }
        : { accountId: null, username: responseData?.email ?? null, hoTen: '' },
      message: responseData?.message || 'Đăng nhập Google thành công',
    };
  } catch (error) {
    throw {
      response: {
        status: error?.response?.status,
        data: {
          error: error?.response?.data?.error || error?.message || 'Đăng nhập Google thất bại',
        },
      },
      message: error?.message,
    };
  }
}

export async function logout() {
  // BE bạn không có endpoint logout => chỉ cần remove token
  tokenService.removeToken();
  return { success: true, message: 'Đăng xuất thành công' };
}

// ✅ đúng BE: /api/user/taikhoan (profile chi tiết)
export async function getProfile() {
  return makeRequest('/api/user/taikhoan', { method: 'GET' });
}

// ✅ tiện cho AuthContext gọi thẳng nếu cần
export async function getHome() {
  return makeRequest('/api/user/home', { method: 'GET' });
}

export const authService = {
  login,
  register,
  googleLogin,
  logout,
  getProfile,
  getHome,
};
