import apiClient, { normalizeApiError } from '../apiClient.js'

export const LFGS_ENDPOINT = '/api/v1/lfgs'

/**
 * ============================================================================
 * 2.6. GHÉP KÈO (LFG) - API SERVICE
 * ============================================================================
 */

/**
 * Bước 1 (Người tham gia): Lấy danh sách kèo ghép trận (LFG)
 * GET /api/v1/lfgs
 * Hỗ trợ lọc theo môn, từ khóa, trình độ, giá, vị trí, khoảng cách, phân trang
 * @param {Object} [params]
 * @param {string} [params.CategoryId] - UUID môn thể thao (Category)
 * @param {string} [params.Keyword] - Từ khóa tìm kiếm
 * @param {string} [params.SkillLevelTag] - Trình độ (vd: "Trung bình - Khá", "Mới chơi", "Nâng cao")
 * @param {number} [params.MaxPricePerPerson] - Mức giá tối đa mỗi người
 * @param {number} [params.Lat] - Vĩ độ GPS người chơi
 * @param {number} [params.Lng] - Kinh độ GPS người chơi
 * @param {number} [params.RadiusKm] - Bán kính tìm kiếm (km)
 * @param {string} [params.FromTime] - Thời gian bắt đầu từ (ISO)
 * @param {string} [params.ToTime] - Thời gian kết thúc đến (ISO)
 * @param {number} [params.MinRemainingSlots] - Số slot còn trống tối thiểu
 * @param {string} [params.SortBy] - Tiêu chí sắp xếp
 * @param {number} [params.Page=1] - Trang hiện tại
 * @param {number} [params.PageSize=20] - Kích thước trang
 * @returns {Promise<{ items: Array, totalItems: number, page: number, pageSize: number, totalPages: number }>}
 */
export async function getLfgs(params = {}) {
  try {
    const cleanParams = {}
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'all') {
        cleanParams[key] = val
      }
    })
    const response = await apiClient.get(LFGS_ENDPOINT, {
      params: cleanParams,
      skipAuth: false,
    })
    const body = response.data
    const data = body?.data || body?.result || body
    if (data && Array.isArray(data.items)) {
      return data
    }
    if (Array.isArray(data)) {
      return { items: data, totalItems: data.length, page: 1, pageSize: data.length, totalPages: 1 }
    }
    return { items: [], totalItems: 0, page: 1, pageSize: 20, totalPages: 0 }
  } catch (error) {
    console.warn('[lfgApi] Không thể lấy danh sách kèo LFG:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Lấy thông tin chi tiết một kèo ghép trận (LFG)
 * GET /api/v1/lfgs/{cardId}
 * @param {string} cardId - UUID của kèo ghép
 * @returns {Promise<Object>} Chi tiết kèo ghép
 */
export async function getLfgById(cardId) {
  if (!cardId) throw new Error('cardId không được để trống')
  try {
    const response = await apiClient.get(`${LFGS_ENDPOINT}/${cardId}`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[lfgApi] Không thể lấy thông tin kèo LFG ${cardId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Bước 1 (Chủ kèo): Tạo kèo ghép trận mới
 * POST /api/v1/lfgs
 * Hệ thống tự đặt ca sân và trừ 100% tiền sân từ ví chủ kèo.
 * pricePerPerson bỏ trống = chia đều tiền sân cho (slotsNeeded + 1).
 * @param {Object} payload
 * @param {string} payload.courtSlotId - UUID ca sân
 * @param {number} payload.slotsNeeded - Số slot cần tìm
 * @param {number} [payload.pricePerPerson] - Giá mỗi người (nếu để trống, server tự chia đều)
 * @param {string} [payload.skillLevelTag] - Trình độ yêu cầu
 * @param {string} [payload.description] - Mô tả kèo
 * @param {boolean} [payload.requireApproval=false] - Có cần duyệt người tham gia hay không
 * @param {number} [payload.sideSize] - Số lượng người mỗi bên
 * @param {string[]} [payload.friendIds] - Danh sách bạn bè đi cùng chủ kèo
 * @param {string} [payload.friendPayMode] - Cách thanh toán cho bạn ('me' | 'split')
 * @returns {Promise<Object>} Thông tin kèo đã tạo
 */
export async function createLfg(payload) {
  if (!payload || !payload.courtSlotId) {
    throw new Error('Vui lòng chọn ca sân (courtSlotId) để tạo kèo ghép!')
  }
  try {
    const bodyPayload = {
      courtSlotId: payload.courtSlotId,
      slotsNeeded: typeof payload.slotsNeeded === 'number' ? payload.slotsNeeded : 2,
      pricePerPerson: payload.pricePerPerson != null && payload.pricePerPerson !== '' ? Number(payload.pricePerPerson) : null,
      skillLevelTag: payload.skillLevelTag ? String(payload.skillLevelTag).trim() : null,
      description: payload.description ? String(payload.description).trim() : null,
      requireApproval: Boolean(payload.requireApproval),
      sideSize: payload.sideSize ? Number(payload.sideSize) : null,
      friendIds: Array.isArray(payload.friendIds) ? payload.friendIds : null,
      friendPayMode: payload.friendPayMode || null,
    }
    const response = await apiClient.post(LFGS_ENDPOINT, bodyPayload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[lfgApi] Lỗi khi tạo kèo ghép LFG:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Bước 2 (Chủ kèo): Lấy danh sách kèo đã tạo của tôi
 * GET /api/v1/lfgs/my-cards?status=...
 * @param {string} [status] - Lọc trạng thái ('OPEN' | 'FILLED' | 'CANCELLED')
 * @returns {Promise<Array>} Danh sách kèo đã tạo
 */
export async function getMyLfgCards(status) {
  try {
    const params = {}
    if (status && status !== 'all') params.status = status
    const response = await apiClient.get(`${LFGS_ENDPOINT}/my-cards`, { params })
    const body = response.data
    const data = body?.data || body?.result || body
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.items)) return data.items
    return []
  } catch (error) {
    console.warn('[lfgApi] Lỗi khi lấy danh sách kèo của tôi:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Lấy danh sách kèo người chơi đã tham gia
 * GET /api/v1/lfgs/joined
 * @returns {Promise<Array>} Danh sách kèo đã tham gia
 */
export async function getJoinedLfgs() {
  try {
    const response = await apiClient.get(`${LFGS_ENDPOINT}/joined`)
    const body = response.data
    const data = body?.data || body?.result || body
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.items)) return data.items
    return []
  } catch (error) {
    console.warn('[lfgApi] Lỗi khi lấy danh sách kèo đã tham gia:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Bước 2 (Người tham gia): Nhận suất (claim slot) trong kèo ghép trận LFG
 * POST /api/v1/lfgs/{cardId}/claim
 * - Kèo không cần duyệt: trừ tiền ngay, vào kèo luôn.
 * - Kèo cần duyệt: chỉ gửi yêu cầu, tiền bị giữ khi chủ kèo duyệt.
 * - Nhận suất có thể bị từ chối 403 nếu Fair Play thấp hơn ngưỡng hoặc bị cấm.
 * @param {string} cardId - UUID kèo ghép
 * @param {Object} [payload]
 * @param {string[]} [payload.friendIds] - Danh sách bạn bè đi cùng
 * @param {string} [payload.friendPayMode] - Hình thức thanh toán ('me' | 'split')
 * @param {string} [payload.side] - Phía/đội ('A' | 'B' | 'any')
 * @returns {Promise<Object>} Kết quả nhận suất
 */
export async function claimLfgSlot(cardId, payload = {}) {
  if (!cardId) throw new Error('cardId không được để trống')
  try {
    const bodyPayload = {
      friendIds: payload.friendIds || [],
      friendPayMode: payload.friendPayMode || 'me',
      side: payload.side || 'any',
    }
    const response = await apiClient.post(`${LFGS_ENDPOINT}/${cardId}/claim`, bodyPayload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[lfgApi] Lỗi khi nhận suất kèo LFG ${cardId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Bước 3 (Người tham gia): Lấy vé QR Check-in kèo LFG tại sân
 * GET /api/v1/lfgs/{cardId}/qr-ticket
 * @param {string} cardId - UUID kèo ghép
 * @returns {Promise<Object>} Thông tin vé QR
 */
export async function getLfgQrTicket(cardId) {
  if (!cardId) throw new Error('cardId không được để trống')
  try {
    const response = await apiClient.get(`${LFGS_ENDPOINT}/${cardId}/qr-ticket`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[lfgApi] Lỗi khi lấy vé QR kèo LFG ${cardId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Bước 3 (Chủ kèo): Duyệt người tham gia vào kèo
 * POST /api/v1/lfgs/{cardId}/participants/{userId}/approve
 * @param {string} cardId - UUID kèo ghép
 * @param {string} userId - UUID người xin tham gia
 * @returns {Promise<Object>}
 */
export async function approveLfgParticipant(cardId, userId) {
  if (!cardId || !userId) throw new Error('cardId và userId không được để trống')
  try {
    const response = await apiClient.post(`${LFGS_ENDPOINT}/${cardId}/participants/${userId}/approve`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[lfgApi] Lỗi khi duyệt người tham gia ${userId} kèo ${cardId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Bước 3 (Chủ kèo): Từ chối người tham gia vào kèo
 * POST /api/v1/lfgs/{cardId}/participants/{userId}/reject
 * @param {string} cardId - UUID kèo ghép
 * @param {string} userId - UUID người xin tham gia
 * @returns {Promise<Object>}
 */
export async function rejectLfgParticipant(cardId, userId) {
  if (!cardId || !userId) throw new Error('cardId và userId không được để trống')
  try {
    const response = await apiClient.post(`${LFGS_ENDPOINT}/${cardId}/participants/${userId}/reject`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[lfgApi] Lỗi khi từ chối người tham gia ${userId} kèo ${cardId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Bước 4 (Chủ kèo): Loại người đã vào kèo (hoàn 100% tiền cho họ, mở lại 1 suất)
 * DELETE /api/v1/lfgs/{cardId}/participants/{userId}
 * @param {string} cardId - UUID kèo ghép
 * @param {string} userId - UUID người bị loại
 * @returns {Promise<Object>}
 */
export async function removeLfgParticipant(cardId, userId) {
  if (!cardId || !userId) throw new Error('cardId và userId không được để trống')
  try {
    const response = await apiClient.delete(`${LFGS_ENDPOINT}/${cardId}/participants/${userId}`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[lfgApi] Lỗi khi loại người tham gia ${userId} khỏi kèo ${cardId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Bước 5 (Chủ kèo): Hủy kèo ghép LFG
 * POST /api/v1/lfgs/{cardId}/cancel
 * Hoàn 100% cho người tham gia; tiền sân của chủ kèo hoàn theo chính sách hủy đặt sân (trước 24h hoàn 100%).
 * @param {string} cardId - UUID kèo ghép
 * @param {Object} [payload]
 * @param {string} [payload.reason] - Lý do hủy kèo
 * @returns {Promise<Object>}
 */
export async function cancelLfg(cardId, payload = {}) {
  if (!cardId) throw new Error('cardId không được để trống')
  try {
    const bodyPayload = {
      reason: payload.reason ? String(payload.reason).trim() : null,
    }
    const response = await apiClient.post(`${LFGS_ENDPOINT}/${cardId}/cancel`, bodyPayload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[lfgApi] Lỗi khi hủy kèo LFG ${cardId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Bước 4 (Người tham gia): Rời kèo hoặc rút yêu cầu đang chờ
 * POST /api/v1/lfgs/{cardId}/leave
 * Hoàn 100% tiền cọc. Không rời được trong vòng 2 giờ trước giờ chơi.
 * @param {string} cardId - UUID kèo ghép
 * @param {Object} [payload]
 * @param {string} [payload.reason] - Lý do rời kèo
 * @returns {Promise<Object>}
 */
export async function leaveLfg(cardId, payload = {}) {
  if (!cardId) throw new Error('cardId không được để trống')
  try {
    const bodyPayload = {
      reason: payload.reason ? String(payload.reason).trim() : null,
    }
    const response = await apiClient.post(`${LFGS_ENDPOINT}/${cardId}/leave`, bodyPayload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[lfgApi] Lỗi khi rời kèo LFG ${cardId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Lấy danh sách lý do hủy kèo
 * GET /api/v1/lfgs/cancel-reasons
 * @returns {Promise<Array>}
 */
export async function getLfgCancelReasons() {
  try {
    const response = await apiClient.get(`${LFGS_ENDPOINT}/cancel-reasons`, { skipAuth: true })
    const body = response.data
    return body?.data || body?.result || body || []
  } catch (error) {
    console.warn('[lfgApi] Không thể lấy lý do hủy kèo:', error)
    return [
      { code: 1, label: 'Bận việc đột xuất / Thay đổi lịch trình' },
      { code: 2, label: 'Thời tiết xấu / Không thuận lợi di chuyển' },
      { code: 3, label: 'Không đủ người chơi tham gia' },
      { code: 4, label: 'Vấn đề sức khỏe / Chấn thương' },
      { code: 5, label: 'Khác (Tự nhập lý do)' },
    ]
  }
}

/**
 * Cập nhật thông tin kèo ghép (Chủ kèo)
 * PUT /api/v1/lfgs/{cardId}
 * @param {string} cardId - UUID kèo ghép
 * @param {Object} payload
 * @param {number} [payload.totalSlots]
 * @param {string} [payload.skillLevelTag]
 * @param {string} [payload.description]
 * @param {boolean} [payload.requireApproval]
 * @returns {Promise<Object>}
 */
export async function updateLfg(cardId, payload = {}) {
  if (!cardId) throw new Error('cardId không được để trống')
  try {
    const response = await apiClient.put(`${LFGS_ENDPOINT}/${cardId}`, payload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[lfgApi] Lỗi khi cập nhật kèo LFG ${cardId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Chấp nhận lời mời tham gia kèo LFG
 * POST /api/v1/lfgs/{cardId}/invitation/accept
 * @param {string} cardId - UUID kèo ghép
 * @returns {Promise<Object>}
 */
export async function acceptLfgInvitation(cardId) {
  if (!cardId) throw new Error('cardId không được để trống')
  try {
    const response = await apiClient.post(`${LFGS_ENDPOINT}/${cardId}/invitation/accept`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[lfgApi] Lỗi khi chấp nhận lời mời kèo ${cardId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Từ chối lời mời tham gia kèo LFG
 * POST /api/v1/lfgs/{cardId}/invitation/decline
 * @param {string} cardId - UUID kèo ghép
 * @returns {Promise<Object>}
 */
export async function declineLfgInvitation(cardId) {
  if (!cardId) throw new Error('cardId không được để trống')
  try {
    const response = await apiClient.post(`${LFGS_ENDPOINT}/${cardId}/invitation/decline`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[lfgApi] Lỗi khi từ chối lời mời kèo ${cardId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Xóa bạn bè đi cùng trong nhóm kèo LFG
 * DELETE /api/v1/lfgs/{cardId}/group/{friendId}
 * @param {string} cardId - UUID kèo ghép
 * @param {string} friendId - UUID bạn bè trong nhóm
 * @returns {Promise<Object>}
 */
export async function removeLfgGroupMember(cardId, friendId) {
  if (!cardId || !friendId) throw new Error('cardId và friendId không được để trống')
  try {
    const response = await apiClient.delete(`${LFGS_ENDPOINT}/${cardId}/group/${friendId}`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[lfgApi] Lỗi khi xóa bạn bè khỏi nhóm kèo ${cardId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Tạo yêu cầu hủy kèo có bỏ phiếu
 * POST /api/v1/lfgs/{cardId}/cancel-requests
 * @param {string} cardId - UUID kèo ghép
 * @param {Object} payload
 * @param {string} payload.reason - Lý do hủy kèo
 * @returns {Promise<Object>}
 */
export async function createLfgCancelRequest(cardId, payload = {}) {
  if (!cardId) throw new Error('cardId không được để trống')
  try {
    const response = await apiClient.post(`${LFGS_ENDPOINT}/${cardId}/cancel-requests`, {
      reason: payload.reason ? String(payload.reason).trim() : 'Yêu cầu hủy kèo do việc bận đột xuất',
    })
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[lfgApi] Lỗi khi tạo yêu cầu hủy kèo ${cardId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Lấy yêu cầu hủy kèo mới nhất
 * GET /api/v1/lfgs/{cardId}/cancel-requests/latest
 * @param {string} cardId - UUID kèo ghép
 * @returns {Promise<Object>}
 */
export async function getLatestLfgCancelRequest(cardId) {
  if (!cardId) throw new Error('cardId không được để trống')
  try {
    const response = await apiClient.get(`${LFGS_ENDPOINT}/${cardId}/cancel-requests/latest`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[lfgApi] Lỗi lấy yêu cầu hủy mới nhất ${cardId}:`, error)
    return null
  }
}

/**
 * Bỏ phiếu đồng ý hoặc từ chối yêu cầu hủy kèo
 * POST /api/v1/lfgs/{cardId}/cancel-requests/{requestId}/vote
 * @param {string} cardId - UUID kèo ghép
 * @param {string} requestId - UUID yêu cầu hủy
 * @param {Object} payload
 * @param {boolean} payload.approve - Đồng ý hủy hay không
 * @param {string} [payload.note] - Ghi chú
 * @returns {Promise<Object>}
 */
export async function voteLfgCancelRequest(cardId, requestId, payload = {}) {
  if (!cardId || !requestId) throw new Error('cardId và requestId không được để trống')
  try {
    const bodyPayload = {
      approve: Boolean(payload.approve),
      note: payload.note ? String(payload.note).trim() : null,
    }
    const response = await apiClient.post(`${LFGS_ENDPOINT}/${cardId}/cancel-requests/${requestId}/vote`, bodyPayload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[lfgApi] Lỗi khi bỏ phiếu hủy kèo ${requestId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * ============================================================================
 * 2.7. CHECK-IN VÀ CHẤM FAIR PLAY - API SERVICE
 * ============================================================================
 */

/**
 * Lấy thông tin điểm Fair Play của tôi
 * GET /api/v1/fair-play/me
 * @returns {Promise<Object>} { score, totalRatings, ratingCount, ... }
 */
export async function getMyFairPlay() {
  try {
    const response = await apiClient.get('/api/v1/fair-play/me')
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[lfgApi] Không thể lấy thông tin Fair Play của tôi:', error)
    throw normalizeApiError(error)
  }
}

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
    console.warn('[lfgApi] Không thể lấy pending fair play ratings:', error)
    return []
  }
}

/**
 * Bước 3 (Check-in & Chấm Fair Play): Chấm điểm Fair Play sau trận
 * POST /api/v1/reviews/fair-play
 * Điểm Fair Play = trung bình số sao x 20 (chưa có đánh giá = 100), giới hạn 0-100.
 * @param {Object} payload
 * @param {string} payload.revieweeId - UUID người được chấm
 * @param {string} payload.contextId - UUID kèo LFG hoặc đơn đặt sân
 * @param {number} payload.score - Điểm số từ 1 đến 5 sao
 * @param {string} [payload.comment] - Nhận xét
 * @returns {Promise<Object>}
 */
export async function rateFairPlay(payload) {
  if (!payload || !payload.revieweeId || !payload.contextId || !payload.score) {
    throw new Error('Thiếu thông tin đánh giá Fair Play (revieweeId, contextId, score)')
  }
  try {
    const bodyPayload = {
      revieweeId: payload.revieweeId,
      contextId: payload.contextId,
      score: Number(payload.score),
      comment: payload.comment ? String(payload.comment).trim() : null,
    }
    const response = await apiClient.post('/api/v1/reviews/fair-play', bodyPayload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[lfgApi] Lỗi khi gửi đánh giá Fair Play:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Bước 2 (Check-in): Chủ sân quét mã QR check-in
 * POST /api/v1/checkin/scan?facilityId=...&qrCode=...
 * @param {string} facilityId - UUID cơ sở của chủ sân
 * @param {string} qrCode - Mã QR token trên vé
 * @returns {Promise<Object>}
 */
export async function scanCheckIn(facilityId, qrCode) {
  if (!facilityId || !qrCode) {
    throw new Error('facilityId và qrCode không được để trống')
  }
  try {
    const response = await apiClient.post('/api/v1/checkin/scan', null, {
      params: {
        facilityId: facilityId.trim(),
        qrCode: qrCode.trim(),
      },
    })
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[lfgApi] Lỗi khi quét mã QR check-in:', error)
    throw normalizeApiError(error)
  }
}

export default {
  getLfgs,
  getLfgById,
  createLfg,
  updateLfg,
  getMyLfgCards,
  getJoinedLfgs,
  claimLfgSlot,
  getLfgQrTicket,
  approveLfgParticipant,
  rejectLfgParticipant,
  removeLfgParticipant,
  cancelLfg,
  leaveLfg,
  getLfgCancelReasons,
  acceptLfgInvitation,
  declineLfgInvitation,
  removeLfgGroupMember,
  createLfgCancelRequest,
  getLatestLfgCancelRequest,
  voteLfgCancelRequest,
  getMyFairPlay,
  getPendingFairPlayRatings,
  rateFairPlay,
  scanCheckIn,
}

