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
  const body = validateResponse((await apiClient.post('/api/auth/login', { username, password }, { skipAuth: true })).data)
  if (typeof body.data?.token !== 'string' || !body.data.token || typeof body.data?.role !== 'string' || !body.data.role) {
    throw Object.assign(new Error('Phản hồi đăng nhập thiếu token hoặc vai trò.'), { isNormalized: true })
  }
  return body.data
}
// Management-only API: never expose this operation in public registration UI.
export async function registerAdmin(payload) {
  return validateResponse((await apiClient.post('/api/auth/register-admin', registrationPayload(payload))).data)
}
