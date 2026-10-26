// Cấu hình và hàm tiện ích cho Admin Dashboard (dữ liệu thật lấy qua src/api/admin/dashboardApi.js).

export const PERIODS = ['Hôm nay', 'Tháng này', 'Quý này']
export const TREND_RANGES = { '7 ngày': 7, '30 ngày': 30, '90 ngày': 90 }
// Số trang booking tối đa (100 đơn/trang) dùng để tính tỉ lệ theo môn.
export const AGGREGATE_MAX_PAGES = 10

// ---------- Ngày theo giờ Việt Nam ----------
// Ngày lịch được biểu diễn bằng Date lúc 00:00 UTC, nên cộng/trừ ngày và định dạng
// không phụ thuộc múi giờ của máy người dùng.
export const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh'
const DAY_MS = 86400000
const vnDayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: VN_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
export const vnToday = (now = new Date()) => new Date(`${vnDayFormat.format(now)}T00:00:00Z`)
const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS)
export const toApiDate = date => date.toISOString().slice(0, 10)
// Ngày từ API: chuỗi không kèm múi giờ ("2026-10-26" / "2026-10-26T00:00:00") đã là ngày Việt Nam;
// chuỗi có Z/offset là một thời điểm → quy về ngày Việt Nam.
function toVnDay(value) {
  if (!value) return null
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) && !/(Z|[+-]\d{2}:?\d{2})$/.test(value)) return new Date(`${value.slice(0, 10)}T00:00:00Z`)
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : vnToday(date)
}

// Trả về khoảng hiện tại và khoảng liền trước có cùng độ dài (để tính % tăng trưởng), dạng { fromDate, toDate }.
export function periodRange(period, now = new Date()) {
  const today = vnToday(now)
  const year = today.getUTCFullYear(), month = today.getUTCMonth()
  let from
  if (period === 'Hôm nay') from = today
  else if (period === 'Quý này') from = new Date(Date.UTC(year, Math.floor(month / 3) * 3, 1))
  else from = new Date(Date.UTC(year, month, 1))
  const length = Math.round((today - from) / DAY_MS) + 1
  return {
    current: { fromDate: toApiDate(from), toDate: toApiDate(today) },
    previous: { fromDate: toApiDate(addDays(from, -length)), toDate: toApiDate(addDays(from, -1)) },
  }
}
export function lastDaysRange(days, now = new Date()) {
  const today = vnToday(now)
  return { from: addDays(today, -(days - 1)), to: today }
}

// ---------- Định dạng ----------
export const formatNumber = value => (Number.isFinite(value) ? value.toLocaleString('vi-VN') : '—')
export const formatCurrency = value => (Number.isFinite(value) ? `${value.toLocaleString('vi-VN')} ₫` : '—')
export const formatPercent = value => (Number.isFinite(value) ? `${value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%` : '—')
export function growth(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return undefined
  const percent = ((current - previous) / previous) * 100
  return `${percent >= 0 ? '+' : '-'}${Math.abs(percent).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`
}
export function formatDate(value) {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('vi-VN', { timeZone: VN_TIME_ZONE }) : '—'
}
export function formatTime(value) {
  if (!value) return ''
  if (/^\d{1,2}:\d{2}/.test(value)) return value.slice(0, 5)
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: VN_TIME_ZONE })
}
export const formatDateTime = date => date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', timeZone: VN_TIME_ZONE })

// ---------- Biểu đồ ----------
// Giá trị lớn nhất "tròn" cho trục 4 khoảng (bước 1 / 2 / 2,5 / 5 × 10^n); `integer` cho số đếm.
export function niceMax(max, integer = false) {
  if (!(max > 0)) return integer ? 4 : 1
  const raw = max / 4
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map(factor => factor * magnitude).find(value => value >= raw)
  return (integer ? Math.max(1, Math.ceil(step)) : step) * 4
}
// Đơn vị tiền cho trục theo độ lớn (tránh 0,1 / 0,1 / 0,1 khi giá trị nhỏ).
export function moneyUnit(max) {
  if (max >= 1e6) return { unit: 'Triệu ₫', divisor: 1e6 }
  if (max >= 1e3) return { unit: 'Nghìn ₫', divisor: 1e3 }
  return { unit: '₫', divisor: 1 }
}

// Gom dữ liệu byDay của API dashboard theo ngày (hoặc theo tuần khi khoảng dài) cho biểu đồ xu hướng.
export function buildTrendSeries(byDay, days, now = new Date()) {
  const { from } = lastDaysRange(days, now)
  const bucketDays = days > 30 ? 7 : 1
  const buckets = Array.from({ length: Math.ceil(days / bucketDays) }, (_, index) => ({ start: addDays(from, index * bucketDays), revenue: 0, bookings: 0, newUsers: 0 }))
  for (const day of byDay) {
    const date = toVnDay(day.date)
    if (!date) continue
    const index = Math.floor(Math.round((date - from) / DAY_MS) / bucketDays)
    if (index < 0 || index >= buckets.length) continue
    buckets[index].bookings += day.bookings
    buckets[index].revenue += day.bookingGrossValue
    buckets[index].newUsers += day.newUsers
  }
  return buckets.map(bucket => ({ ...bucket, label: bucket.start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }) }))
}

// Tỷ lệ booking theo môn thể thao (truyền vào danh sách đã loại đơn hủy).
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

// ---------- Xuất báo cáo CSV (từ dữ liệu dashboard đã tải) ----------
export function dashboardCsvRows(dashboard, period, range) {
  const { users = {}, facilities = {}, bookings = {}, revenue = {}, tournaments = {}, lfg = {}, pending = {}, byDay = [] } = dashboard
  const section = (name, entries) => entries.map(([label, value]) => [name, label, value ?? ''])
  return [
    ['Báo cáo tổng quan SportNexus', `${period} (${range.fromDate} → ${range.toDate})`, ''],
    ['Nhóm', 'Chỉ số', 'Giá trị'],
    ...section('Người dùng', [['Tổng người dùng', users.total], ['Người chơi', users.players], ['Chủ sân', users.owners], ['Quản trị viên', users.admins], ['Bị khóa', users.locked], ['Đăng ký mới trong kỳ', users.newInRange], ['Bị cấm nhận kèo', users.claimBanned], ['Dưới ngưỡng Fair Play', users.belowFairPlayThreshold]]),
    ...section('Cơ sở thể thao', [['Tổng cơ sở', facilities.total], ['Đã duyệt', facilities.approved], ['Chờ duyệt', facilities.pending], ['Bị từ chối', facilities.rejected], ['Tổng số sân', facilities.courts]]),
    ...section('Đặt sân', [['Lượt đặt trong kỳ', bookings.inRange], ['Đã thanh toán', bookings.paid], ['Đã check-in', bookings.checkedIn], ['Đã hủy', bookings.cancelled], ['Chờ thanh toán', bookings.pending], ['Tỉ lệ hủy (%)', bookings.cancelRate]]),
    ...section('Doanh thu (₫)', [['Giá trị đặt sân', revenue.bookingGrossValue], ['Doanh thu nền tảng', revenue.platformRevenue], ['Phí đặt sân', revenue.bookingCommissionRevenue], ['Gói đẩy tin', revenue.promotionRevenue], ['Chủ sân nhận', revenue.ownerBookingEarnings], ['Nạp ví', revenue.totalDeposits], ['Rút tiền đã chi', revenue.withdrawalsCompleted], ['Tổng số dư ví', revenue.totalWalletBalance], ['Số dư đang tạm giữ', revenue.totalFrozenBalance], ['Phí đặt sân hiện tại (%)', revenue.currentBookingFeePercent]]),
    ...section('Giải đấu', [['Tổng', tournaments.total], ['Đang mở đăng ký', tournaments.open], ['Đang diễn ra', tournaments.inProgress], ['Đã kết thúc', tournaments.finished], ['Đã hủy', tournaments.cancelled], ['Bị khóa', tournaments.locked]]),
    ...section('Ghép kèo', [['Tạo trong kỳ', lfg.createdInRange], ['Đang mở', lfg.open], ['Đã đủ người', lfg.filled], ['Đã hủy', lfg.cancelled]]),
    ...section('Chờ xử lý', [['Cơ sở chờ duyệt', pending.facilityApprovals], ['Chủ sân chờ xác minh', pending.ownerVerifications], ['Yêu cầu rút tiền', pending.withdrawals], ['Tổng tiền chờ rút (₫)', pending.withdrawalAmount], ['Báo cáo vi phạm đang mở', pending.openReports]]),
    [],
    ['Ngày', 'Người dùng mới', 'Lượt đặt', 'Giá trị đặt sân (₫)'],
    ...byDay.map(day => [String(day.date ?? '').slice(0, 10), day.newUsers, day.bookings, day.bookingGrossValue]),
  ]
}
export function downloadCsv(filename, rows) {
  const escape = value => `"${String(value ?? '').replace(/"/g, '""')}"`
  const url = URL.createObjectURL(new Blob(['﻿' + rows.map(row => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: filename })
  link.click()
  URL.revokeObjectURL(url)
}
