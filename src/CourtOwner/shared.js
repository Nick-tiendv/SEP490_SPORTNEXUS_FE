// Hàm định dạng và nhãn trạng thái dùng chung cho các trang Chủ sân.
export const formatVND = (value) => (value === null || value === undefined || value === '' ? '—' : `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)} đ`)

export const formatDateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
}
export const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN')
}
export const formatTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value).slice(0, 5) : date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

// Ngày dạng YYYY-MM-DD theo giờ máy (BE đọc theo giờ Việt Nam).
export const toDateKey = (date = new Date()) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export const addDays = (dateKey, days) => {
  const d = new Date(`${dateKey}T00:00:00`)
  d.setDate(d.getDate() + days)
  return toDateKey(d)
}
// "17:30" -> "17:30:00" (TimeSpan của BE); rỗng -> null.
export const toTimeSpan = (value) => (value ? (value.length === 5 ? `${value}:00` : value) : null)

// DayOfWeek của .NET: 0 = Chủ nhật.
export const WEEK_DAYS = [
  { value: 1, label: 'T2' }, { value: 2, label: 'T3' }, { value: 3, label: 'T4' }, { value: 4, label: 'T5' },
  { value: 5, label: 'T6' }, { value: 6, label: 'T7' }, { value: 0, label: 'CN' },
]

const BADGES = {
  // Đơn đặt sân
  PENDING: ['amber', 'Chờ xử lý'], PENDING_PAYMENT: ['amber', 'Chờ thanh toán'], CONFIRMED: ['blue', 'Đã xác nhận'], PAID: ['blue', 'Đã thanh toán'],
  CHECKED_IN: ['green', 'Đã check-in'], COMPLETED: ['green', 'Hoàn thành'], CANCELLED: ['red', 'Đã hủy'], NO_SHOW: ['red', 'Vắng mặt'], REFUNDED: ['gray', 'Đã hoàn tiền'],
  // Khiếu nại
  OWNER_RESPONDED: ['blue', 'Đã giải trình'], RESOLVED_REFUNDED: ['green', 'Đã hoàn tiền'], RESOLVED_NO_REFUND: ['gray', 'Không hoàn tiền'], REJECTED: ['gray', 'Bị từ chối'], WITHDRAWN: ['gray', 'Khách rút đơn'],
  // Cơ sở / quảng bá
  APPROVED: ['green', 'Đã duyệt'], SCHEDULED: ['amber', 'Chờ chạy'], ACTIVE: ['green', 'Đang chạy'], EXPIRED: ['gray', 'Hết hạn'], INACTIVE: ['gray', 'Tạm ngưng'],
  // Ca sân
  AVAILABLE: ['green', 'Còn trống'], LOCKING: ['amber', 'Đang giữ chỗ'], BOOKED: ['blue', 'Đã đặt'], LOCKED: ['gray', 'Đã khóa'], MAINTENANCE: ['gray', 'Bảo trì'], RESERVED: ['amber', 'Giữ cho giải'],
}
export const statusBadge = (status) => {
  const key = String(status || '').toUpperCase()
  const [color, label] = BADGES[key] || ['gray', status || '—']
  return { className: `snx-badge snx-badge--${color}`, label }
}
