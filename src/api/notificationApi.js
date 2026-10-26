import apiClient, { normalizeApiError } from './apiClient.js'

export const NOTIFICATIONS_ENDPOINT = '/api/v1/notifications'

/**
 * Lấy danh sách thông báo của người dùng
 * GET /api/v1/notifications
 * @param {Object} [params]
 * @param {string} [params.Type]
 * @param {boolean} [params.UnreadOnly]
 * @param {number} [params.Page=1]
 * @param {number} [params.PageSize=20]
 * @returns {Promise<{ items: Array, totalItems: number, page: number, pageSize: number }>}
 */
export async function getNotifications(params = {}) {
  try {
    const response = await apiClient.get(NOTIFICATIONS_ENDPOINT, { params })
    const body = response.data
    const data = body?.data || body?.result || body
    if (data && Array.isArray(data.items)) return data
    if (Array.isArray(data)) return { items: data, totalItems: data.length, page: 1, pageSize: data.length }
    return { items: [], totalItems: 0, page: 1, pageSize: 20 }
  } catch (error) {
    console.warn('[notificationApi] Lỗi lấy danh sách thông báo:', error)
    return { items: [], totalItems: 0, page: 1, pageSize: 20 }
  }
}

/**
 * Xóa toàn bộ thông báo
 * DELETE /api/v1/notifications
 * @returns {Promise<boolean>}
 */
export async function clearAllNotifications() {
  try {
    await apiClient.delete(NOTIFICATIONS_ENDPOINT)
    return true
  } catch (error) {
    console.warn('[notificationApi] Lỗi xóa toàn bộ thông báo:', error)
    return false
  }
}

/**
 * Xóa một thông báo theo ID
 * DELETE /api/v1/notifications/{id}
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteNotification(id) {
  if (!id) return false
  try {
    await apiClient.delete(`${NOTIFICATIONS_ENDPOINT}/${id}`)
    return true
  } catch (error) {
    console.warn(`[notificationApi] Lỗi xóa thông báo ${id}:`, error)
    return false
  }
}

/**
 * Lấy số lượng thông báo chưa đọc
 * GET /api/v1/notifications/unread-count
 * @returns {Promise<number>}
 */
export async function getUnreadNotificationCount() {
  try {
    const response = await apiClient.get(`${NOTIFICATIONS_ENDPOINT}/unread-count`)
    const body = response.data
    const count = body?.data?.count ?? body?.data?.unreadCount ?? body?.data ?? body?.count ?? 0
    return Number(count) || 0
  } catch (error) {
    console.warn('[notificationApi] Lỗi lấy số thông báo chưa đọc:', error)
    return 0
  }
}

/**
 * Đánh dấu 1 thông báo là đã đọc
 * PUT /api/v1/notifications/{id}/read
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function markNotificationAsRead(id) {
  if (!id) return false
  try {
    await apiClient.put(`${NOTIFICATIONS_ENDPOINT}/${id}/read`)
    return true
  } catch (error) {
    console.warn(`[notificationApi] Lỗi đánh dấu đã đọc thông báo ${id}:`, error)
    return false
  }
}

/**
 * Đánh dấu toàn bộ thông báo là đã đọc
 * PUT /api/v1/notifications/read-all
 * @param {string} [type]
 * @returns {Promise<boolean>}
 */
export async function markAllNotificationsAsRead(type) {
  try {
    const params = {}
    if (type) params.type = type
    await apiClient.put(`${NOTIFICATIONS_ENDPOINT}/read-all`, null, { params })
    return true
  } catch (error) {
    console.warn('[notificationApi] Lỗi đánh dấu tất cả đã đọc:', error)
    return false
  }
}

/**
 * Lấy cài đặt nhận thông báo
 * GET /api/v1/notifications/settings
 * @returns {Promise<Object>}
 */
export async function getNotificationSettings() {
  try {
    const response = await apiClient.get(`${NOTIFICATIONS_ENDPOINT}/settings`)
    const body = response.data
    return body?.data || body?.result || body || {}
  } catch (error) {
    console.warn('[notificationApi] Lỗi lấy cài đặt thông báo:', error)
    return {}
  }
}

/**
 * Cập nhật cài đặt nhận thông báo
 * PUT /api/v1/notifications/settings
 * @param {Object} payload
 * @param {string[]} payload.disabledTypes
 * @returns {Promise<Object>}
 */
export async function updateNotificationSettings(payload = {}) {
  try {
    const response = await apiClient.put(`${NOTIFICATIONS_ENDPOINT}/settings`, {
      disabledTypes: Array.isArray(payload.disabledTypes) ? payload.disabledTypes : [],
    })
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[notificationApi] Lỗi cập nhật cài đặt thông báo:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Đăng ký token thiết bị nhận Push Notification
 * POST /api/v1/notifications/devices
 * @param {Object} payload
 * @param {string} payload.token
 * @param {string} [payload.platform='web']
 * @returns {Promise<Object>}
 */
export async function registerDeviceToken(payload) {
  if (!payload || !payload.token) return null
  try {
    const response = await apiClient.post(`${NOTIFICATIONS_ENDPOINT}/devices`, {
      token: String(payload.token).trim(),
      platform: payload.platform || 'web',
    })
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[notificationApi] Lỗi đăng ký token thiết bị:', error)
    return null
  }
}

/**
 * Hủy đăng ký token thiết bị
 * DELETE /api/v1/notifications/devices
 * @param {Object} payload
 * @param {string} payload.token
 * @returns {Promise<boolean>}
 */
export async function unregisterDeviceToken(payload) {
  if (!payload || !payload.token) return false
  try {
    await apiClient.delete(`${NOTIFICATIONS_ENDPOINT}/devices`, {
      data: { token: String(payload.token).trim() },
    })
    return true
  } catch (error) {
    console.warn('[notificationApi] Lỗi hủy token thiết bị:', error)
    return false
  }
}

export default {
  getNotifications,
  clearAllNotifications,
  deleteNotification,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationSettings,
  updateNotificationSettings,
  registerDeviceToken,
  unregisterDeviceToken,
}
