// Lưới ca dùng chung cho trang chi tiết sân và trang đặt sân trên bản đồ.
import { getCourtSlots } from '../../../api/player/bookingApi.js'
import { vnClock } from '../../../utils/vnTime.js'
import { findSameTimeSlot } from './recurringBooking.js'

const HOUR_MS = 60 * 60 * 1000

// Cơ sở bị tạm ngưng do khiếu nại quá hạn (BE: isSuspended): vẫn hiện sân, khóa đặt ca
export const FACILITY_SUSPENDED_TEXT = 'Sân đang tạm ngưng do có khiếu nại'
export const isFacilitySuspended = (facility) => facility?.isSuspended === true

// Ca còn đặt được
export const isSlotOpen = (slot) =>
  Boolean(slot) && String(slot.status || '').toLowerCase() === 'available' && slot.isBookable !== false && !slot.isPast

// Hiển thị đúng từng ca BE trả về (độ dài ca do chủ sân cấu hình: 1 tiếng, 2 tiếng…).
// Ca thiếu giờ kết thúc thì coi là 1 tiếng.
export function normalizeCourtSlots(rawSlots, defaultPrice = 0) {
  if (!Array.isArray(rawSlots)) return []
  return rawSlots
    .filter((s) => s?.id && s.startTime)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .map((s) => {
      const endTime = s.endTime || new Date(new Date(s.startTime).getTime() + HOUR_MS).toISOString()
      const durationHours = (new Date(endTime).getTime() - new Date(s.startTime).getTime()) / HOUR_MS || 1
      const slot = { ...s, endTime, price: Number(s.price) > 0 ? Number(s.price) : defaultPrice }
      return {
        ...slot,
        slotIds: [s.id],
        durationHours,
        rawSlots: [slot],
        formattedStart: vnClock(s.startTime) || '',
        formattedEnd: vnClock(endTime) || '',
      }
    })
}

// Với mỗi ngày lặp lại × mỗi ca mẫu { courtId, courtName, sportName, start, end, price }: tìm ca cùng giờ trên cùng sân con
// (GET /courts/{courtId}/slots?date=). status: 'ok' (còn trống) | 'taken' (đã có người đặt / khóa / đã qua)
// | 'missing' (chủ sân chưa mở ca giờ này).
export async function loadRepeatOccurrences(dates, templates) {
  const cache = new Map()
  const slotsOf = (courtId, date, price) => {
    const key = `${courtId}|${date}`
    if (!cache.has(key)) cache.set(key, getCourtSlots(courtId, date).then((raw) => normalizeCourtSlots(Array.isArray(raw) ? raw : [], price)))
    return cache.get(key)
  }
  const items = []
  for (const date of dates) {
    for (const template of templates) {
      const slot = findSameTimeSlot(await slotsOf(template.courtId, date, template.price), template)
      const status = !slot ? 'missing' : isSlotOpen(slot) ? 'ok' : 'taken'
      items.push({ ...template, date, status, slot: status === 'ok' ? { ...slot, courtName: template.courtName, courtId: template.courtId, sportName: template.sportName } : null })
    }
  }
  return items
}
