import apiClient from '../apiClient.js'
import { toList, unwrap } from './dashboardApi.js'

const clean = params => Object.fromEntries(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''))
const path = value => encodeURIComponent(value)
const toNumber = value => (value === undefined || value === null || value === '' || !Number.isFinite(Number(value)) ? 0 : Number(value))
const asArray = value => (Array.isArray(value) ? value : [])

// BroadcastResponse (docs 41).
export function toBroadcast(raw) {
  return {
    id: String(raw?.id ?? ''),
    title: raw?.title || '',
    body: raw?.body || '',
    target: String(raw?.target ?? '').toUpperCase(),
    targetUserCount: toNumber(raw?.targetUserCount),
    referenceType: raw?.referenceType || '',
    referenceId: raw?.referenceId ? String(raw.referenceId) : '',
    status: String(raw?.status ?? '').toUpperCase(),
    scheduledAt: raw?.scheduledAt || null,
    sentAt: raw?.sentAt || null,
    recalledAt: raw?.recalledAt || null,
    recipientCount: toNumber(raw?.recipientCount),
    readCount: toNumber(raw?.readCount),
    readRate: toNumber(raw?.readRate),
    createdByName: raw?.createdByName || '—',
    createdAt: raw?.createdAt || null,
  }
}

// ---------- GET /api/v1/admin/notifications/broadcasts?status&page&pageSize ----------
export async function listBroadcasts(params) {
  const { items, total, totalPages } = toList(unwrap((await apiClient.get('/api/v1/admin/notifications/broadcasts', { params: clean(params) })).data))
  return { items: items.map(toBroadcast), total, totalPages }
}
export async function getBroadcast(id) {
  return toBroadcast(unwrap((await apiClient.get(`/api/v1/admin/notifications/broadcasts/${path(id)}`)).data))
}

// CreateBroadcastRequest: title, body, target (ALL | PLAYER | OWNER | USERS), userIds, referenceType, referenceId, scheduledAt.
// Trả kèm message của BE ("Đã gửi thông báo tới N người." / "Đã hẹn gửi thông báo lúc ...").
export async function createBroadcast({ title, body, target, userIds, referenceType, referenceId, scheduledAt }) {
  const response = (await apiClient.post('/api/v1/admin/notifications/broadcast', {
    title,
    body,
    target,
    userIds: target === 'USERS' ? userIds : null,
    referenceType: referenceType || null,
    referenceId: referenceType ? referenceId : null,
    scheduledAt: scheduledAt || null,
  })).data
  return { data: toBroadcast(unwrap(response)), message: response?.message || '' }
}

// Hủy đợt hẹn giờ (SCHEDULED) hoặc thu hồi đợt đã gửi (SENT).
export async function cancelBroadcast(id) {
  const response = (await apiClient.delete(`/api/v1/admin/notifications/broadcasts/${path(id)}`)).data
  unwrap(response)
  return response?.message || ''
}

// ---------- GET /api/v1/admin/notifications/statistics?days (1–90, mặc định 30) ----------
export async function getNotificationStatistics(days = 30) {
  const data = unwrap((await apiClient.get('/api/v1/admin/notifications/statistics', { params: { days } })).data) || {}
  return {
    days: toNumber(data.days) || days,
    totalSent: toNumber(data.totalSent),
    totalRead: toNumber(data.totalRead),
    readRate: toNumber(data.readRate),
    broadcastsSent: toNumber(data.broadcastsSent),
    broadcastsScheduled: toNumber(data.broadcastsScheduled),
    byType: asArray(data.byType).map(item => ({ type: String(item.type ?? '').toUpperCase(), total: toNumber(item.total), read: toNumber(item.read), readRate: toNumber(item.readRate) })),
    daily: asArray(data.daily).map(item => ({ date: item.date, sent: toNumber(item.sent), read: toNumber(item.read) })),
  }
}
