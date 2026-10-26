import apiClient, { normalizeApiError } from '../apiClient.js'

export const REPORTS_ENDPOINT = '/api/v1/reports'

/**
 * Lấy danh sách lý do báo cáo theo đối tượng
 * GET /api/v1/reports/reasons?targetType=...
 * @param {string} [targetType] - 'FACILITY' | 'BOOKING' | 'USER' | 'LFG'
 * @returns {Promise<Array>}
 */
export async function getReportReasons(targetType = 'FACILITY') {
  try {
    const response = await apiClient.get(`${REPORTS_ENDPOINT}/reasons`, {
      params: { targetType },
      skipAuth: true,
    })
    const body = response.data
    const data = body?.data || body?.result || body
    if (Array.isArray(data)) return data
    return [
      { code: 'FACILITY_POOR_QUALITY', label: 'Cơ sở vật chất xuống cấp, không đúng mô tả' },
      { code: 'ATTITUDE_COMPLAINT', label: 'Thái độ phục vụ của nhân viên không tốt' },
      { code: 'OVERBOOKING_OR_CLOSED', label: 'Sân bị trùng lịch hoặc đóng cửa không báo trước' },
      { code: 'UNSPORTSMANLIKE', label: 'Hành vi phi thể thao / Bùng kèo / Trễ hẹn' },
      { code: 'OTHER', label: 'Lý do khác' },
    ]
  } catch (error) {
    console.warn('[reportApi] Lỗi lấy lý do báo cáo, sử dụng mặc định:', error)
    return [
      { code: 'FACILITY_POOR_QUALITY', label: 'Cơ sở vật chất xuống cấp, không đúng mô tả' },
      { code: 'ATTITUDE_COMPLAINT', label: 'Thái độ phục vụ của nhân viên không tốt' },
      { code: 'OVERBOOKING_OR_CLOSED', label: 'Sân bị trùng lịch hoặc đóng cửa không báo trước' },
      { code: 'UNSPORTSMANLIKE', label: 'Hành vi phi thể thao / Bùng kèo / Trễ hẹn' },
      { code: 'OTHER', label: 'Lý do khác' },
    ]
  }
}

/**
 * Gửi báo cáo / khiếu nại mới
 * POST /api/v1/reports
 * @param {Object} payload
 * @param {string} payload.targetType - 'FACILITY' | 'BOOKING' | 'USER' | 'LFG'
 * @param {string} [payload.bookingId]
 * @param {string} [payload.facilityId]
 * @param {string} [payload.targetUserId]
 * @param {string} [payload.targetObjectId]
 * @param {string} payload.reason
 * @param {string} payload.description
 * @param {string[]} [payload.evidenceImageUrls]
 * @param {number} [payload.requestedRefundPercentage]
 * @returns {Promise<Object>}
 */
export async function createReport(payload) {
  if (!payload || !payload.reason) {
    throw new Error('Vui lòng chọn lý do báo cáo')
  }
  try {
    const bodyPayload = {
      targetType: payload.targetType || 'FACILITY',
      bookingId: payload.bookingId || null,
      facilityId: payload.facilityId || null,
      targetUserId: payload.targetUserId || null,
      targetObjectId: payload.targetObjectId || null,
      reason: String(payload.reason).trim(),
      description: payload.description ? String(payload.description).trim() : '',
      evidenceImageUrls: Array.isArray(payload.evidenceImageUrls) ? payload.evidenceImageUrls : [],
      requestedRefundPercentage: payload.requestedRefundPercentage != null ? Number(payload.requestedRefundPercentage) : 0,
    }
    const response = await apiClient.post(REPORTS_ENDPOINT, bodyPayload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[reportApi] Lỗi khi gửi báo cáo:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Lấy danh sách báo cáo / khiếu nại của tôi
 * GET /api/v1/reports/my-reports
 * @param {Object} [params]
 * @param {string} [params.status] - 'PENDING' | 'RESOLVED' | 'REJECTED' | 'WITHDRAWN'
 * @param {string} [params.targetType]
 * @returns {Promise<Array>}
 */
export async function getMyReports(params = {}) {
  try {
    const response = await apiClient.get(`${REPORTS_ENDPOINT}/my-reports`, { params })
    const body = response.data
    const data = body?.data || body?.result || body
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.items)) return data.items
    return []
  } catch (error) {
    console.warn('[reportApi] Lỗi lấy danh sách báo cáo của tôi:', error)
    return []
  }
}

/**
 * Lấy chi tiết báo cáo
 * GET /api/v1/reports/{reportId}
 * @param {string} reportId
 * @returns {Promise<Object>}
 */
export async function getReportById(reportId) {
  if (!reportId) return null
  try {
    const response = await apiClient.get(`${REPORTS_ENDPOINT}/${reportId}`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[reportApi] Lỗi lấy báo cáo ${reportId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Cập nhật nội dung báo cáo
 * PUT /api/v1/reports/{reportId}
 * @param {string} reportId
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function updateReport(reportId, payload) {
  if (!reportId) throw new Error('reportId không được để trống')
  try {
    const response = await apiClient.put(`${REPORTS_ENDPOINT}/${reportId}`, payload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[reportApi] Lỗi cập nhật báo cáo ${reportId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Rút lại khiếu nại / báo cáo
 * POST /api/v1/reports/{reportId}/withdraw
 * @param {string} reportId
 * @param {string} [note]
 * @returns {Promise<Object>}
 */
export async function withdrawReport(reportId, note = '') {
  if (!reportId) throw new Error('reportId không được để trống')
  try {
    const response = await apiClient.post(`${REPORTS_ENDPOINT}/${reportId}/withdraw`, {
      note: note ? String(note).trim() : 'Người dùng tự nguyện rút lại báo cáo',
    })
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[reportApi] Lỗi rút báo cáo ${reportId}:`, error)
    throw normalizeApiError(error)
  }
}

export default {
  getReportReasons,
  createReport,
  getMyReports,
  getReportById,
  updateReport,
  withdrawReport,
}
