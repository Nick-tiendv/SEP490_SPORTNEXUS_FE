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
