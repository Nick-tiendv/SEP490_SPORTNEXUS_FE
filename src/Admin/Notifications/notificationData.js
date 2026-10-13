// Illustrative aggregate; the table contains a smaller, explicitly labelled demo sample.
export const mockSummary = { total: 18420, sentToday: 326, unread: 1284, delivered: 18162, date: '2026-10-13' }
export const notificationTypes = ['Booking', 'Payment', 'LFG', 'Tournament', 'System', 'Broadcast']
export const deliveryStatuses = ['Sent', 'Delivered', 'Read', 'Failed', 'Pending']
export const roles = ['Player', 'Court Owner', 'Admin']
export const channels = ['In-App', 'Email', 'Push Notification']
export const formTypes = ['Announcement', 'Maintenance', 'Booking', 'Payment', 'Tournament', 'LFG', 'General']
export const audiences = ['All Users', 'Players', 'Court Owners', 'Admins', 'Selected Users']

export const recipients = [
  { id: 'USR-001', name: 'Lê Hoàng Nam', username: 'hoang_nam', email: 'nam@example.test', role: 'Player' },
  { id: 'USR-002', name: 'Trần Minh Anh', username: 'minh_anh', email: 'anh@example.test', role: 'Player' },
  { id: 'USR-003', name: 'Nguyễn Tuấn Kiệt', username: 'tuan_kiet', email: 'kiet@example.test', role: 'Player' },
  { id: 'USR-004', name: 'Vũ Thị Mai Anh', username: 'mai_anh', email: 'mai@example.test', role: 'Court Owner' },
  { id: 'USR-005', name: 'Đỗ Quốc Tuấn', username: 'quoc_tuan', email: 'tuan@example.test', role: 'Court Owner' },
  { id: 'USR-006', name: 'Alex Trần', username: 'alex_tran', email: 'alex@example.test', role: 'Admin' },
  { id: 'USR-007', name: 'Phạm Hùng Cường', username: 'hung_cuong', email: 'cuong@example.test', role: 'Player' },
  { id: 'USR-008', name: 'Hoàng Ngọc Linh', username: 'ngoc_linh', email: 'linh@example.test', role: 'Player' },
]

export const notificationTemplates = [
  { title: "Đã xác nhận đặt sân", type: 'Booking', message: 'Chúc mừng bạn! Đặt sân từ 18:00–20:00 ngày 13/10/2026 tại Sunrise Riverside Sport Hub, sân Pickleball Pro 01 đã được xác nhận thành công. Vui lòng xuất trình mã QR Check-in tại cổng vào.', related: { label: "Đặt sân", id: 'SN-2026-00245', details: { 'Cơ sở': 'Sunrise Riverside Sport Hub', 'Sân': 'Pickleball Pro 01', 'Ngày đặt': '13/10/2026', 'Giờ chơi': '18:00–20:00', 'Trạng thái': 'Confirmed' } } },
  { title: "Thanh toán thành công", type: 'Payment', message: 'Thanh toán 600.000 ₫ cho đơn đặt sân đã thành công. Cảm ơn bạn đã sử dụng SportNexus.', related: { label: "Thanh toán", id: 'PAY-2026-00182', details: { 'Số tiền': '600.000 ₫', 'Trạng thái': 'Completed' } } },
  { title: "Người chơi đã tham gia nhóm", type: 'LFG', message: 'Một người chơi mới đã tham gia nhóm Pickleball tối thứ ba. Hãy kiểm tra danh sách trước giờ chơi.', related: { label: 'LFG', id: 'LFG-00842', details: { 'Nhóm': 'Pickleball tối thứ ba', 'Trạng thái': 'Recruiting' } } },
  { title: "Đã tạo sơ đồ thi đấu", type: 'Tournament', message: 'Sơ đồ thi đấu SportNexus Open đã được công bố. Vui lòng kiểm tra lịch thi đấu của bạn.', related: { label: "Giải đấu", id: 'TRN-2026-021', details: { 'Giải đấu': 'SportNexus Open', 'Ngày sự kiện': '24/10/2026' } } },
  { title: "Gửi thông báo thất bại", type: 'System', message: 'Không thể gửi thông báo. Địa chỉ email người nhận không khả dụng.', related: null },
  { title: "Cập nhật cộng đồng", type: 'Broadcast', message: 'Khám phá các sân mới và hoạt động cộng đồng SportNexus trong tháng 10.', related: null },
]

export const initialNotifications = Array.from({ length: 36 }, (_, index) => {
  const template = notificationTemplates[index % notificationTemplates.length]
  const status = index < 5 ? ['Read', 'Delivered', 'Read', 'Sent', 'Failed'][index] : deliveryStatuses[index % deliveryStatuses.length]
  return {
    ...template, id: `NOTIF-2026-${String(index + 4821).padStart(5, '0')}`,
    recipient: recipients[index % recipients.length], status,
    channels: index % 2 ? ['In-App', 'Email'] : ['In-App', 'Push Notification'],
    sentAt: `2026-10-${String(index < 5 ? 13 : 12 - index % 12).padStart(2, '0')}T17:40:00+07:00`,
    error: status === 'Failed' ? "Quá thời gian gửi / không thể kết nối thiết bị nhận (mẫu)." : '',
    source: 'sample',
  }
})

const triggerNames = [
  ["Đã xác nhận đặt sân", 'booking.confirmed', 'Booking'], ["Đã hủy đặt sân", 'booking.cancelled', 'Booking'],
  ["Thanh toán thành công", 'payment.successful', 'Payment'], ["Thanh toán thất bại", 'payment.failed', 'Payment'],
  ["Đã xác nhận đăng ký giải đấu", 'tournament.registered', 'Tournament'], ["Đã tạo sơ đồ thi đấu", 'tournament.bracket_generated', 'Tournament'],
  ["Người chơi đã tham gia nhóm", 'lfg.player_joined', 'LFG'], ["Nhóm đã đủ người", 'lfg.group_full', 'LFG'],
  ["Xác minh tài khoản", 'account.verification', 'System'], ["Bảo trì hệ thống", 'system.maintenance', 'System'],
  ["Nhắc lịch đặt sân", 'booking.reminder', 'Booking'], ["Đã hoàn tất hoàn tiền", 'payment.refunded', 'Payment'],
  ["Nhắc lịch giải đấu", 'tournament.reminder', 'Tournament'], ["Đã hủy nhóm chơi", 'lfg.cancelled', 'LFG'],
]
export const initialTriggers = triggerNames.map(([name, eventKey, category], index) => ({
  id: `TRIGGER-${index + 1}`, name, eventKey, category,
  description: `Tạo thông báo khi nhận sự kiện ${eventKey}. Cấu hình này chỉ dùng để minh họa giao diện.`,
  template: `${name} — Xin chào {{recipient_name}}, hoạt động {{entity_id}} vừa được cập nhật trên SportNexus.`,
  channels: index % 2 ? ['In-App', 'Email'] : ['In-App', 'Push Notification'],
  status: index % 4 ? 'Active' : 'Inactive', lastTriggered: index % 4 ? '2026-10-13T17:40:00+07:00' : null,
  triggeredToday: index % 4 ? (index + 1) * 3 : 0,
}))

export const broadcastPreview = {
  title: 'Thông báo bảo trì hệ thống SportNexus',
  message: 'SportNexus sẽ thực hiện bảo trì hệ thống vào cuối tuần. Một số tính năng có thể tạm thời gián đoạn. Cảm ơn bạn đã đồng hành cùng SportNexus.',
  type: 'Maintenance', audience: 'All Users', channels: ['In-App', 'Email'], selectedUsers: [],
  estimatedRecipients: mockSummary.total, status: 'Draft', scheduleAt: '',
}
export const initialBroadcasts = Array.from({ length: 16 }, (_, index) => ({
  ...broadcastPreview, id: `BCAST-2026-${String(index + 1).padStart(3, '0')}`,
  title: index === 0 ? broadcastPreview.title : ['Giải đấu SportNexus Open', 'Cập nhật sân mới', 'Ưu đãi đặt sân cuối tuần'][index % 3],
  type: index === 0 ? 'Maintenance' : 'Announcement',
  audience: audiences[index % 4], channels: index % 2 ? ['In-App'] : ['In-App', 'Email'],
  status: ['Draft', 'Scheduled', 'Completed', 'Cancelled', 'Sending'][index % 5],
  scheduleAt: index % 5 === 0 ? '' : index % 5 === 1 ? `2027-01-${String(15 + index % 10).padStart(2, '0')}T09:00:00+07:00` : '2026-10-12T09:00:00+07:00',
  selectedUsers: [], estimatedRecipients: index % 4 === 0 ? mockSummary.total : 500 + index * 20,
}))

export const initialFilters = { search: '', type: '', status: '', audience: '', from: '', to: '' }
export const tabLabels = { history: "Lịch sử thông báo", triggers: "Sự kiện kích hoạt thông báo", broadcasts: "Thông báo hàng loạt theo lịch" }
