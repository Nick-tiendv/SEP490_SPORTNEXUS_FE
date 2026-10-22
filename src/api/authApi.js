import { ENDPOINTS } from './apiConfig';

/**
 * Gọi API đăng nhập hệ thống SportNexus
 * @param {string} username - Tên đăng nhập (hoặc email / số điện thoại)
 * @param {string} password - Mật khẩu
 * @returns {Promise<Object>} Response trả về từ backend
 */
export const loginApi = async (username, password) => {
  const response = await fetch(ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      username: username.trim(),
      password: password,
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      result?.message ||
      result?.title ||
      'Tài khoản hoặc mật khẩu không chính xác. Vui lòng thử lại!';
    throw new Error(errorMsg);
  }

  return result;
};

/**
 * Đăng xuất và dọn dẹp sạch token cùng toàn bộ thông tin phiên làm việc
 */
export const logout = () => {
  try {
    localStorage.removeItem('sportnexus_auth_token');
    localStorage.removeItem('sportnexus_user_role');
    localStorage.removeItem('sportnexus_user_id');
    localStorage.removeItem('sportnexus_user_fullname');
    localStorage.removeItem('sportnexus_current_user');
  } catch (err) {
    console.error('Lỗi khi dọn dẹp localStorage:', err);
  }
};

export default {
  loginApi,
  logout,
};
