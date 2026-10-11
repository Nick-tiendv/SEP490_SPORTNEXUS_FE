import axios from 'axios'

let tokenReader = () => null
let unauthorizedHandler = () => {}
export function configureAuthentication(readToken, onUnauthorized) {
  tokenReader = readToken
  unauthorizedHandler = onUnauthorized
  return () => { tokenReader = () => null; unauthorizedHandler = () => {} }
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
  const message = typeof body?.message === 'string' && body.message.length <= 300 && status < 500
    ? body.message
    : error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT'
      ? 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.'
      : status >= 500 ? 'Máy chủ gặp lỗi. Vui lòng thử lại sau.'
        : fallbacks[status] || 'Không thể kết nối đến máy chủ. Vui lòng thử lại.'
  return Object.assign(new Error(message), { status, isNormalized: true })
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})
apiClient.interceptors.request.use(config => {
  if (!config.baseURL) throw Object.assign(new Error('Chưa cấu hình địa chỉ API.'), { isNormalized: true })
  const token = config.skipAuth ? null : tokenReader()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  else config.headers.delete('Authorization')
  return config
})
apiClient.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !error.config?.skipAuth) unauthorizedHandler()
  return Promise.reject(normalizeApiError(error))
})
export default apiClient
