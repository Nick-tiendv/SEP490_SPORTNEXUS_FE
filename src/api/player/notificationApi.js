import { del, get, getList, pick, put } from '../owner/request.js'

const ENDPOINT = '/api/v1/notifications'

// Chuẩn hóa một thông báo từ backend (swagger chưa mô tả schema nên thử nhiều tên field).
export const toNotification = raw => ({
  id: String(pick(raw, 'id', 'notificationId') ?? ''),
  type: String(pick(raw, 'type', 'notificationType', 'category') || 'system').toLowerCase(),
  title: pick(raw, 'title', 'subject') || 'Thông báo',
  message: pick(raw, 'message', 'content', 'body') || '',
  read: Boolean(pick(raw, 'isRead', 'read')),
  createdAt: pick(raw, 'createdAt', 'sentAt', 'createdDate') || null,
  link: pick(raw, 'link', 'url', 'actionUrl', 'deepLink') || '',
})

// GET /api/v1/notifications?Type&UnreadOnly&Page&PageSize
export async function getNotifications({ type, unreadOnly, page = 1, pageSize = 30 } = {}) {
  const { items, total } = await getList(ENDPOINT, { Type: type, UnreadOnly: unreadOnly, Page: page, PageSize: pageSize })
  return { items: items.map(toNotification), total }
}
// GET /api/v1/notifications/unread-count
export async function getUnreadCount() {
  const data = await get(`${ENDPOINT}/unread-count`)
  return Number(typeof data === 'object' ? pick(data, 'count', 'unreadCount', 'total') : data) || 0
}
export const markNotificationRead = id => put(`${ENDPOINT}/${encodeURIComponent(id)}/read`)
export const markAllNotificationsRead = () => put(`${ENDPOINT}/read-all`)
export const deleteNotification = id => del(`${ENDPOINT}/${encodeURIComponent(id)}`)
export const deleteAllNotifications = () => del(ENDPOINT)
// GET/PUT /api/v1/notifications/settings
export const getNotificationSettings = () => get(`${ENDPOINT}/settings`)
export const updateNotificationSettings = settings => put(`${ENDPOINT}/settings`, settings)
