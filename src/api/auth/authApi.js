import apiClient, { normalizeApiError } from '../apiClient.js'

function validateResponse(body) {
  if (!body || !Number.isInteger(body.statusCode) || !('data' in body)) {
    throw Object.assign(new Error('Phản hồi máy chủ không hợp lệ.'), { isNormalized: true })
  }
  if (body.statusCode < 200 || body.statusCode >= 300) {
    throw normalizeApiError({ response: { status: body.statusCode, data: body } })
  }
  return body
}
const registrationPayload = ({ username, password, fullName, phone, email }) => ({ username, password, fullName, phone, email })
export async function registerUser(payload) {
  return validateResponse((await apiClient.post('/api/auth/register', registrationPayload(payload), { skipAuth: true })).data)
}
export async function loginUser({ username, password }) {
  const response = await apiClient.post('/api/auth/login', { username, password }, { skipAuth: true })
  const body = validateResponse(response.data)
  if (response.status !== 200 || body.statusCode !== 200) {
    throw Object.assign(new Error('Phản hồi đăng nhập không hợp lệ.'), { isNormalized: true })
  }
  if (typeof body.data?.token !== 'string' || !body.data.token.trim() || typeof body.data?.role !== 'string' || !body.data.role.trim()) {
    throw Object.assign(new Error('Phản hồi đăng nhập thiếu token hoặc vai trò.'), { isNormalized: true })
  }
  return body.data
}
// Management-only API: never expose this operation in public registration UI.
export async function registerAdmin(payload) {
  return validateResponse((await apiClient.post('/api/auth/register-admin', registrationPayload(payload))).data)
}

// ---------- Quên mật khẩu: forgot-password → nhập OTP → reset-password ----------
// ForgotPasswordRequest: identifier (số điện thoại đã đăng ký). BE gửi mã OTP tới số này.
export async function forgotPassword(identifier) {
  return validateResponse((await apiClient.post('/api/auth/forgot-password', { identifier }, { skipAuth: true })).data)
}
// ResetPasswordRequest: phone, otpCode, newPassword, confirmPassword. BE kiểm tra OTP trong bước này.
export async function resetPassword({ phone, otpCode, newPassword, confirmPassword }) {
  return validateResponse((await apiClient.post('/api/auth/reset-password', { phone, otpCode, newPassword, confirmPassword }, { skipAuth: true })).data)
}
