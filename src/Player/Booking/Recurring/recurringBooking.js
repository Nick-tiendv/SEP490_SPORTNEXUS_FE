// Đặt sân định kỳ (lặp lại theo tuần) và gói định kỳ.
// Luật BE: "Gói định kỳ" = cùng ca (cùng giờ), cùng sân, cùng thứ, đặt liên tiếp từ BULK_MIN_WEEKS tuần trở lên.
// Gói định kỳ: không chia tiền (thanh toán trước toàn bộ); cơ sở bật isBulkDiscountEnabled thì giảm
// BULK_DISCOUNT_PERCENT% (FE hiển thị tạm tính, BE tính lại khi đặt).
import { vnClock, vnDateKey } from '../../../utils/vnTime.js'

export const BULK_MIN_WEEKS = 4
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

// Đơn là "Gói định kỳ" khi MỌI ca (nhóm theo sân + giờ + thứ) nằm trong chuỗi tuần liên tiếp dài từ BULK_MIN_WEEKS tuần.
// slots: [{ courtId, startTime, endTime }] (ca gốc từ BE). Đơn trộn ca lẻ thì không tính là gói.
export function isBulkPackage(slots) {
  if (!Array.isArray(slots) || slots.length < BULK_MIN_WEEKS) return false
  const groups = new Map()
  for (const slot of slots) {
    if (!slot?.startTime || !slot.courtId) return false
    const date = vnDateKey(slot.startTime)
    const key = `${slot.courtId}|${vnClock(slot.startTime)}|${vnClock(slot.endTime)}|${weekdayOf(date)}`
    groups.set(key, [...(groups.get(key) || []), date])
  }
  for (const dates of groups.values()) {
    const sorted = [...new Set(dates)].sort()
    if (sorted.length < BULK_MIN_WEEKS) return false
    for (let i = 1; i < sorted.length; i += 1) {
      if (toUtc(sorted[i]).getTime() - toUtc(sorted[i - 1]).getTime() !== 7 * DAY_MS) return false
    }
  }
  return true
}

// Giảm giá gói định kỳ: chỉ khi đơn là gói và cơ sở bật giảm giá.
export function bulkDiscount(total, isPackage, enabled) {
  const applies = Boolean(enabled) && Boolean(isPackage) && total > 0
  const amount = applies ? Math.round((total * BULK_DISCOUNT_PERCENT) / 100) : 0
  return { applies, amount, payable: total - amount }
}
