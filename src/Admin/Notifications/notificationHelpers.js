// Nhãn và hàm thuần cho trang Quản lý thông báo (docs 41). Dữ liệu thật lấy qua src/api/admin/notificationApi.js.

export const MAX_TITLE = 255
export const MAX_BODY = 2000
export const MAX_USERS = 1000
const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh'
const MINUTE = 60 * 1000
const DAY = 24 * 60 * MINUTE

export const targetLabels = {
  ALL: 'Tất cả (người chơi + chủ sân)',
  PLAYER: 'Người chơi',
  OWNER: 'Chủ sân',
  USERS: 'Người dùng được chọn',
}

// tone = class màu có sẵn trong notification.css (.nt-<tone>).
export const statusLabels = {
  SCHEDULED: { label: 'Đã hẹn giờ', tone: 'scheduled' },
  SENT: { label: 'Đã gửi', tone: 'read' },
  CANCELLED: { label: 'Đã hủy', tone: 'cancelled' },
  RECALLED: { label: 'Đã thu hồi', tone: 'draft' },
}
export const statusFilters = ['SCHEDULED', 'SENT', 'CANCELLED', 'RECALLED']

// Nhóm thông báo trong thống kê byType (docs 21).
export const typeLabels = {
  BOOKING: 'Đặt sân',
  LFG: 'Tìm nhóm chơi',
  TEAM: 'Đội',
  TOURNAMENT: 'Giải đấu',
  REVIEW: 'Đánh giá',
  COMMUNITY: 'Cộng đồng',
  WALLET: 'Ví',
  REPORT: 'Khiếu nại',
  SYSTEM: 'Hệ thống',
}

// referenceType hợp lệ (docs 21) để app người dùng mở đúng màn hình khi bấm thông báo.
export const referenceTypes = {
  TOURNAMENT: 'Giải đấu',
  FACILITY: 'Cơ sở thể thao',
  BOOKING: 'Đơn đặt sân',
  LFG_CARD: 'Kèo tìm nhóm',
  TEAM: 'Đội',
  COMMUNITY_POST: 'Bài viết cộng đồng',
  FACILITY_REVIEW: 'Đánh giá cơ sở',
  REPORT: 'Khiếu nại',
  WALLET: 'Ví',
}

export const STATS_PERIODS = [7, 30, 90]

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const formatNumber = value => new Intl.NumberFormat('vi-VN').format(Number(value) || 0)
export const formatPercent = value => `${(Number(value) || 0).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`
export function formatTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('vi-VN', { timeZone: VN_TIME_ZONE, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
}

// Bỏ dấu để tìm kiếm không phân biệt dấu / hoa thường.
export const normalize = value => String(value ?? '').toLocaleLowerCase('vi').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')

// Giá trị cho <input type="datetime-local"> theo giờ Việt Nam: 'yyyy-MM-ddTHH:mm'.
export function vnLocalInput(time) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: VN_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date(time)).map(part => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour === '24' ? '00' : parts.hour}:${parts.minute}`
}
// 'yyyy-MM-ddTHH:mm' (giờ Việt Nam) → ISO DateTimeOffset gửi lên BE.
export const vnLocalToIso = value => (value ? `${value}:00+07:00` : null)

export const blankBroadcast = { title: '', body: '', target: 'ALL', userIds: [], referenceType: '', referenceId: '', sendMode: 'now', scheduledLocal: '' }

// Kiểm tra trước khi gửi, theo đúng các ràng buộc 400 của docs 41. Trả '' nếu hợp lệ.
export function validateBroadcast(form, now = Date.now()) {
  const title = form.title.trim()
  const body = form.body.trim()
  if (!title || !body) return 'Vui lòng nhập tiêu đề và nội dung.'
  if (title.length > MAX_TITLE) return `Tiêu đề tối đa ${MAX_TITLE} ký tự.`
  if (body.length > MAX_BODY) return `Nội dung tối đa ${formatNumber(MAX_BODY)} ký tự.`
  if (!targetLabels[form.target]) return 'Vui lòng chọn đối tượng nhận.'
  if (form.target === 'USERS') {
    if (!form.userIds.length) return 'Vui lòng chọn ít nhất 1 người nhận.'
    if (form.userIds.length > MAX_USERS) return `Tối đa ${formatNumber(MAX_USERS)} người nhận cho mỗi đợt.`
  }
  const referenceId = form.referenceId.trim()
  if (form.referenceType && !referenceId) return 'Vui lòng nhập ID đối tượng liên kết.'
  if (!form.referenceType && referenceId) return 'Vui lòng chọn loại đối tượng liên kết.'
  if (referenceId && !UUID.test(referenceId)) return 'ID đối tượng liên kết phải là mã UUID.'
  if (form.sendMode === 'later') {
    const time = Date.parse(vnLocalToIso(form.scheduledLocal) || '')
    if (!Number.isFinite(time)) return 'Vui lòng chọn thời gian hẹn gửi.'
    if (time < now + MINUTE) return 'Thời gian hẹn gửi phải sau thời điểm hiện tại ít nhất 1 phút.'
    if (time > now + 30 * DAY) return 'Chỉ hẹn gửi trong vòng 30 ngày.'
  }
  return ''
}

export function toBroadcastPayload(form) {
  return {
    title: form.title.trim(),
    body: form.body.trim(),
    target: form.target,
    userIds: form.target === 'USERS' ? form.userIds : null,
    referenceType: form.referenceType || null,
    referenceId: form.referenceType ? form.referenceId.trim() : null,
    scheduledAt: form.sendMode === 'later' ? vnLocalToIso(form.scheduledLocal) : null,
  }
}

// Thao tác được phép: hủy đợt hẹn giờ, thu hồi đợt đã gửi.
export const broadcastAction = status => (status === 'SCHEDULED' ? 'cancel' : status === 'SENT' ? 'recall' : null)

const csvCell = value => `"${String(value ?? '').replaceAll('"', '""')}"`
export function broadcastsCsv(rows) {
  const header = ['ID', 'Tiêu đề', 'Nội dung', 'Đối tượng', 'Số người nhận', 'Đã đọc', 'Tỷ lệ đọc (%)', 'Trạng thái', 'Hẹn gửi', 'Đã gửi', 'Thu hồi', 'Người tạo']
  const lines = rows.map(row => [row.id, row.title, row.body, targetLabels[row.target] || row.target, row.recipientCount, row.readCount, row.readRate, statusLabels[row.status]?.label || row.status, formatTime(row.scheduledAt), formatTime(row.sentAt), formatTime(row.recalledAt), row.createdByName])
  return '﻿' + [header, ...lines].map(line => line.map(csvCell).join(',')).join('\n')
}
