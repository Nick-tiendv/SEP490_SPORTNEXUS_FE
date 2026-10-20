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
