import { mockSummary, recipients } from './notificationData.js'

const adminDisplayLabels = {
  "Confirmed": "Đã xác nhận",
  "Completed": "Đã hoàn thành",
  "Recruiting": "Đang tìm người",
  "Announcement": "Thông báo chung",
  "Maintenance": "Bảo trì",
  "General": "Chung",
  "Admin": "Quản trị",
  "Administrator": "Quản trị viên",
  "Player": "Người chơi",
  "Court Owner": "Chủ sân",
  "CourtOwner": "Chủ sân",
  "Booking": "Đặt sân",
  "Payment": "Thanh toán",
  "Tournament": "Giải đấu",
  "System": "Hệ thống",
  "Broadcast": "Thông báo hàng loạt",
  "LFG": "Tìm nhóm chơi",
  "Registration": "Đăng ký",
  "Active": "Đang hoạt động",
  "Inactive": "Ngừng hoạt động",
  "Pending": "Đang chờ xử lý",
  "Read": "Đã đọc",
  "Delivered": "Đã giao",
  "Failed": "Thất bại",
  "Sent": "Đã gửi",
  "Sending": "Đang gửi",
  "Draft": "Bản nháp",
  "Scheduled": "Đã lên lịch",
  "Cancelled": "Đã hủy",
  "In-App": "Trong ứng dụng",
  "Push Notification": "Thông báo đẩy",
  "All Users": "Tất cả người dùng",
  "Players": "Người chơi",
  "Court Owners": "Chủ sân",
  "Admins": "Quản trị viên",
  "Selected Users": "Người dùng được chọn",
  "All": "Tất cả"
}


export const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase()
export const formatNumber = value => value.toLocaleString('vi-VN')
export const formatTime = value => value ? new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chưa có'
export function localDate(value) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
}
export function scheduleInput(value) {
  return value ? `${localDate(value)}T${new Date(value).toLocaleTimeString('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' })}` : ''
}

export function filterNotifications(records, filters) {
  return records.filter(record => {
    const text = [record.id, record.title, record.type, record.recipient.name, record.recipient.username, record.recipient.email].join(' ')
    const day = localDate(record.sentAt)
    return normalize(text).includes(normalize(filters.search.trim())) &&
      (!filters.type || record.type === filters.type) && (!filters.status || record.status === filters.status) &&
      (!filters.audience || record.recipient.role === filters.audience) &&
      (!filters.from || day >= filters.from) && (!filters.to || day <= filters.to)
  })
}
export function filterManagement(records, filters, tab) {
  return records.filter(record => normalize([record.id, record.name, record.title, record.eventKey, record.message].filter(Boolean).join(' ')).includes(normalize(filters.search.trim())) &&
    (!filters.status || record.status === filters.status) &&
    (!filters.type || (tab === 'triggers' ? record.category : record.type) === filters.type) &&
    (!filters.audience || record.audience === filters.audience))
}
export function toggleTrigger(records, id) {
  return records.map(record => record.id === id ? { ...record, status: record.status === 'Active' ? 'Inactive' : 'Active' } : record)
}
export function paginate(records, page, pageSize = 10) {
  const pages = Math.max(1, Math.ceil(records.length / pageSize))
  const current = Math.min(Math.max(1, page), pages)
  return { rows: records.slice((current - 1) * pageSize, current * pageSize), page: current, pages }
}
export function notificationSummary(notifications, today = mockSummary.date) {
  const added = notifications.filter(record => record.source === 'created')
  const total = mockSummary.total + added.length
  const successful = added.filter(record => ['Delivered', 'Read'].includes(record.status)).length
  return {
    total, sentToday: mockSummary.sentToday + added.filter(record => record.status !== 'Pending' && localDate(record.sentAt) === today).length,
    unread: mockSummary.unread + added.filter(record => record.status !== 'Read' && record.status !== 'Failed').length,
    rate: (mockSummary.delivered + successful) / total * 100,
  }
}
export function deliveryTimeline(notification) {
  const entries = [
    { title: notification.source === 'created' ? "Được tạo bởi quản trị viên" : `Kích hoạt bởi hệ thống ${adminDisplayLabels[notification.type] || notification.type}`, detail: 'Sự kiện đã được ghi nhận trong dữ liệu mẫu.', tone: 'success' },
    { title: "Đã chuẩn bị thông báo", detail: `Kênh cấu hình: ${notification.channels.map(channel => adminDisplayLabels[channel] || channel).join(' & ')}`, tone: 'success' },
  ]
  if (notification.status === 'Pending') entries.push({ title: "Đang chờ gửi", detail: 'Đang chờ gửi; chưa xác nhận giao thành công.', tone: 'warning' })
  if (notification.status === 'Failed') entries.push({ title: "Gửi thông báo thất bại", detail: notification.error || 'Không có thông tin nguyên nhân.', tone: 'danger' })
  if (notification.status === 'Sent') entries.push({ title: "Đã gửi thông báo", detail: 'Đã gửi; chưa có xác nhận từ thiết bị người nhận.', tone: 'info' })
  if (['Delivered', 'Read'].includes(notification.status)) entries.push({ title: "Đã giao thông báo", detail: 'Đã có xác nhận giao thông báo trong dữ liệu mẫu.', tone: 'success' })
  if (notification.status === 'Read') entries.push({ title: "Người nhận đã đọc thông báo", detail: 'Người nhận đã mở thông báo (mẫu).', tone: 'success' })
  return entries.map((entry, index) => ({ ...entry, at: new Date(new Date(notification.sentAt).getTime() + index * 60000).toISOString() }))
}
export function resolveRecipients(form) {
  const audienceRoles = { Players: 'Player', 'Court Owners': 'Court Owner', Admins: 'Admin' }
  return recipients.filter(person => form.audience === 'All Users' ||
    (form.audience === 'Selected Users' ? form.selectedUsers.includes(person.id) : person.role === audienceRoles[form.audience]))
}
export function validateNotification(form, mode, now = Date.now()) {
  if (!form.title.trim() || form.title.trim().length > 120) return 'Tiêu đề phải có từ 1 đến 120 ký tự.'
  if (!form.message.trim() || form.message.trim().length > 2000) return 'Nội dung phải có từ 1 đến 2.000 ký tự.'
  if (!form.audience || !resolveRecipients(form).length) return 'Vui lòng chọn đối tượng và ít nhất một người nhận mẫu.'
  if (!form.channels.length) return 'Phải chọn ít nhất một kênh gửi.'
  if (mode === 'schedule' && (!form.scheduleAt || !Number.isFinite(Date.parse(form.scheduleAt)) || Date.parse(form.scheduleAt) <= now)) return 'Thời gian lên lịch phải ở tương lai (giờ Việt Nam, UTC+7).'
  return ''
}
export function createNotifications(form, now = new Date(), id = crypto.randomUUID()) {
  return resolveRecipients(form).map((recipient, index) => ({
    id: `NOTIF-${id}-${index + 1}`, title: form.title.trim(), message: form.message.trim(),
    type: ['Announcement', 'Maintenance', 'General'].includes(form.type) ? 'Broadcast' : form.type,
    subtype: form.type, recipient, channels: [...form.channels], status: 'Sent', sentAt: now.toISOString(),
    related: null, error: '', source: 'created',
  }))
}
export function saveBroadcast(records, form, mode, id = crypto.randomUUID()) {
  const record = { ...form, id: form.id || `BCAST-${id}`, title: form.title.trim(), message: form.message.trim(),
    channels: [...form.channels], selectedUsers: [...form.selectedUsers],
    status: mode === 'draft' ? 'Draft' : 'Scheduled', scheduleAt: mode === 'draft' ? '' : form.scheduleAt,
    estimatedRecipients: resolveRecipients(form).length,
  }
  return form.id ? records.map(item => item.id === form.id ? record : item) : [record, ...records]
}
export function broadcastAction(records, id, action, newId = crypto.randomUUID()) {
  const source = records.find(record => record.id === id)
  if (!source) return records
  if (action === 'delete' && source.status === 'Draft') return records.filter(record => record.id !== id)
  if (action === 'cancel' && source.status === 'Scheduled') return records.map(record => record.id === id ? { ...record, status: 'Cancelled' } : record)
  if (action === 'duplicate') return [{ ...source, id: `BCAST-${newId}`, title: `${source.title} (bản sao)`.slice(0, 120), status: 'Draft', scheduleAt: '', channels: [...source.channels], selectedUsers: [...source.selectedUsers] }, ...records]
  return records
}
function csvRows(rows) {
  const escape = value => `"${String(value ?? '').replace(/^[=+@\-\t\r]/, "'$&").replace(/"/g, '""')}"`
  return '\uFEFF' + rows.map(row => row.map(escape).join(',')).join('\r\n')
}
export function notificationsCsv(records) {
  const rows = [["ID thông báo", "Tiêu đề", "Loại", "Người nhận", "Trạng thái", "Thời gian gửi"],
    ...records.map(record => [record.id, record.title, record.type, record.recipient.name, record.status, record.sentAt])]
  return csvRows(rows)
}
export function managementCsv(records, tab) {
  const columns = tab === 'triggers' ? ['id', 'name', 'eventKey', 'category', 'channels', 'status', 'lastTriggered'] : ['id', 'title', 'audience', 'channels', 'scheduleAt', 'status']
  return csvRows([columns, ...records.map(record => columns.map(column => Array.isArray(record[column]) ? record[column].join(' & ') : record[column]))])
}
