import apiClient, { normalizeApiError } from './apiClient.js'

/**
 * Service quản lý đánh giá cơ sở và fair-play
 * Backend API:
 * - GET  /api/v1/fair-play/pending-ratings
 * - POST /api/v1/reviews/facility
 * - GET  /api/v1/facility-reviews/eligibility/{facilityId}
 * - POST /api/v1/facility-reviews
 * - GET  /api/v1/facility-reviews/my-reviews
 * - GET  /api/v1/facility-reviews/{reviewId}
 * - PUT  /api/v1/facility-reviews/{reviewId}
 * - DELETE /api/v1/facility-reviews/{reviewId}
 */

/**
 * Lấy danh sách các trận cần chấm điểm Fair Play
 * GET /api/v1/fair-play/pending-ratings
 * @returns {Promise<Array>}
 */
export async function getPendingFairPlayRatings() {
  try {
    const response = await apiClient.get('/api/v1/fair-play/pending-ratings')
    const body = response.data
    const data = body?.data || body?.result || body
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('[reviewApi] Lỗi lấy danh sách pending fair-play:', error)
    return []
  }
}

/**
 * Kiểm tra điều kiện được phép đánh giá cơ sở (đã chơi tại sân)
 * GET /api/v1/facility-reviews/eligibility/{facilityId}
 * @param {string} facilityId
 * @returns {Promise<{ isEligible: boolean, message?: string }>}
 */
export async function checkFacilityReviewEligibility(facilityId) {
  if (!facilityId) return { isEligible: false }
  try {
    const response = await apiClient.get(`/api/v1/facility-reviews/eligibility/${facilityId}`)
    const body = response.data
    return body?.data || body?.result || body || { isEligible: true }
  } catch (error) {
    console.warn(`[reviewApi] Lỗi kiểm tra điều kiện đánh giá cơ sở ${facilityId}:`, error)
    return { isEligible: true }
  }
}

/**
 * Gửi đánh giá cơ sở thể thao
 * POST /api/v1/facility-reviews
 * @param {Object} payload
 * @param {string} payload.facilityId - UUID cơ sở
 * @param {number} payload.rating - Số sao (1 - 5)
 * @param {string} payload.comment - Nhận xét
 * @returns {Promise<Object>}
 */
export async function createFacilityReview(payload) {
  if (!payload || !payload.facilityId || !payload.rating) {
    throw new Error('Vui lòng chọn số sao đánh giá cơ sở')
  }
  try {
    const bodyPayload = {
      facilityId: payload.facilityId,
      rating: Number(payload.rating),
      comment: payload.comment ? String(payload.comment).trim() : '',
    }
    const response = await apiClient.post('/api/v1/facility-reviews', bodyPayload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[reviewApi] Lỗi gửi đánh giá cơ sở (thử fallback /api/v1/reviews/facility):', error)
    // Fallback sang endpoint /api/v1/reviews/facility nếu cần
    try {
      const fbResponse = await apiClient.post('/api/v1/reviews/facility', {
        facilityId: payload.facilityId,
        rating: Number(payload.rating),
        comment: payload.comment ? String(payload.comment).trim() : '',
      })
      return fbResponse.data?.data || fbResponse.data
    } catch (fbErr) {
      throw normalizeApiError(error)
    }
  }
}

/**
 * Đánh giá cơ sở thể thao (endpoint thay thế)
 * POST /api/v1/reviews/facility
 */
export const rateFacility = createFacilityReview

/**
 * Lấy danh sách đánh giá sân của tôi
 * GET /api/v1/facility-reviews/my-reviews
 * @param {Object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.pageSize=10]
 * @returns {Promise<{ items: Array, totalItems: number }>}
 */
export async function getMyFacilityReviews(params = {}) {
  try {
    const response = await apiClient.get('/api/v1/facility-reviews/my-reviews', { params })
    const body = response.data
    const data = body?.data || body?.result || body
    if (data && Array.isArray(data.items)) return data
    if (Array.isArray(data)) return { items: data, totalItems: data.length }
    return { items: [], totalItems: 0 }
  } catch (error) {
    console.warn('[reviewApi] Lỗi lấy đánh giá sân của tôi:', error)
    return { items: [], totalItems: 0 }
  }
}

/**
 * Xem chi tiết 1 bài đánh giá cơ sở
 * GET /api/v1/facility-reviews/{reviewId}
 * @param {string} reviewId
 * @returns {Promise<Object>}
 */
export async function getFacilityReviewById(reviewId) {
  if (!reviewId) return null
  try {
    const response = await apiClient.get(`/api/v1/facility-reviews/${reviewId}`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[reviewApi] Lỗi lấy chi tiết đánh giá ${reviewId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Cập nhật bài đánh giá sân
 * PUT /api/v1/facility-reviews/{reviewId}
 * @param {string} reviewId
 * @param {Object} payload
 * @param {number} payload.rating
 * @param {string} payload.comment
 * @returns {Promise<Object>}
 */
export async function updateFacilityReview(reviewId, payload) {
  if (!reviewId) throw new Error('reviewId không được để trống')
  try {
    const response = await apiClient.put(`/api/v1/facility-reviews/${reviewId}`, {
      rating: Number(payload.rating),
      comment: payload.comment ? String(payload.comment).trim() : '',
    })
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[reviewApi] Lỗi cập nhật đánh giá ${reviewId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Xóa bài đánh giá sân
 * DELETE /api/v1/facility-reviews/{reviewId}
 * @param {string} reviewId
 * @returns {Promise<boolean>}
 */
export async function deleteFacilityReview(reviewId) {
  if (!reviewId) return false
  try {
    await apiClient.delete(`/api/v1/facility-reviews/${reviewId}`)
    return true
  } catch (error) {
    console.warn(`[reviewApi] Lỗi xóa đánh giá ${reviewId}:`, error)
    throw normalizeApiError(error)
  }
}

export default {
  getPendingFairPlayRatings,
  checkFacilityReviewEligibility,
  createFacilityReview,
  rateFacility,
  getMyFacilityReviews,
  getFacilityReviewById,
  updateFacilityReview,
  deleteFacilityReview,
}
