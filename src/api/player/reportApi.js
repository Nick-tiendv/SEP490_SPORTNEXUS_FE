import apiClient, { normalizeApiError } from '../apiClient.js'

export const REPORTS_ENDPOINT = '/api/v1/reports'

/**
 * Lấy danh sách lý do báo cáo theo đối tượng
 * GET /api/v1/reports/reasons?targetType=...
 * @param {string} [targetType] - 'FACILITY' | 'BOOKING' | 'USER' | 'COMMUNITY_POST' | 'MATCH'
 * Mỗi lý do: { code, targetType, title, description, suggestedRefundPercentage } (vd USER có SKILL_MISREPRESENTATION)
 * @returns {Promise<Array>}
 */
const DEFAULT_REASONS_BY_TYPE = {
  COMMUNITY_POST: [
    {
      code: 'SPAM_OR_INAPPROPRIATE_POST',
      targetType: 'COMMUNITY_POST',
      title: 'Bài viết spam / quảng cáo trái phép / nội dung phản cảm',
      description: 'Bài đăng cộng đồng vi phạm tiêu chuẩn cộng đồng, lừa đảo hoặc spam.',
    },
    {
      code: 'TOXIC_BEHAVIOR',
      targetType: 'COMMUNITY_POST',
      title: 'Ngôn từ kích động, xúc phạm hoặc quấy rối người chơi khác',
      description: 'Bài viết chứa nội dung công kích cá nhân, phân biệt đối xử hoặc gây thù địch.',
    },
    {
      code: 'OTHER',
      targetType: 'ALL',
      title: 'Lý do khác (Vi phạm tiêu chuẩn cộng đồng)',
      description: 'Các hành vi vi phạm tiêu chuẩn cộng đồng khác cần Ban quản trị xử lý.',
    },
  ],
  POST_COMMENT: [
    {
      code: 'INAPPROPRIATE_COMMENT',
      targetType: 'POST_COMMENT',
      title: 'Bình luận xúc phạm / spam / nội dung phản cảm',
      description: 'Bình luận vi phạm quy tắc cộng đồng. Admin xác nhận có thể ẩn bình luận và trừ điểm Fair Play người viết.',
    },
    {
      code: 'TOXIC_BEHAVIOR',
      targetType: 'POST_COMMENT',
      title: 'Quấy rối, công kích cá nhân hoặc ngôn từ thiếu văn hóa',
      description: 'Bình luận nhắm vào cá nhân hoặc gây mất đoàn kết trong cộng đồng thể thao.',
    },
    {
      code: 'OTHER',
      targetType: 'ALL',
      title: 'Lý do khác (Vi phạm quy tắc cộng đồng)',
      description: 'Các vấn đề phát sinh khác cần Ban quản trị hỗ trợ giải quyết.',
    },
  ],
  FACILITY: [
    { code: 'FACILITY_POOR_QUALITY', targetType: 'FACILITY', label: 'Cơ sở vật chất xuống cấp, không đúng mô tả' },
    { code: 'ATTITUDE_COMPLAINT', targetType: 'FACILITY', label: 'Thái độ phục vụ của nhân viên không tốt' },
    { code: 'OVERBOOKING_OR_CLOSED', targetType: 'FACILITY', label: 'Sân bị trùng lịch hoặc đóng cửa không báo trước' },
    { code: 'UNSPORTSMANLIKE', targetType: 'FACILITY', label: 'Hành vi phi thể thao / Bùng kèo / Trễ hẹn' },
    { code: 'OTHER', targetType: 'ALL', label: 'Lý do khác' },
  ],
}

export async function getReportReasons(targetType = 'FACILITY') {
  const normalizedType = String(targetType || 'FACILITY').toUpperCase()
  const defaults = DEFAULT_REASONS_BY_TYPE[normalizedType] || DEFAULT_REASONS_BY_TYPE.FACILITY
  try {
    const response = await apiClient.get(`${REPORTS_ENDPOINT}/reasons`, {
      params: { targetType: normalizedType },
      skipAuth: true,
    })
    const body = response.data
    const data = body?.data || body?.result || body
    if (Array.isArray(data) && data.length > 0) {
      if (normalizedType === 'COMMUNITY_POST' || normalizedType === 'POST_COMMENT') {
        const merged = [...data]
        for (const item of defaults) {
          if (!merged.some((r) => r.code === item.code)) merged.push(item)
        }
        return merged
      }
      return data
    }
    return defaults
  } catch (error) {
    console.warn('[reportApi] Lỗi lấy lý do báo cáo, sử dụng mặc định:', error)
    return defaults
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
  const rawImages = Array.isArray(payload.evidenceImageUrls) ? payload.evidenceImageUrls : []
  const remoteImages = rawImages.filter((u) => typeof u === 'string' && !u.startsWith('data:'))
  const bodyPayload = {
    targetType: payload.targetType || 'FACILITY',
    bookingId: payload.bookingId || null,
    facilityId: payload.facilityId || null,
    targetUserId: payload.targetUserId || null,
    targetObjectId: payload.targetObjectId || null,
    reason: String(payload.reason).trim(),
    description: payload.description ? String(payload.description).trim() : '',
    evidenceImageUrls: remoteImages,
    requestedRefundPercentage: payload.requestedRefundPercentage != null ? Number(payload.requestedRefundPercentage) : 0,
  }
  try {
    const response = await apiClient.post(REPORTS_ENDPOINT, bodyPayload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    const isCommunityReport =
      bodyPayload.targetType === 'COMMUNITY_POST' ||
      bodyPayload.targetType === 'POST_COMMENT' ||
      bodyPayload.targetType === 'COMMENT'
    if (isCommunityReport && bodyPayload.targetUserId) {
      try {
        const retryRes = await apiClient.post(REPORTS_ENDPOINT, {
          ...bodyPayload,
          targetUserId: null,
        })
        const retryBody = retryRes.data
        return retryBody?.data || retryBody?.result || retryBody
      } catch {
        // tiếp tục dự phòng lưu báo cáo cộng đồng
      }
    }
    if (isCommunityReport) {
      try {
        const saved = JSON.parse(localStorage.getItem('sportnexus_community_reports') || '[]')
        const record = {
          id: `rep-${Date.now()}`,
          ...bodyPayload,
          evidenceImageUrls: rawImages,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        }
        localStorage.setItem('sportnexus_community_reports', JSON.stringify([record, ...saved]))
        return record
      } catch {
        // bỏ qua lỗi localStorage
      }
    }
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
