// So sánh kỳ: tháng này với tháng trước, quý này với quý trước (ngày theo giờ Việt Nam).
// Ngày lịch biểu diễn bằng Date lúc 00:00 UTC để cộng / trừ ngày không phụ thuộc múi giờ máy.

const DAY_MS = 86400000
const vnDayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' })
const vnToday = (now) => new Date(`${vnDayFormat.format(now)}T00:00:00Z`)
const toIso = (date) => date.toISOString().slice(0, 10)
const dayIndex = (date, from) => Math.round((date - from) / DAY_MS)

export const COMPARE_KINDS = { month: 'Tháng', quarter: 'Quý' }

// Khoảng ngày của kỳ hiện tại (tới hôm nay) và kỳ trước (trọn kỳ), dạng { from, to, length, label }.
export function comparePeriods(kind, now = new Date()) {
  const today = vnToday(now)
  const year = today.getUTCFullYear()
  const span = kind === 'quarter' ? 3 : 1
  const startMonth = Math.floor(today.getUTCMonth() / span) * span
  const currentFrom = new Date(Date.UTC(year, startMonth, 1))
  const currentEnd = new Date(Date.UTC(year, startMonth + span, 0))
  const previousFrom = new Date(Date.UTC(year, startMonth - span, 1))
  const previousTo = new Date(currentFrom.getTime() - DAY_MS)
  const label = (date) => (kind === 'quarter'
    ? `Quý ${Math.floor(date.getUTCMonth() / 3) + 1}/${date.getUTCFullYear()}`
    : `Tháng ${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`)
  return {
    current: { from: toIso(currentFrom), to: toIso(today), length: dayIndex(currentEnd, currentFrom) + 1, elapsed: dayIndex(today, currentFrom) + 1, label: label(currentFrom) },
    previous: { from: toIso(previousFrom), to: toIso(previousTo), length: dayIndex(previousTo, previousFrom) + 1, label: label(previousFrom) },
  }
}

// Cộng dồn số đơn theo ngày trong kỳ. days: [{ date, bookings }] từ API thống kê.
function cumulative(days, from, length) {
  const start = new Date(`${from}T00:00:00Z`)
  const perDay = Array(length).fill(0)
  for (const day of days || []) {
    const index = dayIndex(new Date(`${String(day.date).slice(0, 10)}T00:00:00Z`), start)
    if (index >= 0 && index < length) perDay[index] += Number(day.bookings) || 0
  }
  let sum = 0
  return perDay.map((value) => (sum += value))
}

// Dòng dữ liệu cho biểu đồ: ngày thứ n của kỳ, số đơn cộng dồn của kỳ trước và kỳ này
// (kỳ này để trống sau hôm nay để đường không đi ngang tới cuối kỳ).
export function buildComparisonRows(periods, previousDays, currentDays) {
  const { current, previous } = periods
  const prev = cumulative(previousDays, previous.from, previous.length)
  const curr = cumulative(currentDays, current.from, current.elapsed)
  const length = Math.max(previous.length, current.length)
  return Array.from({ length }, (_, index) => ({
    day: index + 1,
    previous: index < prev.length ? prev[index] : null,
    current: index < curr.length ? curr[index] : null,
  }))
}

// Tổng kỳ trước, kỳ này và số của kỳ trước tính tới cùng ngày (so sánh công bằng khi kỳ này chưa hết).
export function summarizeComparison(rows, periods) {
  const at = (index, key) => rows[Math.min(index, rows.length) - 1]?.[key] ?? 0
  const current = at(periods.current.elapsed, 'current')
  const previousTotal = at(periods.previous.length, 'previous')
  const previousSameDay = at(Math.min(periods.current.elapsed, periods.previous.length), 'previous')
  const change = previousSameDay > 0 ? ((current - previousSameDay) / previousSameDay) * 100 : null
  return { current, previousTotal, previousSameDay, change }
}
