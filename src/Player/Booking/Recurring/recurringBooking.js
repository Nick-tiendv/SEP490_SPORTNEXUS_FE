// Đặt sân định kỳ (lặp lại theo tuần) và giảm giá đặt gói.
// BE: POST /bookings nhận courtSlotIds của nhiều ngày; từ BULK_MIN_SLOTS ca trở lên và cơ sở bật
// isBulkDiscountEnabled thì giảm BULK_DISCOUNT_PERCENT% (FE hiển thị tạm tính, BE tính lại khi đặt).

export const BULK_MIN_SLOTS = 4
export const BULK_DISCOUNT_PERCENT = 10
export const REPEAT_WEEK_OPTIONS = [2, 3, 4, 5, 6, 7, 8]
// Thứ trong tuần theo Date.getDay(): 1 = Thứ 2 … 6 = Thứ 7, 0 = Chủ nhật
export const WEEKDAYS = [
  { value: 1, short: 'T2' }, { value: 2, short: 'T3' }, { value: 3, short: 'T4' }, { value: 4, short: 'T5' },
  { value: 5, short: 'T6' }, { value: 6, short: 'T7' }, { value: 0, short: 'CN' },
]

const DAY_MS = 24 * 60 * 60 * 1000
const toUtc = (dateStr) => new Date(`${dateStr}T00:00:00Z`)

export const weekdayOf = (dateStr) => toUtc(dateStr).getUTCDay()
export const weekdayShort = (dateStr) => WEEKDAYS.find((d) => d.value === weekdayOf(dateStr))?.short || ''
// "T2 24/11"
export const formatRepeatDate = (dateStr) => `${weekdayShort(dateStr)} ${dateStr.slice(8, 10)}/${dateStr.slice(5, 7)}`

// Các ngày lặp lại (không gồm ngày gốc) trong `weeks` tuần tính từ ngày gốc, rơi vào các thứ đã chọn.
// Vd ngày gốc T2 17/11, chọn T2 + T6, 3 tuần → T6 21/11, T2 24/11, T6 28/11, T2 01/12, T6 05/12.
export function buildRepeatDates(baseDateStr, weekdays, weeks) {
  if (!baseDateStr || !weeks || weeks < 1) return []
  const wanted = new Set(weekdays)
  const base = toUtc(baseDateStr).getTime()
  const dates = []
  for (let offset = 1; offset < weeks * 7; offset += 1) {
    const date = new Date(base + offset * DAY_MS)
    if (wanted.has(date.getUTCDay())) dates.push(date.toISOString().slice(0, 10))
  }
  return dates
}

// Ca cùng giờ bắt đầu và kết thúc với ca mẫu trong lưới ca của một ngày khác.
export const findSameTimeSlot = (slots, template) =>
  (slots || []).find((slot) => slot.formattedStart === template.start && slot.formattedEnd === template.end) || null

// Giảm giá đặt gói: chỉ khi cơ sở bật và đơn có từ BULK_MIN_SLOTS ca.
export function bulkDiscount(total, slotCount, enabled) {
  const applies = Boolean(enabled) && slotCount >= BULK_MIN_SLOTS && total > 0
  const amount = applies ? Math.round((total * BULK_DISCOUNT_PERCENT) / 100) : 0
  return { applies, amount, payable: total - amount }
}
