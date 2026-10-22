import apiClient from '../apiClient.js'
import { pick, toList, unwrap } from './dashboardApi.js'

const ENDPOINT = '/api/v1/admin/notifications'
const clean = params => Object.fromEntries(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''))

// Swagger chưa mô tả schema response nên thử nhiều tên field.
export const toBroadcast = raw => ({
  id: String(pick(raw, 'id', 'broadcastId') ?? ''),
  title: pick(raw, 'title') || '—',
  body: pick(raw, 'body', 'message', 'content') || '',
  target: pick(raw, 'target', 'audience') || 'Tất cả',
  status: String(pick(raw, 'status') || ''),
  recipients: Number(pick(raw, 'recipientCount', 'totalRecipients', 'sentCount')) || 0,
  readCount: Number(pick(raw, 'readCount', 'totalRead')) || 0,
  scheduledAt: pick(raw, 'scheduledAt') || '',
  sentAt: pick(raw, 'sentAt') || '',
  createdAt: pick(raw, 'createdAt') || '',
  createdBy: pick(raw, 'createdByName', 'adminName', 'createdBy') || '',
})

// GET /api/v1/admin/notifications/broadcasts?Status&Page&PageSize
export async function listBroadcasts({ status, page = 1, pageSize = 20 } = {}) {
  const data = unwrap((await apiClient.get(`${ENDPOINT}/broadcasts`, { params: clean({ Status: status, Page: page, PageSize: pageSize }) })).data)
  const { items, total, totalPages } = toList(data)
  return { items: items.map(toBroadcast), total, totalPages }
}
export const getBroadcast = async id => toBroadcast(unwrap((await apiClient.get(`${ENDPOINT}/broadcasts/${encodeURIComponent(id)}`)).data))
export const deleteBroadcast = async id => unwrap((await apiClient.delete(`${ENDPOINT}/broadcasts/${encodeURIComponent(id)}`)).data)
// CreateBroadcastRequest: title, body, target, userIds, referenceType, referenceId, scheduledAt
export const createBroadcast = async ({ title, body, target, userIds, scheduledAt }) =>
  unwrap((await apiClient.post(`${ENDPOINT}/broadcast`, clean({ title, body, target, userIds: userIds?.length ? userIds : undefined, scheduledAt }))).data)
// GET /api/v1/admin/notifications/statistics?days
export const getNotificationStatistics = async (days = 30) => unwrap((await apiClient.get(`${ENDPOINT}/statistics`, { params: { days } })).data) || {}
