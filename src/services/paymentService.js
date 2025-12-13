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

  const res = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include',
  });

  let data = {};
  const contentType = res.headers.get('content-type') || '';
  if (res.status === 204) data = null;
  else if (contentType.includes('application/json')) data = await res.json().catch(() => ({}));
  else data = { message: await res.text().catch(() => '') };

  if (!res.ok) {
    const err = new Error(data?.message || data?.error || `HTTP ${res.status}`);
    err.response = { status: res.status, data };
    throw err;
  }

  return data;
};

export const paymentService = {
  momoPay: async (maHD) => {
    // ✅ đúng với BE bạn gửi: /api/momo/pay/{maHD}
    return makeRequest(`/api/momo/pay/${maHD}`, { method: 'POST' });
  },
};
