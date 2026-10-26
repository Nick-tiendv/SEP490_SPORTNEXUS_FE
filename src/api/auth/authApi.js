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
// RegisterRequest: username, password, fullName, phone, email (+ role, otpCode khi có: Player | Owner, mã OTP xác thực SĐT)
const registrationPayload = ({ username, password, fullName, phone, email, role, otpCode, sports }) => ({
  username, password, fullName, phone, email,
  ...(role ? { role } : {}),
  ...(otpCode ? { otpCode } : {}),
  ...(Array.isArray(sports) && sports.length ? { sports } : {}),
})
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

// POST /api/auth/refresh-token: đổi refreshToken lấy token mới (LoginResponse: token, refreshToken, role...)
export async function refreshAccessToken(refreshToken) {
  const body = validateResponse((await apiClient.post('/api/auth/refresh-token', { refreshToken }, { skipAuth: true })).data)
  if (typeof body.data?.token !== 'string' || !body.data.token) throw Object.assign(new Error('Không làm mới được phiên đăng nhập.'), { isNormalized: true })
  return body.data
}

// GET /api/v1/master-data/sports (công khai): danh mục môn cho form đăng ký
export async function getPublicSports() {
  const body = (await apiClient.get('/api/v1/master-data/sports', { skipAuth: true })).data
  const list = body?.data?.items ?? body?.data ?? body
  return (Array.isArray(list) ? list : []).map((sport) => ({ id: String(sport.id), name: sport.name || '' }))
}

// ---------- OTP số điện thoại: POST /api/auth/send-otp, /api/auth/verify-otp (type: REGISTER | FORGOT_PASSWORD) ----------
// send-otp trả { phone, type, expiresInSeconds, devOtp } (devOtp chỉ có ở môi trường dev của BE)
export async function sendOtp(phone, type = 'REGISTER') {
  return validateResponse((await apiClient.post('/api/auth/send-otp', { phone, type }, { skipAuth: true })).data).data
}
export async function verifyOtp({ phone, otpCode, type = 'REGISTER' }) {
  return validateResponse((await apiClient.post('/api/auth/verify-otp', { phone, otpCode, type }, { skipAuth: true })).data)
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
