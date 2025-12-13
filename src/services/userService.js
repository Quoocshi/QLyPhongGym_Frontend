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

export const userService = {
  // ✅ đúng BE: /api/user/home
  getHome: async () => {
    return makeRequest('/api/user/home', { method: 'GET' });
  },

  // ✅ đúng BE: /api/user/lich-tap
  getLichTap: async () => {
    return makeRequest('/api/user/lich-tap', { method: 'GET' });
  },

  // ✅ đúng BE: /api/user/taikhoan
  getTaiKhoan: async () => {
    return makeRequest('/api/user/taikhoan', { method: 'GET' });
  },

  // ✅ đúng BE: PUT /api/user/taikhoan
  updateTaiKhoan: async (updateRequest) => {
    return makeRequest('/api/user/taikhoan', {
      method: 'PUT',
      body: JSON.stringify(updateRequest),
    });
  },

  // 🔥 Tạo lịch tập PT
  createLichTapPT: async (lichTapRequest) => {
    return makeRequest('/api/user/lich-tap/pt', {
      method: 'POST',
      body: JSON.stringify(lichTapRequest),
    });
  },

  // 🔥 Tạo lịch tập Lớp
  createLichTapLop: async (lichTapRequest) => {
    return makeRequest('/api/user/lich-tap/lop', {
      method: 'POST',
      body: JSON.stringify(lichTapRequest),
    });
  },
};
