import { tokenService } from '../utils/tokenService.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

/**
 * Helper dùng chung cho tất cả request
 */
const makeRequest = async (url, options = {}) => {
  const token = tokenService.getToken();

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || data.message || `HTTP ${response.status}`);
    error.response = {
      status: response.status,
      data,
    };
    throw error;
  }

  return data;
};

/**
 * =========================
 * DỊCH VỤ GYM – USER FLOW
 * =========================
 */
export const dichVuService = {

  /**
   * 1. Lấy thông tin khách hàng + danh sách bộ môn + dịch vụ
   * BE: GET /api/dich-vu-gym/dang-kydv
   */
  getDangKyDichVu: () => {
    return makeRequest('/api/dich-vu-gym/dang-kydv', {
      method: 'GET',
    });
  },

  /**
   * 2. Lấy dịch vụ theo bộ môn
   * BE: GET /api/dich-vu-gym/dich-vu-theo-bo-mon?maBM=...
   */
  getDichVuTheoBoMon: (maBM) => {
    return makeRequest(
      `/api/dich-vu-gym/dich-vu-theo-bo-mon?maBM=${encodeURIComponent(maBM)}`,
      { method: 'GET' }
    );
  },

  /**
   * 3. Chọn lớp cho dịch vụ loại LỚP
   * BE: GET /api/dich-vu-gym/chonlop?maDV=...
   */
  getChonLop: (maDV) => {
    return makeRequest(
      `/api/dich-vu-gym/chonlop?maDV=${encodeURIComponent(maDV)}`,
      { method: 'GET' }
    );
  },

  /**
   * 4. Chọn PT cho dịch vụ loại PT
   * BE: GET /api/dich-vu-gym/chonpt?maDV=...
   */
  getChonPT: (maDV) => {
    return makeRequest(
      `/api/dich-vu-gym/chonpt?maDV=${encodeURIComponent(maDV)}`,
      { method: 'GET' }
    );
  },

  /**
   * 5. Đăng ký dịch vụ (Universal – Tự do / PT / Lớp)
   * BE: POST /api/dich-vu-gym/dang-ky-dv-universal
   *
   * Payload mẫu:
   * {
   *   accountId: 1,
   *   maKH: "KH001",
   *   dsMaDV: ["DV01", "DV02"],
   *   dsTrainerId: ["NV01"],   // optional
   *   dsClassId: ["L01"]       // optional
   * }
   */
  dangKyDichVuUniversal: (payload) => {
    return makeRequest('/api/dich-vu-gym/dang-ky-dv-universal', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * 6. Danh sách dịch vụ đã đăng ký (đã thanh toán)
   * BE: GET /api/dich-vu-gym/dich-vu-cua-toi
   */
  getDichVuCuaToi: () => {
    return makeRequest('/api/dich-vu-gym/dich-vu-cua-toi', {
      method: 'GET',
    });
  },
};
