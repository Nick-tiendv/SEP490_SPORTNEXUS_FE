import apiClient, { normalizeApiError } from './apiClient.js'
import { ENDPOINTS } from './apiConfig.js'

/**
 * Service quản lý Tài khoản, Hồ sơ cá nhân và Môn thể thao người chơi
 * Backend API:
 * - POST /api/auth/login
 * - GET  /api/auth/me
 * - PUT  /api/auth/me
 * - POST /api/auth/me/avatar
 * - POST /api/auth/change-password
 * - POST /api/auth/logout
 * - POST /api/auth/me/phone
 * - POST /api/auth/me/email/send-otp
 * - POST /api/auth/me/email/verify
 * - POST /api/auth/set-password
 * - DELETE /api/auth/me
 * - GET  /api/auth/me/sports
 * - PUT  /api/auth/me/sports
 */

/**
 * Đăng nhập hệ thống
 */
export const loginApi = async (username, password) => {
  const response = await fetch(ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      username: username.trim(),
      password,
    }),
  })

  const result = await response.json().catch(() => null)
  if (!response.ok) {
    const errorMsg =
      result?.message ||
      result?.title ||
      'Tài khoản hoặc mật khẩu không chính xác. Vui lòng thử lại!'
    throw new Error(errorMsg)
  }
  return result
}

/**
 * Lấy thông tin hồ sơ của tài khoản hiện tại
 * GET /api/auth/me
 */
export async function getMyProfile() {
  try {
    const response = await apiClient.get('/api/auth/me')
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[authApi] Lỗi lấy thông tin cá nhân:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Cập nhật thông tin hồ sơ
 * PUT /api/auth/me
 * @param {Object} payload
 * @param {string} payload.fullName
 * @param {string} [payload.avatarUrl]
 */
export async function updateMyProfile(payload) {
  try {
    const response = await apiClient.put('/api/auth/me', {
      fullName: payload.fullName ? String(payload.fullName).trim() : undefined,
      avatarUrl: payload.avatarUrl || undefined,
    })
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[authApi] Lỗi cập nhật hồ sơ:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Tải ảnh đại diện avatar lên
 * POST /api/auth/me/avatar
 * @param {File} file
 */
export async function uploadAvatar(file) {
  if (!file) throw new Error('Vui lòng chọn ảnh đại diện')
  const formData = new FormData()
  formData.append('file', file)
  try {
    const response = await apiClient.post('/api/auth/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[authApi] Lỗi tải lên ảnh đại diện:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Đổi mật khẩu
 * POST /api/auth/change-password
 * @param {Object} payload
 * @param {string} payload.oldPassword
 * @param {string} payload.newPassword
 * @param {string} payload.confirmPassword
 */
export async function changePassword(payload) {
  try {
    const response = await apiClient.post('/api/auth/change-password', payload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[authApi] Lỗi đổi mật khẩu:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Đăng xuất khỏi hệ thống
 * POST /api/auth/logout
 */
export async function logoutApi() {
  try {
    await apiClient.post('/api/auth/logout', {})
  } catch (e) {
    console.warn('[authApi] Logout endpoint notice:', e?.message)
  } finally {
    logout()
  }
}

/**
 * Đăng xuất cục bộ
 */
export const logout = () => {
  try {
    localStorage.removeItem('sportnexus_auth_token')
    localStorage.removeItem('sportnexus_user_role')
    localStorage.removeItem('sportnexus_user_id')
    localStorage.removeItem('sportnexus_user_fullname')
    localStorage.removeItem('sportnexus_current_user')
    sessionStorage.clear()
  } catch (err) {
    console.error('Lỗi khi dọn dẹp phiên:', err)
  }
}

/**
 * Thêm / cập nhật số điện thoại
 * POST /api/auth/me/phone
 * @param {Object} payload
 * @param {string} payload.phone
 * @param {string} [payload.otpCode]
 * @param {string} [payload.firebaseIdToken]
 */
export async function updatePhone(payload) {
  try {
    const response = await apiClient.post('/api/auth/me/phone', payload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[authApi] Lỗi cập nhật số điện thoại:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Gửi mã OTP xác thực email
 * POST /api/auth/me/email/send-otp
 */
export async function sendEmailOtp() {
  try {
    const response = await apiClient.post('/api/auth/me/email/send-otp', {})
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[authApi] Lỗi gửi OTP email:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Xác thực email bằng OTP
 * POST /api/auth/me/email/verify
 * @param {Object} payload
 * @param {string} payload.otpCode
 */
export async function verifyEmail(payload) {
  try {
    const response = await apiClient.post('/api/auth/me/email/verify', {
      otpCode: String(payload.otpCode || '').trim(),
    })
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[authApi] Lỗi xác thực OTP email:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Thiết lập mật khẩu mới (khi đăng nhập qua mạng xã hội chưa có mật khẩu)
 * POST /api/auth/set-password
 * @param {Object} payload
 * @param {string} payload.newPassword
 * @param {string} payload.confirmPassword
 */
export async function setPassword(payload) {
  try {
    const response = await apiClient.post('/api/auth/set-password', payload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[authApi] Lỗi thiết lập mật khẩu:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Xóa tài khoản vĩnh viễn
 * DELETE /api/auth/me
 */
export async function deleteMyAccount() {
  try {
    const response = await apiClient.delete('/api/auth/me')
    logout()
    return response.data
  } catch (error) {
    console.warn('[authApi] Lỗi xóa tài khoản:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Lấy danh sách môn thể thao yêu thích của người dùng
 * GET /api/auth/me/sports
 * @returns {Promise<Array>}
 */
export async function getMySports() {
  try {
    const response = await apiClient.get('/api/auth/me/sports')
    const body = response.data
    const data = body?.data || body?.result || body
    if (Array.isArray(data)) return data
    return []
  } catch (error) {
    console.warn('[authApi] Lỗi lấy môn thể thao từ server:', error)
    return []
  }
}

/**
 * Cập nhật danh sách môn thể thao người chơi chọn (cho Onboarding & Profile)
 * PUT /api/auth/me/sports
 * @param {Array<string|Object>} sports
 * @returns {Promise<Object>}
 */
export async function updateMySports(sports = []) {
  try {
    const payload = Array.isArray(sports) ? sports : []
    const response = await apiClient.put('/api/auth/me/sports', {
      sports: payload,
    })
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[authApi] Lỗi cập nhật môn thể thao:', error)
    throw normalizeApiError(error)
  }
}

export default {
  loginApi,
  logout,
  logoutApi,
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  changePassword,
  updatePhone,
  sendEmailOtp,
  verifyEmail,
  setPassword,
  deleteMyAccount,
  getMySports,
  updateMySports,
}
