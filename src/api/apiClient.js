import axios from 'axios'

let tokenReader = () => null
let unauthorizedHandler = () => {}
let mockSessionReader = () => false
export function configureAuthentication(readToken, onUnauthorized, readMockSession = () => false) {
  tokenReader = readToken
  unauthorizedHandler = onUnauthorized
  mockSessionReader = readMockSession
  return () => { tokenReader = () => null; unauthorizedHandler = () => {}; mockSessionReader = () => false }
}

export function normalizeApiError(error) {
  if (error?.isNormalized) return error
  const status = error?.response?.status || 0
  const body = error?.response?.data
  const fallbacks = {
    400: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
    401: 'Thông tin đăng nhập không hợp lệ hoặc phiên đã hết hạn.',
    403: 'Bạn không có quyền thực hiện thao tác này.',
    404: 'Không tìm thấy API yêu cầu.',
    409: 'Tên đăng nhập hoặc email đã tồn tại.',
  }

  let message = null
  // 503 mang thông báo nghiệp vụ từ BE (vd: "Chức năng nạp tiền tạm thời chưa sẵn sàng") nên giữ nguyên văn
  if (typeof body?.message === 'string' && body.message.length <= 300 && (status < 500 || status === 503)) {
    message = body.message
  } else if (body?.errors && typeof body.errors === 'object') {
    const errorList = Object.entries(body.errors)
      .map(([key, errs]) => `${key}: ${Array.isArray(errs) ? errs.join(', ') : errs}`)
      .join(' | ')
    if (errorList) {
      message = `${body.title || 'Lỗi dữ liệu'}: ${errorList}`
    }
  } else if (typeof body?.title === 'string' && body.title.length <= 300) {
    message = body.title
  }

  if (!message) {
    message =
      error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT'
        ? 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.'
        : status >= 500
        ? 'Máy chủ gặp lỗi. Vui lòng thử lại sau.'
        : fallbacks[status] || 'Không thể kết nối đến máy chủ. Vui lòng thử lại.'
  }

  return Object.assign(new Error(message), {
    status,
    isNormalized: true,
    data: body,
    errors: body?.errors,
  })
}

// Chỉ ghi log API khi chạy dev, và không in body của các request chứa mật khẩu / token.
const LOG_API = import.meta.env?.DEV === true
const SENSITIVE_URL = /\/auth\/(login|register|register-admin|change-password|reset-password|set-password|refresh-token|google|facebook)/i
const safeBody = (url, data) => (SENSITIVE_URL.test(url || '') ? '[ẩn dữ liệu nhạy cảm]' : data)

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || 'https://sep490-sportnexus-be.onrender.com'
const normalizedBaseURL = rawBaseURL.replace(/\/api\/?$/, '')

const apiClient = axios.create({
  baseURL: normalizedBaseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})
apiClient.interceptors.request.use(config => {
  if (!config.skipAuth && mockSessionReader()) {
    config.headers.delete('Authorization')
    throw Object.assign(new Error('DEV MODE: Phiên mock chỉ dùng để xem giao diện. API được bảo vệ cần đăng nhập bằng JWT thật.'), { isNormalized: true, code: 'MOCK_AUTH_BLOCKED' })
  }
  if (!config.baseURL) throw Object.assign(new Error('Chưa cấu hình địa chỉ API.'), { isNormalized: true })
  const token = config.skipAuth ? null : tokenReader()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  else config.headers.delete('Authorization')

  if (LOG_API) console.log(`%c[API Request] ${config.method?.toUpperCase()} ${config.url}`, 'color: #0284C7; font-weight: bold;', safeBody(config.url, config.data || config.params || ''))
  return config
})
apiClient.interceptors.response.use(response => {
  if (LOG_API) console.log(`%c[API Response ${response.status}] ${response.config.url}`, 'color: #16A34A; font-weight: bold;', safeBody(response.config.url, response.data))
  return response
}, error => {
  if (LOG_API) console.error(`%c[API Error ${error.response?.status || 'Network'}] ${error.config?.url}`, 'color: #DC2626; font-weight: bold;', error.response?.data || error.message)
  if (error.response?.status === 401 && !error.config?.skipAuth) unauthorizedHandler()
  return Promise.reject(normalizeApiError(error))
})
export default apiClient
