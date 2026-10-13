// Cấu hình tập trung đường dẫn API
const serverURL = (import.meta.env.VITE_API_BASE_URL || 'https://sep490-sportnexus-be.onrender.com').trim().replace(/\/+$/, '').replace(/\/api$/, '');
export const API_BASE_URL = `${serverURL}/api`;

// Danh sách các endpoints thông dụng
export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
  },
  USERS: `${API_BASE_URL}/users`,
  COURTS: `${API_BASE_URL}/courts`,
  BOOKINGS: `${API_BASE_URL}/bookings`,
  WALLET: `${API_BASE_URL}/wallet`,
};

export default {
  API_BASE_URL,
  ENDPOINTS,
};
