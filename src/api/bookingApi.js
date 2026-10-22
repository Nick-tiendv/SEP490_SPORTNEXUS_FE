import apiClient, { normalizeApiError } from './apiClient.js'

export const BOOKINGS_ENDPOINT = '/api/v1/bookings'

/**
 * Lấy lưới ca của sân con trong 1 ngày (không cần đăng nhập)
 * GET /api/v1/courts/{courtId}/slots?date=YYYY-MM-DD
 * @param {string} courtId - UUID sân con
 * @param {string} [dateStr] - Ngày theo định dạng YYYY-MM-DD (mặc định hôm nay theo giờ VN)
 * @returns {Promise<Array>} Danh sách các ca sân
 */
export async function getCourtSlots(courtId, dateStr) {
  if (!courtId) return []
  try {
    const params = {}
    if (dateStr) params.date = dateStr
    const response = await apiClient.get(`/api/v1/courts/${courtId}/slots`, {
      params,
      skipAuth: true,
    })
    const body = response.data
    if (body?.statusCode === 200 && Array.isArray(body?.data)) {
      return body.data
    }
    if (Array.isArray(body?.data)) return body.data
    if (Array.isArray(body)) return body
    return []
  } catch (error) {
    console.warn(`[bookingApi] Không thể lấy lưới ca cho sân con ${courtId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Bước 2: Lấy các ca trống theo ngày để vẽ lịch
 * GET /api/v1/facilities/{facilityId}/availability?date=YYYY-MM-DD
 * @param {string} facilityId - UUID cơ sở
 * @param {string} dateStr - Ngày theo định dạng YYYY-MM-DD (vd: '2026-10-19')
 * @returns {Promise<Object>} Dữ liệu ca trống của các sân con
 */
export async function getFacilityAvailability(facilityId, dateStr) {
  if (!facilityId) return null
  try {
    const params = {}
    if (dateStr) params.date = dateStr
    const response = await apiClient.get(`/api/v1/facilities/${facilityId}/availability`, {
      params,
      skipAuth: true,
    })
    return response.data?.data || response.data
  } catch (error) {
    console.warn(`[bookingApi] Không thể lấy availability của cơ sở ${facilityId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Bước 3: Đặt sân (Tạo đơn booking)
 * POST /api/v1/bookings
 * - Cách 1: courtSlotId + numberOfSlots (đặt N ca liên tiếp, tối đa 24)
 * - Cách 2: courtSlotIds (nhiều ca rời nhau)
 * Server tự tính giá.
 * @param {Object} payload
 * @param {string} [payload.courtSlotId] - UUID ca bắt đầu
 * @param {number} [payload.numberOfSlots] - Số ca liên tiếp (tối đa 24)
 * @param {string[]} [payload.courtSlotIds] - Danh sách UUID các ca rời nhau
 * @param {boolean} [payload.isSplitPayment] - Bật chia tiền đặt cọc
 * @param {string[]} [payload.participantIds] - Danh sách ID người tham gia nếu chia tiền
 * @returns {Promise<Object>} Đơn đặt sân đã tạo (status: PAID)
 */
export async function createBooking(payload) {
  try {
    const response = await apiClient.post(BOOKINGS_ENDPOINT, payload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[bookingApi] Lỗi khi tạo đơn đặt sân:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Bước 5: Lấy vé QR Check-in
 * GET /api/v1/bookings/{bookingId}/qr-ticket
 * @param {string} bookingId - UUID đơn booking
 * @returns {Promise<Object>} Thông tin vé QR check-in
 */
export async function getBookingQrTicket(bookingId) {
  if (!bookingId) return null
  try {
    const response = await apiClient.get(`${BOOKINGS_ENDPOINT}/${bookingId}/qr-ticket`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[bookingApi] Lỗi khi lấy vé QR cho booking ${bookingId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Bước 1 (Chia tiền): Tìm bạn bè theo số điện thoại để lấy userId (số điện thoại trả về đã được che)
 * GET /api/accounts/lookup?phone=...
 * @param {string} phone - Số điện thoại cần tìm
 * @returns {Promise<Object>} Thông tin tài khoản bạn bè ({ id, fullName, phone, email, ... })
 */
export async function lookupAccountByPhone(phone) {
  if (!phone || !phone.trim()) {
    throw new Error('Vui lòng nhập số điện thoại để tìm kiếm')
  }
  try {
    const response = await apiClient.get('/api/accounts/lookup', {
      params: { phone: phone.trim() },
    })
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[bookingApi] Không tìm thấy tài khoản với số điện thoại ${phone}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Lấy chi tiết đơn đặt sân
 * GET /api/v1/bookings/{bookingId}
 * @param {string} bookingId - UUID đơn đặt sân
 * @returns {Promise<Object>} Chi tiết đơn (status: PENDING | PAID | CHECKED_IN | CANCELLED, paymentDeadline, participants, ...)
 */
export async function getBookingById(bookingId) {
  if (!bookingId) return null
  try {
    const response = await apiClient.get(`${BOOKINGS_ENDPOINT}/${bookingId}`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[bookingApi] Lỗi khi lấy chi tiết đơn ${bookingId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Lấy danh sách đơn đặt sân của tôi
 * GET /api/v1/bookings/my-bookings
 * @param {string} [status] - Lọc theo trạng thái ('PENDING' | 'PAID' | 'CHECKED_IN' | 'CANCELLED')
 * @returns {Promise<Array>} Danh sách đơn đặt sân
 */
export async function getMyBookings(status) {
  try {
    const params = {}
    if (status) params.status = status
    const response = await apiClient.get(`${BOOKINGS_ENDPOINT}/my-bookings`, { params })
    const body = response.data
    if (body?.statusCode === 200 && Array.isArray(body?.data)) {
      return body.data
    }
    if (Array.isArray(body?.data)) return body.data
    if (Array.isArray(body)) return body
    return []
  } catch (error) {
    console.warn('[bookingApi] Lỗi khi lấy danh sách đơn đặt sân của tôi:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Bước 3 (Chia tiền): Người được mời tham gia góp tiền cho đơn đặt sân
 * POST /api/v1/bookings/{bookingId}/join
 * Mỗi người trả phần của mình (tiền giữ trong ví chính họ). Đủ người trả thì đơn chuyển PAID.
 * @param {string} bookingId - UUID đơn đặt sân
 * @returns {Promise<Object>} Kết quả góp tiền
 */
export async function joinBooking(bookingId) {
  if (!bookingId) throw new Error('bookingId không được để trống')
  try {
    const response = await apiClient.post(`${BOOKINGS_ENDPOINT}/${bookingId}/join`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[bookingApi] Lỗi khi tham gia góp tiền cho đơn ${bookingId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Bước 4 (Chia tiền): Người tạo trả nốt phần của người chưa góp để xác nhận đơn ngay
 * POST /api/v1/bookings/{bookingId}/pay-remaining
 * Người chưa góp bị bỏ khỏi đơn. Đơn chuyển ngay sang PAID.
 * @param {string} bookingId - UUID đơn đặt sân
 * @returns {Promise<Object>} Kết quả thanh toán phần còn lại
 */
export async function payRemainingBooking(bookingId) {
  if (!bookingId) throw new Error('bookingId không được để trống')
  try {
    const response = await apiClient.post(`${BOOKINGS_ENDPOINT}/${bookingId}/pay-remaining`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[bookingApi] Lỗi khi trả nốt phần còn lại cho đơn ${bookingId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Thêm người tham gia vào đơn chia tiền
 * POST /api/v1/bookings/{bookingId}/participants
 * @param {string} bookingId - UUID đơn đặt sân
 * @param {string[]} participantIds - Danh sách userId tham gia
 * @returns {Promise<Object>}
 */
export async function addBookingParticipants(bookingId, participantIds = []) {
  if (!bookingId) throw new Error('bookingId không được để trống')
  try {
    const response = await apiClient.post(`${BOOKINGS_ENDPOINT}/${bookingId}/participants`, {
      participantIds,
    })
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[bookingApi] Lỗi khi thêm người tham gia cho đơn ${bookingId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Lấy danh sách lý do hủy đặt sân từ hệ thống
 * GET /api/v1/bookings/cancellation-reasons
 * @returns {Promise<Array<{ code: number, label: string, isCustom: boolean }>>}
 */
export async function getCancellationReasons() {
  try {
    const response = await apiClient.get(`${BOOKINGS_ENDPOINT}/cancellation-reasons`, {
      skipAuth: true,
    })
    const body = response.data
    if (Array.isArray(body?.data)) return body.data
    if (Array.isArray(body)) return body
    return [
      { code: 1, label: 'Thay đổi lịch trình / Bận việc đột xuất', isCustom: false },
      { code: 2, label: 'Không đủ người chơi / Đồng đội hủy kèo', isCustom: false },
      { code: 3, label: 'Thời tiết xấu / Không thuận lợi di chuyển', isCustom: false },
      { code: 4, label: 'Đặt nhầm ngày, khung giờ hoặc nhầm sân', isCustom: false },
      { code: 5, label: 'Vấn đề sức khỏe / Chấn thương', isCustom: false },
      { code: 6, label: 'Khác (Tự nhập lý do)', isCustom: true },
    ]
  } catch (error) {
    console.warn('[bookingApi] Không thể lấy lý do hủy từ BE, sử dụng danh sách chuẩn:', error)
    return [
      { code: 1, label: 'Thay đổi lịch trình / Bận việc đột xuất', isCustom: false },
      { code: 2, label: 'Không đủ người chơi / Đồng đội hủy kèo', isCustom: false },
      { code: 3, label: 'Thời tiết xấu / Không thuận lợi di chuyển', isCustom: false },
      { code: 4, label: 'Đặt nhầm ngày, khung giờ hoặc nhầm sân', isCustom: false },
      { code: 5, label: 'Vấn đề sức khỏe / Chấn thương', isCustom: false },
      { code: 6, label: 'Khác (Tự nhập lý do)', isCustom: true },
    ]
  }
}

/**
 * Hủy đơn đặt sân và hoàn tiền
 * POST /api/v1/bookings/{bookingId}/cancel
 * - Hủy trước giờ chơi >= 24h: hoàn 100%
 * - Hủy dưới 24h: không hoàn tiền
 * - Đơn đã check-in (CHECKED_IN): không hủy được
 * - Đơn gắn kèo LFG: không hủy trực tiếp (phải hủy kèo qua POST /api/v1/lfgs/{cardId}/cancel)
 * @param {string} bookingId - UUID đơn đặt sân
 * @param {Object} [payload]
 * @param {number} [payload.reasonCode] - Mã lý do hủy (1..6)
 * @param {string} [payload.reason] - Nội dung lý do hủy
 * @returns {Promise<Object>} Kết quả hủy đơn
 */
export async function cancelBooking(bookingId, payload = {}) {
  if (!bookingId) throw new Error('bookingId không được để trống')
  try {
    const bodyPayload = {
      reasonCode: typeof payload.reasonCode === 'number' ? payload.reasonCode : (payload.reasonCode ? Number(payload.reasonCode) : null),
      reason: payload.reason ? String(payload.reason).trim() : null,
    }
    const response = await apiClient.post(`${BOOKINGS_ENDPOINT}/${bookingId}/cancel`, bodyPayload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[bookingApi] Lỗi khi hủy đơn ${bookingId}:`, error)
    throw normalizeApiError(error)
  }
}
