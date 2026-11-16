// Hiển thị giờ theo giờ Việt Nam (UTC+7).
// BE trả thời điểm dạng ISO DateTimeOffset theo UTC (vd "2026-11-10T01:00:00+00:00"),
// nên không được cắt chuỗi (.slice(11, 16)) mà phải quy đổi sang múi giờ Asia/Ho_Chi_Minh.

export const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh'

const clockFormat = new Intl.DateTimeFormat('en-GB', { timeZone: VN_TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

// "2026-11-10T01:00:00+00:00" → "08:00". Giờ trong ngày dạng "HH:mm[:ss]" (vd openTime) giữ nguyên "HH:mm".
export function vnClock(value) {
  if (!value) return ''
  if (typeof value === 'string') {
    const clock = value.trim().match(/^(\d{1,2}):(\d{2})(:\d{2}(\.\d+)?)?$/)
    if (clock) return `${clock[1].padStart(2, '0')}:${clock[2]}`
  }
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : clockFormat.format(date)
}

const csvDateFormat = new Intl.DateTimeFormat('en-GB', { timeZone: VN_TIME_ZONE, day: '2-digit', month: '2-digit', year: 'numeric' })

// Thời điểm cho file CSV: "11/11/2026 lúc 13:09" (giờ Việt Nam). Có chữ "lúc" nên Excel giữ nguyên là chữ,
// không tự đổi sang kiểu ngày giờ (kiểu ngày giờ hiện "###" khi cột hẹp)
export function csvDateTime(value) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : `${csvDateFormat.format(date)} lúc ${clockFormat.format(date)}`
}

const dateKeyFormat = new Intl.DateTimeFormat('en-CA', { timeZone: VN_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })

// "2026-11-10T18:00:00+00:00" → "2026-11-11" (ngày theo giờ Việt Nam, dạng yyyy-MM-dd)
export function vnDateKey(value) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : dateKeyFormat.format(date)
}
