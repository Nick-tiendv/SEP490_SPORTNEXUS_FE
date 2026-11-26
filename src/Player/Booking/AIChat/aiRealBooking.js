// aiRealBooking.js — Tiện ích cho gợi ý sân / ca thật từ Backend AI (giờ Việt Nam, state trang thanh toán)

const VN_TZ = 'Asia/Ho_Chi_Minh'

// Ngày chơi theo giờ Việt Nam dạng YYYY-MM-DD (BE trả thời điểm UTC)
export const vnDateOf = (iso) => new Intl.DateTimeFormat('en-CA', { timeZone: VN_TZ }).format(new Date(iso))
export const vnClock = (iso) => new Date(iso).toLocaleTimeString('vi-VN', { timeZone: VN_TZ, hour: '2-digit', minute: '2-digit', hour12: false })
export const vnDayLabel = (iso) => new Date(iso).toLocaleDateString('vi-VN', { timeZone: VN_TZ, day: '2-digit', month: '2-digit', year: 'numeric' })

/** State cho trang /split-payment từ 1 ca thật mà AI gợi ý (AiFacilitySuggestion + AiSlotSuggestion) */
export function buildPaymentState(facility, slot) {
  const hours = Math.max(0.5, (new Date(slot.endTime) - new Date(slot.startTime)) / 3600000)
  const price = Number(slot.price) || 0
  return {
    facilityId: facility.facilityId,
    courtId: slot.courtId,
    subCourtId: slot.courtId,
    court: facility.facilityName,
    address: facility.address || '',
    subCourt: slot.courtName,
    sport: facility.sportName,
    slot: `${vnClock(slot.startTime)} - ${vnClock(slot.endTime)}`,
    hours,
    total: price,
    hourlyRate: Math.round(price / hours),
    courtSlotId: slot.courtSlotId,
    courtSlotIds: [slot.courtSlotId],
    numberOfSlots: 1,
    isConsecutive: true,
    date: vnDateOf(slot.startTime),
    dateLabel: vnDayLabel(slot.startTime),
  }
}

// Kết quả đặt sân (cùng dạng POST /api/v1/bookings): 1 đơn, mảng đơn hoặc { bookings: [...] }
const bookingsOf = (result) =>
  Array.isArray(result) ? result : Array.isArray(result?.bookings) ? result.bookings : result && typeof result === 'object' ? [result] : []
const amountOf = (b) => Number(b?.totalAmountPaid ?? b?.totalAmount ?? b?.paidAmount) || 0

/** Tổng tiền BE tính lúc đặt (giá có thể khác lúc AI gợi ý); không đọc được thì null */
export function bookingTotalOf(result) {
  const top = result && !Array.isArray(result) && Array.isArray(result.bookings) ? amountOf(result) : 0
  const total = top || bookingsOf(result).reduce((sum, b) => sum + amountOf(b), 0)
  return total > 0 ? total : null
}

/** BE quyết định có thật sự tạo đơn chia tiền hay không (isSplitPayment trên đơn) */
export const isSplitBookingResult = (result) => result?.isSplitPayment === true || bookingsOf(result).some((b) => b?.isSplitPayment === true)

/** Tin của bot đã có card sân / kèo / giải thì chỉ giữ câu dẫn (đoạn trước "\n\n" đầu tiên), danh sách hiện bằng card */
export function aiLeadText(msg) {
  const text = String(msg?.text || '')
  const hasCards = [msg?.facilities, msg?.lfgCards, msg?.tournaments].some((list) => Array.isArray(list) && list.length > 0)
  if (msg?.sender !== 'bot' || !hasCards) return text
  const lead = text.split('\n\n')[0].trim()
  return lead || text
}

/** "Vừa xong", "5 phút trước", "3 giờ trước", "2 ngày trước", quá 7 ngày thì ghi ngày (giờ Việt Nam) */
export function relativeTimeVi(iso, now = Date.now()) {
  const at = iso ? new Date(iso).getTime() : NaN
  if (!Number.isFinite(at)) return ''
  const minutes = Math.floor((now - at) / 60000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} giờ trước`
  if (minutes < 7 * 24 * 60) return `${Math.floor(minutes / 1440)} ngày trước`
  return vnDayLabel(iso)
}

/** Cắt ngắn tin nhắn cuối cho danh sách phiên (mặc định 80 ký tự) */
export const truncateText = (text, max = 80) => {
  const s = String(text || '').replace(/\s+/g, ' ').trim()
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}
