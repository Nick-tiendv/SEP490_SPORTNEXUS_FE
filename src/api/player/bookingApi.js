import apiClient, { normalizeApiError } from '../apiClient.js'

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
    if (Array.isArray(body?.data?.items)) return body.data.items
    if (Array.isArray(body)) return body
    return []
  } catch (error) {
    console.warn('[bookingApi] Lỗi khi lấy danh sách đơn đặt sân của tôi:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Lấy danh sách các trận/đơn đặt sân sắp tới của tôi
 * GET /api/v1/bookings/upcoming
 * @returns {Promise<Array>} Danh sách trận sắp tới
 */
export async function getUpcomingBookings() {
  try {
    const response = await apiClient.get(`${BOOKINGS_ENDPOINT}/upcoming`)
    const body = response.data
    const data = body?.data || body?.result || body
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.items)) return data.items
    return []
  } catch (error) {
    console.warn('[bookingApi] Lỗi khi lấy danh sách trận sắp tới:', error)
    return []
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

export const BOOKING_WINDOWS_STORAGE_KEY = 'sportnexus_booking_windows'
const BOOKING_GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh'
const SINGLE_SLOT_MAX_MS = 90 * 60 * 1000

const toClockVN = (value) => {
  if (!value) return ''
  if (typeof value === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(value.trim())) {
    const [hh, mm] = value.trim().split(':')
    return `${hh.padStart(2, '0')}:${mm}`
  }
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: VN_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)
}

const toDateVN = (value) => {
  if (!value) return ''
  if (typeof value === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value.trim())) return value.trim()
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('vi-VN', { timeZone: VN_TIME_ZONE })
}

const toDateKeyVN = (value) => {
  if (!value) return ''
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return value.trim()
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-CA', { timeZone: VN_TIME_ZONE }).format(d)
}

const buildVnIso = (dateKey, clockHHMM, addDays = 0) => {
  if (!dateKey || !clockHHMM) return null
  const m = String(clockHHMM).trim().match(/^(\d{1,2}):(\d{2})/)
  if (!m) return null
  let targetDate = dateKey
  if (addDays !== 0) {
    const [y, mo, da] = dateKey.split('-').map(Number)
    targetDate = new Date(Date.UTC(y, mo - 1, da + addDays)).toISOString().slice(0, 10)
  }
  return `${targetDate}T${m[1].padStart(2, '0')}:${m[2]}:00+07:00`
}

const collectBookingGuids = (input) => {
  const found = new Set()
  const add = (val) => {
    if (typeof val === 'string' && BOOKING_GUID_RE.test(val.trim())) {
      found.add(val.trim().toLowerCase())
    }
  }
  const visit = (node) => {
    if (!node) return
    if (typeof node === 'string') {
      add(node)
      return
    }
    if (Array.isArray(node)) {
      node.forEach(visit)
      return
    }
    if (typeof node === 'object') {
      add(node.id)
      add(node.bookingId)
      if (node.data) visit(node.data)
      if (Array.isArray(node.bookings)) visit(node.bookings)
      if (Array.isArray(node.items)) visit(node.items)
    }
  }
  visit(input)
  return [...found]
}

const formatContiguousSpans = (intervals) => {
  if (!Array.isArray(intervals) || intervals.length === 0) return ''
  const valid = intervals
    .map((x) => ({
      startTime: x?.startTime || x?.courtSlot?.startTime,
      endTime: x?.endTime || x?.courtSlot?.endTime,
    }))
    .filter((x) => x.startTime && x.endTime && !Number.isNaN(new Date(x.startTime).getTime()) && !Number.isNaN(new Date(x.endTime).getTime()))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  if (valid.length === 0) return ''

  const spans = []
  let curStart = valid[0].startTime
  let curEnd = valid[0].endTime
  for (let i = 1; i < valid.length; i += 1) {
    const next = valid[i]
    if (Math.abs(new Date(next.startTime).getTime() - new Date(curEnd).getTime()) <= 1000) {
      if (new Date(next.endTime).getTime() > new Date(curEnd).getTime()) curEnd = next.endTime
    } else {
      spans.push(`${toClockVN(curStart)} - ${toClockVN(curEnd)}`)
      curStart = next.startTime
      curEnd = next.endTime
    }
  }
  spans.push(`${toClockVN(curStart)} - ${toClockVN(curEnd)}`)
  return spans.join(', ')
}

/**
 * Lưu thông tin khung giờ phiên đặt sân nhiều ca theo bookingId để trang Vé QR (/qr-pass)
 * và danh sách vé luôn hiển thị đầy đủ tổng khung giờ đã đặt (vd: 10:00 - 12:00 cho 2 ca).
 */
export function saveBookingSessionWindow(bookingResult, meta = {}) {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    const ids = new Set(collectBookingGuids(bookingResult))
    if (meta.bookingId && BOOKING_GUID_RE.test(String(meta.bookingId).trim())) {
      ids.add(String(meta.bookingId).trim().toLowerCase())
    }
    if (ids.size === 0) return

    let startTime = meta.startTime || null
    let endTime = meta.endTime || null
    let slotLabel = typeof meta.slotLabel === 'string' ? meta.slotLabel.trim() : ''

    if (Array.isArray(meta.selectedSlots) && meta.selectedSlots.length > 0) {
      const validSlots = meta.selectedSlots
        .filter((s) => s?.startTime && s?.endTime && !Number.isNaN(new Date(s.startTime).getTime()))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      if (validSlots.length > 0) {
        startTime = startTime || validSlots[0].startTime
        endTime = endTime || validSlots[validSlots.length - 1].endTime
        slotLabel = slotLabel || formatContiguousSpans(validSlots)
      }
    }

    const dateKey = toDateKeyVN(meta.date || startTime)
    if ((!startTime || !endTime) && slotLabel && dateKey) {
      const rangeMatch = slotLabel.match(/^(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})$/)
      if (rangeMatch) {
        const [, sClock, eClock] = rangeMatch
        const sMin = Number(sClock.split(':')[0]) * 60 + Number(sClock.split(':')[1])
        const eMin = Number(eClock.split(':')[0]) * 60 + Number(eClock.split(':')[1])
        startTime = startTime || buildVnIso(dateKey, sClock, 0)
        endTime = endTime || buildVnIso(dateKey, eClock, eMin <= sMin ? 1 : 0)
      }
    }

    if (!slotLabel && startTime && endTime) {
      const sClock = toClockVN(startTime)
      const eClock = toClockVN(endTime)
      if (sClock && eClock) slotLabel = `${sClock} - ${eClock}`
    }

    if (!startTime && !endTime && !slotLabel) return

    const rawStore = JSON.parse(window.localStorage.getItem(BOOKING_WINDOWS_STORAGE_KEY) || '{}')
    const store = rawStore && typeof rawStore === 'object' ? rawStore : {}
    const now = Date.now()
    const entry = {
      startTime,
      endTime,
      slotLabel: slotLabel || null,
      numberOfSlots: Number(meta.numberOfSlots || meta.hours) || 1,
      totalAmount: Number(meta.totalAmount) || null,
      courtId: meta.courtId || null,
      courtName: meta.courtName || null,
      facilityId: meta.facilityId || null,
      facilityName: meta.facilityName || null,
      savedAt: now,
    }

    ids.forEach((id) => {
      store[id] = { ...(store[id] || {}), ...entry }
    })

    const trimmedEntries = Object.entries(store)
      .sort((a, b) => (Number(b[1]?.savedAt) || 0) - (Number(a[1]?.savedAt) || 0))
      .slice(0, 60)
    window.localStorage.setItem(BOOKING_WINDOWS_STORAGE_KEY, JSON.stringify(Object.fromEntries(trimmedEntries)))
  } catch {
    // Bỏ qua nếu trình duyệt chặn localStorage
  }
}

export function getSavedBookingSessionWindow(bookingId) {
  if (!bookingId || typeof window === 'undefined' || !window.localStorage) return null
  try {
    const key = String(bookingId).trim().toLowerCase()
    const store = JSON.parse(window.localStorage.getItem(BOOKING_WINDOWS_STORAGE_KEY) || '{}')
    return store?.[key] || null
  } catch {
    return null
  }
}

const extractExplicitSlotsSpan = (obj) => {
  if (!obj || typeof obj !== 'object') return null
  const slotList = [obj.slots, obj.courtSlots, obj.bookingSlots, obj.bookingDetails].find(
    (arr) => Array.isArray(arr) && arr.length > 0
  )
  if (slotList) {
    const valid = slotList
      .map((s) => ({
        startTime: s?.startTime || s?.courtSlot?.startTime,
        endTime: s?.endTime || s?.courtSlot?.endTime,
        price: Number(s?.price ?? s?.amount ?? s?.courtSlot?.price) || 0,
      }))
      .filter((s) => s.startTime && s.endTime && !Number.isNaN(new Date(s.startTime).getTime()) && !Number.isNaN(new Date(s.endTime).getTime()))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    if (valid.length > 0) {
      const sumAmount = valid.reduce((acc, s) => acc + s.price, 0)
      return {
        startTime: valid[0].startTime,
        endTime: valid[valid.length - 1].endTime,
        timeRangeLabel: formatContiguousSpans(valid),
        numberOfSlots: valid.length,
        totalAmount: Number(obj.paidAmount ?? obj.totalAmount) || (sumAmount > 0 ? sumAmount : null),
      }
    }
  }

  const slotCount = Number(obj.numberOfSlots ?? obj.slotCount ?? obj.totalSlots) || 0
  if (slotCount > 1 && obj.startTime && obj.endTime) {
    const startMs = new Date(obj.startTime).getTime()
    const endMs = new Date(obj.endTime).getTime()
    const durMs = endMs - startMs
    if (durMs > 0 && durMs <= SINGLE_SLOT_MAX_MS) {
      const extendedEnd = new Date(startMs + durMs * slotCount).toISOString()
      return {
        startTime: obj.startTime,
        endTime: extendedEnd,
        timeRangeLabel: `${toClockVN(obj.startTime)} - ${toClockVN(extendedEnd)}`,
        numberOfSlots: slotCount,
        totalAmount: Number(obj.paidAmount ?? obj.totalAmount) || null,
      }
    }
  }
  return null
}

/**
 * Đọc số ca liên tiếp & tổng tiền từ thông báo BOOKING của Backend
 * (vd: "Bạn đã đặt 2 ca liên tiếp tại Hà Nội Badminton Center - Sân lucky, bắt đầu 10:00 30/10/2026. Đã thanh toán 2,000đ.")
 */
export function extractNotificationBookingHint(notifications, bookingId, detail = null) {
  if (!Array.isArray(notifications) || notifications.length === 0) return null
  const targetId = bookingId ? String(bookingId).trim().toLowerCase() : ''

  let matched = targetId
    ? notifications.find((n) => String(n?.referenceId || '').trim().toLowerCase() === targetId)
    : null

  if (!matched && detail?.startTime) {
    const startClock = toClockVN(detail.startTime)
    const startDate = toDateVN(detail.startTime)
    const courtLabel = String(detail.courtName || detail.facilityName || '').trim().toLowerCase()
    if (startClock && startDate && courtLabel) {
      matched = notifications.find((n) => {
        const text = String(n?.body || n?.message || '')
        const lower = text.toLowerCase()
        return lower.includes(courtLabel) && text.includes(startClock) && text.includes(startDate)
      })
    }
  }

  if (!matched) return null
  const text = String(matched.body || matched.message || '')
  const slotMatch =
    text.match(/đặt\s+(\d+)\s+ca(?:\s+liên\s+tiếp)?/i) ||
    text.match(/(\d+)\s+consecutive\s+slots?/i)
  const slotCount = slotMatch ? Number(slotMatch[1]) : 0
  if (!Number.isFinite(slotCount) || slotCount < 2) return null

  const amountMatch = text.match(/thanh\s+toán\s+([\d.,]+)\s*đ/i)
  const paidAmount = amountMatch ? Number(amountMatch[1].replace(/[.,]/g, '')) : null

  return {
    slotCount,
    paidAmount: Number.isFinite(paidAmount) && paidAmount > 0 ? paidAmount : null,
  }
}

let cachedNotifPromise = null
let cachedNotifAt = 0

async function fetchRecentNotificationsSafe() {
  const now = Date.now()
  if (cachedNotifPromise && now - cachedNotifAt < 15000) {
    return cachedNotifPromise
  }
  cachedNotifAt = now
  cachedNotifPromise = apiClient
    .get('/api/v1/notifications', { params: { Page: 1, PageSize: 30 } })
    .then((res) => {
      const body = res?.data
      const data = body?.data ?? body?.result ?? body
      if (Array.isArray(data?.items)) return data.items
      if (Array.isArray(data)) return data
      return []
    })
    .catch(() => [])
  return cachedNotifPromise
}

const attachBookingDisplayFields = (item) => {
  const sClock = toClockVN(item.startTime)
  const eClock = toClockVN(item.endTime)
  const rangeLabel = item.timeRangeLabel || (sClock && eClock ? `${sClock} - ${eClock}` : '')
  const playDate = item.playDate || toDateVN(item.startTime) || ''
  const normalizedStatus = String(item.bookingStatus || item.status || 'PAID').toUpperCase()
  return {
    ...item,
    status: item.bookingStatus || item.status || normalizedStatus,
    bookingStatus: item.bookingStatus || item.status || normalizedStatus,
    ...(playDate ? { playDate } : {}),
    ...(rangeLabel ? { displayTimeRange: rangeLabel } : {}),
  }
}

/**
 * Gom các ca đặt sân liên tiếp của cùng 1 phiên đặt (cùng sân, cùng trạng thái, giờ nối tiếp nhau)
 * và đồng bộ khung giờ đầy đủ từ bộ nhớ phiên / thông báo của hệ thống.
 */
export function groupConsecutiveBookings(bookings, notifications = []) {
  if (!Array.isArray(bookings) || bookings.length === 0) return []

  const seen = new Set()
  const indexed = []
  bookings.forEach((raw, idx) => {
    if (!raw || typeof raw !== 'object') return
    const id = String(raw.bookingId || raw.id || `idx-${idx}`)
    const dedupeKey = id.toLowerCase()
    if (seen.has(dedupeKey)) return
    seen.add(dedupeKey)
    indexed.push({ raw, id, origIdx: idx })
  })

  const buckets = new Map()
  const unbucketed = []
  indexed.forEach((entry) => {
    const b = entry.raw
    const facKey = String(b.facilityId || b.facilityName || '').trim().toLowerCase()
    const courtKey = String(b.courtId || b.courtName || '').trim().toLowerCase()
    const statusKey = String(b.bookingStatus || b.status || '').trim().toUpperCase()
    const startMs = b.startTime ? new Date(b.startTime).getTime() : NaN
    const endMs = b.endTime ? new Date(b.endTime).getTime() : NaN
    if ((!facKey && !courtKey) || Number.isNaN(startMs) || Number.isNaN(endMs)) {
      unbucketed.push({
        origIdx: entry.origIdx,
        item: attachBookingDisplayFields({ ...b, id: b.id || entry.id, bookingId: b.bookingId || entry.id }),
      })
      return
    }
    const key = `${facKey}|${courtKey}|${statusKey}`
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key).push({ ...entry, startMs, endMs })
  })

  const mergedEntries = [...unbucketed]

  const creationNotifIds = new Set(
    (Array.isArray(notifications) ? notifications : [])
      .filter((n) => {
        const t = String(n?.type || '').toUpperCase()
        const title = String(n?.title || '').toLowerCase()
        return (t === 'BOOKING' || title.includes('đặt sân')) && n?.referenceId
      })
      .map((n) => String(n.referenceId).trim().toLowerCase())
  )

  buckets.forEach((entries) => {
    entries.sort((a, b) => a.startMs - b.startMs)
    const groups = []
    entries.forEach((curr) => {
      const prevGroup = groups[groups.length - 1]
      if (!prevGroup) {
        groups.push([curr])
        return
      }
      const prev = prevGroup[prevGroup.length - 1]
      const isBackToBack = Math.abs(curr.startMs - prev.endMs) <= 1000
      let sameBatch = true
      if (prev.raw.createdAt && curr.raw.createdAt) {
        const diffCreated = Math.abs(new Date(curr.raw.createdAt).getTime() - new Date(prev.raw.createdAt).getTime())
        if (Number.isFinite(diffCreated) && diffCreated > 120000) sameBatch = false
      }
      const firstIdLower = String(prevGroup[0].id || '').trim().toLowerCase()
      const currIdLower = String(curr.id || '').trim().toLowerCase()
      if (currIdLower && currIdLower !== firstIdLower && creationNotifIds.has(currIdLower)) {
        sameBatch = false
      }
      const groupHint = extractNotificationBookingHint(notifications, prevGroup[0].id, prevGroup[0].raw)
      if (groupHint?.slotCount > 1 && prevGroup.length >= groupHint.slotCount) {
        sameBatch = false
      }
      if (isBackToBack && sameBatch) {
        prevGroup.push(curr)
      } else {
        groups.push([curr])
      }
    })

    groups.forEach((group) => {
      const first = group[0]
      const last = group[group.length - 1]
      const origIdx = Math.min(...group.map((g) => g.origIdx))

      if (group.length > 1) {
        const totalAmount = group.reduce((sum, g) => sum + (Number(g.raw.totalAmount ?? g.raw.totalPrice ?? g.raw.price) || 0), 0)
        const hasPaid = group.some((g) => g.raw.paidAmount !== undefined && g.raw.paidAmount !== null)
        const paidAmount = hasPaid ? group.reduce((sum, g) => sum + (Number(g.raw.paidAmount) || 0), 0) : first.raw.paidAmount
        const groupedIds = group.map((g) => g.id)
        const groupedSlots = group.map((g) => ({
          bookingId: g.id,
          startTime: g.raw.startTime,
          endTime: g.raw.endTime,
          status: g.raw.bookingStatus || g.raw.status,
          totalAmount: Number(g.raw.totalAmount) || 0,
        }))
        const merged = attachBookingDisplayFields({
          ...first.raw,
          id: first.raw.id || first.id,
          bookingId: first.raw.bookingId || first.id,
          startTime: first.raw.startTime,
          endTime: last.raw.endTime,
          totalAmount: totalAmount || first.raw.totalAmount,
          ...(hasPaid ? { paidAmount } : {}),
          numberOfSlots: group.length,
          groupedBookingIds: groupedIds,
          groupedSlots,
        })
        mergedEntries.push({ origIdx, item: merged })
        return
      }

      // Trường hợp 1 bản ghi đơn lẻ: kiểm tra metadata nhiều ca từ response, localStorage hoặc thông báo BE
      let single = {
        ...first.raw,
        id: first.raw.id || first.id,
        bookingId: first.raw.bookingId || first.id,
      }
      const durMs = first.endMs - first.startMs
      if (durMs > 0 && durMs <= SINGLE_SLOT_MAX_MS) {
        const explicit = extractExplicitSlotsSpan(single)
        const saved = !explicit ? getSavedBookingSessionWindow(first.id) : null
        const notifHint = !explicit && !saved ? extractNotificationBookingHint(notifications, first.id, single) : null

        if (explicit && new Date(explicit.endTime).getTime() > first.endMs) {
          single = {
            ...single,
            startTime: explicit.startTime,
            endTime: explicit.endTime,
            timeRangeLabel: explicit.timeRangeLabel,
            numberOfSlots: explicit.numberOfSlots,
          }
        } else if (saved?.endTime && new Date(saved.endTime).getTime() > first.endMs) {
          single = {
            ...single,
            startTime: saved.startTime || single.startTime,
            endTime: saved.endTime,
            timeRangeLabel: saved.slotLabel || undefined,
            numberOfSlots: saved.numberOfSlots || single.numberOfSlots,
            totalAmount: Math.max(Number(single.totalAmount) || 0, Number(saved.totalAmount) || 0) || single.totalAmount,
          }
        } else if (notifHint?.slotCount > 1) {
          const extendedEnd = new Date(first.startMs + durMs * notifHint.slotCount).toISOString()
          single = {
            ...single,
            endTime: extendedEnd,
            numberOfSlots: notifHint.slotCount,
            totalAmount: Math.max(Number(single.totalAmount) || 0, Number(notifHint.paidAmount) || 0) || single.totalAmount,
          }
          saveBookingSessionWindow({ id: first.id }, {
            startTime: single.startTime,
            endTime: extendedEnd,
            numberOfSlots: notifHint.slotCount,
            totalAmount: single.totalAmount,
          })
        }
      }

      mergedEntries.push({ origIdx, item: attachBookingDisplayFields(single) })
    })
  })

  mergedEntries.sort((a, b) => a.origIdx - b.origIdx)
  return mergedEntries.map((e) => e.item)
}

/**
 * Làm giàu danh sách đơn đặt sân của người chơi (gộp các ca liên tiếp + đồng bộ số ca từ thông báo BE).
 */
export async function enrichPlayerBookings(bookings) {
  if (!Array.isArray(bookings) || bookings.length === 0) return []
  const notifications = await fetchRecentNotificationsSafe()
  return groupConsecutiveBookings(bookings, notifications)
}

async function resolveCourtIdForBooking(detail) {
  if (detail?.courtId && BOOKING_GUID_RE.test(String(detail.courtId))) return String(detail.courtId)
  if (!detail?.facilityId || !detail?.courtName) return null
  try {
    const res = await apiClient.get(`/api/v1/facilities/${encodeURIComponent(detail.facilityId)}`, { skipAuth: true })
    const fac = res?.data?.data || res?.data
    const courts = Array.isArray(fac?.courts) ? fac.courts : []
    const targetName = String(detail.courtName).trim().toLowerCase()
    const matched = courts.find((c) => String(c?.name || c?.courtName || '').trim().toLowerCase() === targetName)
    return matched?.id || matched?.courtId || null
  } catch {
    return null
  }
}

/**
 * Xác định chính xác khung giờ chơi & khung check-in của đơn đặt sân nhiều ca cho trang Vé QR (/qr-pass).
 */
export async function resolveBookingPlayWindow(detail, options = {}) {
  const bookingId = options.bookingId || detail?.bookingId || detail?.id || null
  const qr = options.qr && typeof options.qr === 'object' ? options.qr : null
  const baseStart = detail?.startTime || qr?.startTime || null
  const baseEnd = detail?.endTime || qr?.endTime || null
  const baseAmount = Number(detail?.paidAmount ?? detail?.totalAmount) || 0

  if (!baseStart || !baseEnd) {
    return {
      startTime: baseStart,
      endTime: baseEnd,
      timeRangeLabel: null,
      numberOfSlots: 1,
      totalAmount: baseAmount,
      groupedBookingIds: bookingId ? [String(bookingId)] : [],
      groupedSlots: [],
    }
  }

  const startMs = new Date(baseStart).getTime()
  const endMs = new Date(baseEnd).getTime()
  const durMs = endMs - startMs

  // 1. Trường hợp response có sẵn mảng slots hoặc numberOfSlots > 1
  const explicit = extractExplicitSlotsSpan(detail) || extractExplicitSlotsSpan(qr)
  if (explicit && new Date(explicit.endTime).getTime() > endMs) {
    saveBookingSessionWindow({ id: bookingId }, explicit)
    return {
      ...explicit,
      totalAmount: explicit.totalAmount || baseAmount,
      groupedBookingIds: bookingId ? [String(bookingId)] : [],
      groupedSlots: [],
    }
  }

  // 2. Trường hợp BE tách mỗi ca 1 giờ thành các bản ghi liên tiếp trong my-bookings / upcoming
  const candidateList = [
    ...(Array.isArray(options.upcomingBookings) ? options.upcomingBookings : []),
    ...(Array.isArray(options.myBookings) ? options.myBookings : []),
  ]
  if (bookingId && candidateList.length > 0) {
    const step2Notifications = Array.isArray(options.notifications) && options.notifications.length > 0
      ? options.notifications
      : await fetchRecentNotificationsSafe()
    const grouped = groupConsecutiveBookings(candidateList, step2Notifications)
    const targetLower = String(bookingId).trim().toLowerCase()
    const matchedGroup = grouped.find(
      (g) =>
        String(g.bookingId || g.id || '').trim().toLowerCase() === targetLower ||
        (Array.isArray(g.groupedBookingIds) && g.groupedBookingIds.some((gid) => String(gid).trim().toLowerCase() === targetLower))
    )
    if (matchedGroup && (new Date(matchedGroup.endTime).getTime() > endMs || new Date(matchedGroup.startTime).getTime() < startMs)) {
      saveBookingSessionWindow(matchedGroup.groupedBookingIds || { id: bookingId }, {
        startTime: matchedGroup.startTime,
        endTime: matchedGroup.endTime,
        numberOfSlots: matchedGroup.numberOfSlots,
        totalAmount: matchedGroup.totalAmount,
      })
      return {
        startTime: matchedGroup.startTime,
        endTime: matchedGroup.endTime,
        timeRangeLabel: matchedGroup.displayTimeRange || `${toClockVN(matchedGroup.startTime)} - ${toClockVN(matchedGroup.endTime)}`,
        numberOfSlots: matchedGroup.numberOfSlots || 2,
        totalAmount: Number(matchedGroup.paidAmount ?? matchedGroup.totalAmount) || baseAmount,
        groupedBookingIds: matchedGroup.groupedBookingIds || [String(bookingId)],
        groupedSlots: matchedGroup.groupedSlots || [],
      }
    }
  }

  // 3. Trường hợp có thông tin phiên đặt sân đã lưu trong localStorage khi thanh toán tại SplitPayment
  const saved = getSavedBookingSessionWindow(bookingId)
  if (saved) {
    const savedEndMs = saved.endTime ? new Date(saved.endTime).getTime() : NaN
    if ((Number.isFinite(savedEndMs) && savedEndMs > endMs) || (saved.slotLabel && saved.numberOfSlots > 1)) {
      const finalStart = saved.startTime || baseStart
      const finalEnd = Number.isFinite(savedEndMs) && savedEndMs > endMs
        ? saved.endTime
        : (durMs > 0 && durMs <= SINGLE_SLOT_MAX_MS && saved.numberOfSlots > 1
          ? new Date(startMs + durMs * saved.numberOfSlots).toISOString()
          : baseEnd)
      return {
        startTime: finalStart,
        endTime: finalEnd,
        timeRangeLabel: saved.slotLabel || `${toClockVN(finalStart)} - ${toClockVN(finalEnd)}`,
        numberOfSlots: Number(saved.numberOfSlots) || 2,
        totalAmount: Math.max(baseAmount, Number(saved.totalAmount) || 0),
        groupedBookingIds: bookingId ? [String(bookingId)] : [],
        groupedSlots: [],
      }
    }
  }

  // 4. Đối chiếu thông báo BOOKING của Backend ("Bạn đã đặt N ca liên tiếp...") và lưới ca thực tế
  if (durMs > 0 && durMs <= SINGLE_SLOT_MAX_MS) {
    const notifications = Array.isArray(options.notifications) && options.notifications.length > 0
      ? options.notifications
      : await fetchRecentNotificationsSafe()
    const notifHint = extractNotificationBookingHint(notifications, bookingId, detail)
    if (notifHint?.slotCount > 1) {
      const extendedEnd = new Date(startMs + durMs * notifHint.slotCount).toISOString()
      const resolvedAmount = Math.max(baseAmount, Number(notifHint.paidAmount) || 0)
      const resolved = {
        startTime: baseStart,
        endTime: extendedEnd,
        timeRangeLabel: `${toClockVN(baseStart)} - ${toClockVN(extendedEnd)}`,
        numberOfSlots: notifHint.slotCount,
        totalAmount: resolvedAmount,
        groupedBookingIds: bookingId ? [String(bookingId)] : [],
        groupedSlots: [],
      }
      saveBookingSessionWindow({ id: bookingId }, resolved)
      return resolved
    }

    // 5. Đối chiếu tổng tiền đơn (totalAmount) với giá từng ca liên tiếp đã đặt trên sân con
    const totalToMatch = Number(detail?.totalAmount ?? detail?.paidAmount) || 0
    if (totalToMatch > 0) {
      const courtId = await resolveCourtIdForBooking(detail)
      const dateKey = toDateKeyVN(baseStart)
      if (courtId && dateKey) {
        const courtSlots = await getCourtSlots(courtId, dateKey).catch(() => [])
        if (Array.isArray(courtSlots) && courtSlots.length > 0) {
          const ordered = [...courtSlots].sort(
            (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          )
          const anchorIdx = ordered.findIndex(
            (s) => Math.abs(new Date(s.startTime).getTime() - startMs) <= 60000
          )
          if (anchorIdx >= 0) {
            const anchorPrice = Number(ordered[anchorIdx].price) || 0
            if (anchorPrice > 0 && totalToMatch > anchorPrice + 0.5) {
              let accPrice = anchorPrice
              let lastEnd = ordered[anchorIdx].endTime
              let slotCount = 1
              for (let i = anchorIdx + 1; i < ordered.length; i += 1) {
                const prevEnd = new Date(ordered[i - 1].endTime).getTime()
                const curStart = new Date(ordered[i].startTime).getTime()
                const curStatus = String(ordered[i].status || '').toLowerCase()
                const curPrice = Number(ordered[i].price) || 0
                if (Math.abs(curStart - prevEnd) > 1000) break
                if (curStatus === 'available' || curPrice <= 0) break
                if (accPrice + curPrice > totalToMatch + 0.5) break
                accPrice += curPrice
                lastEnd = ordered[i].endTime
                slotCount += 1
                if (Math.abs(accPrice - totalToMatch) <= 1) break
              }
              if (slotCount > 1 && Math.abs(accPrice - totalToMatch) <= 1) {
                const resolved = {
                  startTime: baseStart,
                  endTime: lastEnd,
                  timeRangeLabel: `${toClockVN(baseStart)} - ${toClockVN(lastEnd)}`,
                  numberOfSlots: slotCount,
                  totalAmount: baseAmount || totalToMatch,
                  groupedBookingIds: bookingId ? [String(bookingId)] : [],
                  groupedSlots: [],
                }
                saveBookingSessionWindow({ id: bookingId }, resolved)
                return resolved
              }
            }
          }
        }
      }
    }
  }

  return {
    startTime: baseStart,
    endTime: baseEnd,
    timeRangeLabel: `${toClockVN(baseStart)} - ${toClockVN(baseEnd)}`,
    numberOfSlots: 1,
    totalAmount: baseAmount,
    groupedBookingIds: bookingId ? [String(bookingId)] : [],
    groupedSlots: [],
  }
}

export default {
  getCourtSlots,
  getFacilityAvailability,
  createBooking,
  getBookingQrTicket,
  lookupAccountByPhone,
  getBookingById,
  getMyBookings,
  getUpcomingBookings,
  joinBooking,
  payRemainingBooking,
  addBookingParticipants,
  getCancellationReasons,
  cancelBooking,
  saveBookingSessionWindow,
  getSavedBookingSessionWindow,
  extractNotificationBookingHint,
  groupConsecutiveBookings,
  enrichPlayerBookings,
  resolveBookingPlayWindow,
}
