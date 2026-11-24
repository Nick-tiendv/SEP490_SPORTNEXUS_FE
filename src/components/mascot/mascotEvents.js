// Sự kiện window nối NotificationBell ↔ mascot, để mascot không phải gọi API thông báo lần nữa.
// NotificationBell phát sau mỗi lần tải GET /api/v1/notifications (detail: mảng thông báo đã chuẩn hóa).
export const NOTIFICATIONS_SYNCED_EVENT = 'snx:notifications-synced'
// Mascot phát khi người dùng bấm bong bóng thông báo → NotificationBell mở danh sách.
export const OPEN_NOTIFICATIONS_EVENT = 'snx:open-notifications'
