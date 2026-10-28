import apiClient from '../apiClient.js'
import { del, get, getList, pick, post, put, unwrap } from '../owner/request.js'

const ENDPOINT = '/api/v1/notifications'

// Chuẩn hóa một thông báo từ backend (swagger chưa mô tả schema nên thử nhiều tên field).
export const toNotification = raw => ({
  id: String(pick(raw, 'id', 'notificationId') ?? ''),
  type: String(pick(raw, 'type', 'notificationType', 'category') || 'system').toLowerCase(),
  title: pick(raw, 'title', 'subject') || 'Thông báo',
  message: pick(raw, 'body', 'message') || '',
  read: Boolean(pick(raw, 'isRead', 'read')),
  createdAt: pick(raw, 'createdAt', 'sentAt', 'createdDate') || null,
  referenceType: String(pick(raw, 'referenceType') || '').toUpperCase(),
  referenceId: pick(raw, 'referenceId') || '',
})

// GET /api/v1/notifications?Type&UnreadOnly&Page&PageSize
export async function getNotifications({ type, unreadOnly, page = 1, pageSize = 30 } = {}) {
  const { items, total } = await getList(ENDPOINT, { Type: type, UnreadOnly: unreadOnly, Page: page, PageSize: pageSize })
  return { items: items.map(toNotification), total }
}
// GET /api/v1/notifications/unread-count
export async function getUnreadCount() {
  const data = await get(`${ENDPOINT}/unread-count`)
  return Number(typeof data === 'object' ? pick(data, 'total') : data) || 0
}
export const markNotificationRead = id => put(`${ENDPOINT}/${encodeURIComponent(id)}/read`)
export const markAllNotificationsRead = () => put(`${ENDPOINT}/read-all`)
export const deleteNotification = id => del(`${ENDPOINT}/${encodeURIComponent(id)}`)
// BE chỉ xóa các thông báo đã đọc
export const deleteReadNotifications = () => del(ENDPOINT)
// GET/PUT /api/v1/notifications/settings
export const getNotificationSettings = () => get(`${ENDPOINT}/settings`)
export const updateNotificationSettings = settings => put(`${ENDPOINT}/settings`, settings)

// ---------- Thiết bị nhận thông báo đẩy: /api/v1/notifications/devices ----------
// RegisterDeviceRequest: token (FCM), platform (web | android | ios)
export const registerDeviceToken = ({ token, platform = 'web' }) => post(`${ENDPOINT}/devices`, { token, platform })
export const unregisterDeviceToken = async ({ token }) => unwrap((await apiClient.delete(`${ENDPOINT}/devices`, { data: { token } })).data)
