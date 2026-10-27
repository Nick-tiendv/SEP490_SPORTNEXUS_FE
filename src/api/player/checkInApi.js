import apiClient, { normalizeApiError } from '../apiClient.js'

/**
 * Lịch sử check-in của tôi (vé đặt sân, kèo LFG, giải đấu), mới nhất trước
 * GET /api/v1/checkin/history?type=BOOKING|LFG|TOURNAMENT&page=&pageSize=
 * @returns {Promise<{ items: Array, totalItems: number }>}
 */
export async function getMyCheckInHistory({ type, page = 1, pageSize = 20 } = {}) {
  try {
    const params = { page, pageSize }
    if (type) params.type = type
    const response = await apiClient.get('/api/v1/checkin/history', { params })
    const data = response.data?.data || {}
    return { items: Array.isArray(data.items) ? data.items : [], totalItems: Number(data.totalItems) || 0 }
  } catch (error) {
    throw normalizeApiError(error)
  }
}
