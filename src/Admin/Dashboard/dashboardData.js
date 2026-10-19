// Cấu hình và hàm tiện ích cho Admin Dashboard (dữ liệu thật lấy qua src/api/admin/dashboardApi.js).

export const PERIODS = ['Hôm nay', 'Tháng này', 'Quý này']
export const TREND_RANGES = { '7 ngày': 7, '30 ngày': 30, '90 ngày': 90 }
// Số bản ghi tối đa lấy về để tổng hợp biểu đồ / môn thể thao phía FE.
export const AGGREGATE_PAGE_SIZE = 1000

const startOfDay = date => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
export const toApiDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

// Trả về khoảng hiện tại và khoảng liền trước có cùng độ dài để tính % tăng trưởng.
export function periodRange(period, now = new Date()) {
  const today = startOfDay(now)
  let from
  if (period === 'Hôm nay') from = today
  else if (period === 'Quý này') from = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)
  else from = new Date(today.getFullYear(), today.getMonth(), 1)
  const length = Math.round((today - from) / 86400000) + 1
  return {
    current: { DateFrom: toApiDate(from), DateTo: toApiDate(today) },
    previous: { DateFrom: toApiDate(addDays(from, -length)), DateTo: toApiDate(addDays(from, -1)) },
  }
}
export function lastDaysRange(days, now = new Date()) {
  const today = startOfDay(now)
  return { from: addDays(today, -(days - 1)), to: today }
}

export const formatNumber = value => (Number.isFinite(value) ? value.toLocaleString('vi-VN') : '—')
export const formatCurrency = value => (Number.isFinite(value) ? `${value.toLocaleString('vi-VN')} ₫` : '—')
export function growth(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return undefined
  const percent = ((current - previous) / previous) * 100
  return `${percent >= 0 ? '+' : ''}${percent.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`
}
export function formatDate(value) {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('vi-VN') : '—'
}
export function formatTime(value) {
  if (!value) return ''
  if (/^\d{1,2}:\d{2}/.test(value)) return value.slice(0, 5)
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

// Gom dữ liệu byDay của API dashboard theo ngày (hoặc theo tuần khi khoảng dài) cho biểu đồ xu hướng.
export function buildTrendSeries(byDay, days, now = new Date()) {
  const { from } = lastDaysRange(days, now)
  const bucketDays = days > 30 ? 7 : 1
  const buckets = Array.from({ length: Math.ceil(days / bucketDays) }, (_, index) => ({ start: addDays(from, index * bucketDays), revenue: 0, bookings: 0, newUsers: 0 }))
  for (const day of byDay) {
    const date = day.date ? new Date(day.date) : null
    if (!date || Number.isNaN(date.getTime())) continue
    const index = Math.floor(Math.round((startOfDay(date) - from) / 86400000) / bucketDays)
    if (index < 0 || index >= buckets.length) continue
    buckets[index].bookings += day.bookings
    buckets[index].revenue += day.bookingGrossValue
    buckets[index].newUsers += day.newUsers
  }
  return buckets.map(bucket => ({ ...bucket, label: bucket.start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) }))
}

// Tỷ lệ booking theo môn thể thao.
export function buildSportShares(bookings) {
  const counts = new Map()
  for (const { sport } of bookings) if (sport) counts.set(sport, (counts.get(sport) || 0) + 1)
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0)
  const max = Math.max(0, ...counts.values())
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({
    name,
    count: `${((count / total) * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`,
    bookings: `${count.toLocaleString('vi-VN')} lượt đặt`,
    width: Math.round((count / max) * 100),
  }))
}
