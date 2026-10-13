export const settingsStorageKey = 'sportnexus.admin.system-settings.mock.v1'
export const settingsVersion = 1

export const defaultSettings = {
  general: {
    platformName: 'SportNexus', supportEmail: 'support@sportnexus.com',
    description: "Nền tảng đặt sân đa môn, tìm nhóm chơi và kết nối cộng đồng.",
    defaultLanguage: 'vi', timezone: 'Asia/Ho_Chi_Minh', currency: 'VND',
    maintenanceMode: false, allowRegistrations: true, publicAccess: true,
  },
  booking: {
    minDuration: 1, maxDuration: 4, advanceBookingDays: 30, cancellationHours: 24,
    bufferMinutes: 15, autoExpirePending: true, lateCancellation: 'no-refund',
  },
  payment: {
    serviceFee: 5, paymentTimeout: 15, onlinePayment: true, refundRequests: true,
    refundEligibility: 'before-deadline', refundPercentage: 100,
  },
  tournament: {
    allowCreation: true, requireApproval: true, maxTeams: 32, registrationClosingHours: 24,
    allowScheduleModification: true, automaticBracket: true, allowResultUpdates: true, notifications: true,
    formats: ['single-elimination', 'double-elimination', 'round-robin', 'group-stage'],
  },
  notifications: {
    emailEnabled: true, emailBooking: true, emailPayment: true, emailTournament: true, emailSecurity: true,
    inAppEnabled: true, inAppBooking: true, inAppMatchmaking: true, inAppTournament: true, inAppSystem: true,
    pushEnabled: true, pushBooking: true, pushTournament: true, pushCommunity: false,
    bookingReminderMinutes: 60, retryLimit: 3,
  },
  security: { sessionTimeout: '30', maxLoginAttempts: 5, strongPasswords: true, requireTwoFactor: true, suspiciousLoginAlerts: true },
}

export const settingsSections = [
  { id: 'general', number: '01', nav: "Chung", title: "Cài đặt chung", subtitle: "Cấu hình thông tin nền tảng và các tùy chọn vận hành SportNexus." },
  { id: 'booking-payments', number: '02', nav: "Đặt sân & Thanh toán", title: "Đặt sân & Thanh toán", subtitle: "Cấu hình chính sách đặt sân, thanh toán và hủy đặt sân." },
  { id: 'tournament', number: '03', nav: "Giải đấu", title: "Cài đặt giải đấu", subtitle: "Quản lý đăng ký, lịch thi đấu và quy định giải đấu." },
  { id: 'notifications', number: '04', nav: "Quản lý thông báo", title: "Cài đặt thông báo", subtitle: "Cấu hình thông báo, kênh gửi và các cảnh báo tự động." },
  { id: 'security', number: '05', nav: "Bảo mật & Truy cập", title: "Bảo mật & Truy cập", subtitle: "Quản lý bảo mật quản trị, chính sách truy cập và bảo vệ tài khoản." },
  { id: 'danger', number: '06', nav: "Khu vực thao tác nhạy cảm", title: "Khu vực thao tác nhạy cảm", subtitle: "Các thao tác quản trị quan trọng cần được xác nhận thêm." },
]

const text = (label, help, maxLength = 120) => ({ type: 'text', label, help, maxLength })
const number = (label, help, unit, min, max = 10000, integer = true) => ({ type: 'number', label, help, unit, min, max, integer, step: integer ? 1 : .25 })
const toggle = (label, help, critical = false) => ({ type: 'toggle', label, help, critical })
const select = (label, help, options) => ({ type: 'select', label, help, options })

export const settingsFields = {
  general: {
    platformName: text("Tên nền tảng", 'Tên hiển thị của nền tảng.'),
    supportEmail: { ...text("Email hỗ trợ", 'Địa chỉ hỗ trợ người dùng.', 254), type: 'email' },
    description: { ...text("Mô tả nền tảng", 'Mô tả ngắn về SportNexus.', 500), type: 'textarea' },
    defaultLanguage: select("Ngôn ngữ mặc định", 'Ngôn ngữ hiển thị mặc định.', [['vi', "Tiếng Việt"], ['en', "Tiếng Anh"]]),
    timezone: select("Múi giờ", 'Múi giờ vận hành của nền tảng.', [['Asia/Ho_Chi_Minh', 'Asia/Ho_Chi_Minh (UTC+7)'], ['UTC', 'UTC'], ['Asia/Tokyo', 'Asia/Tokyo (UTC+9)']]),
    currency: select("Tiền tệ", 'Đơn vị tiền tệ mặc định.', [['VND', 'VND — Việt Nam Đồng'], ['USD', "USD — Đô la Mỹ"]]),
    maintenanceMode: toggle("Chế độ bảo trì", 'Chế độ bảo trì mẫu; không khóa website.', true),
    allowRegistrations: toggle("Cho phép đăng ký mới", 'Cho phép đăng ký mới trong cấu hình mẫu.', true),
    publicAccess: toggle("Cho phép truy cập công khai", 'Cấu hình quyền truy cập công khai mẫu.', true),
  },
  booking: {
    minDuration: number("Thời lượng đặt sân tối thiểu", 'Thời lượng tối thiểu cho một lượt đặt.', 'giờ', .25, 24, false),
    maxDuration: number("Thời lượng đặt sân tối đa", 'Phải bằng hoặc lớn hơn thời lượng tối thiểu.', 'giờ', .25, 24, false),
    advanceBookingDays: number("Thời gian được đặt trước", 'Số ngày được đặt sân trước.', 'ngày', 0, 365),
    cancellationHours: number("Thời hạn hủy đặt sân", 'Thời hạn hủy trước giờ bắt đầu.', 'giờ', 0, 720),
    bufferMinutes: number("Khoảng đệm giữa các lượt đặt", 'Khoảng đệm giữa hai lượt đặt sân.', 'phút', 0, 240),
    autoExpirePending: toggle("Tự hết hạn đơn đặt sân đang chờ", 'Tự hết hạn lượt đặt đang chờ (cấu hình mẫu).'),
    lateCancellation: select("Xử lý hủy sau thời hạn", 'Cách xử lý yêu cầu hủy sau thời hạn.', [['no-refund', 'Không hoàn tiền'], ['manual-review', 'Chuyển sang xét duyệt'], ['partial-refund', 'Hoàn một phần theo tỷ lệ']]),
  },
  payment: {
    serviceFee: { ...number("Phí dịch vụ nền tảng", 'Phí dịch vụ của nền tảng.', '%', 0, 100, false), step: .1 },
    paymentTimeout: number("Thời gian chờ thanh toán", 'Thời gian chờ thanh toán phải lớn hơn 0.', 'phút', 1, 1440),
    onlinePayment: toggle("Cho phép thanh toán trực tuyến", 'Cho phép thanh toán online trong cấu hình mẫu.'),
    refundRequests: toggle("Cho phép yêu cầu hoàn tiền", 'Cho phép tiếp nhận yêu cầu hoàn tiền mẫu.'),
    refundEligibility: select("Điều kiện hoàn tiền", 'Điều kiện đủ để xét hoàn tiền.', [['before-deadline', 'Hủy trước thời hạn'], ['admin-review', 'Cần quản trị viên xét duyệt'], ['all-cancellations', 'Tất cả yêu cầu hủy']]),
    refundPercentage: number("Tỷ lệ hoàn tiền", 'Tỷ lệ hoàn tiền cho yêu cầu hợp lệ.', '%', 0, 100, false),
  },
  tournament: {
    allowCreation: toggle("Cho phép tạo giải đấu", 'Cho phép tạo giải đấu trong cấu hình mẫu.'),
    requireApproval: toggle("Yêu cầu quản trị viên phê duyệt", 'Giải đấu cần được quản trị viên xét duyệt.'),
    maxTeams: number("Số đội tối đa mỗi giải", 'Số đội tối đa phải là số nguyên dương.', 'đội', 1, 1024),
    registrationClosingHours: number("Thời hạn đóng đăng ký", 'Đóng đăng ký trước khi giải bắt đầu.', 'giờ', 0, 720),
    allowScheduleModification: toggle("Cho phép điều chỉnh lịch thi đấu", 'Cho phép điều chỉnh lịch thi đấu.'),
    automaticBracket: toggle("Tự động tạo sơ đồ thi đấu", 'Bật tạo sơ đồ thi đấu tự động.'),
    allowResultUpdates: toggle("Cho phép cập nhật kết quả trận đấu", 'Cho phép cập nhật kết quả trận đấu.'),
    notifications: toggle("Thông báo giải đấu", 'Gửi cập nhật giải đấu (chỉ cấu hình).'),
  },
  notifications: {
    emailEnabled: toggle("Bật thông báo qua Email", 'Kích hoạt kênh email mẫu.'),
    emailBooking: toggle("Xác nhận đặt sân", 'Thông báo xác nhận đặt sân.'),
    emailPayment: toggle("Xác nhận thanh toán", 'Thông báo xác nhận thanh toán.'),
    emailTournament: toggle("Cập nhật giải đấu", 'Cập nhật thông tin giải đấu.'),
    emailSecurity: toggle("Cảnh báo bảo mật", 'Cảnh báo bảo mật tài khoản.'),
    inAppEnabled: toggle("Bật thông báo trong ứng dụng", 'Kích hoạt kênh thông báo trong ứng dụng.'),
    inAppBooking: toggle("Nhắc lịch đặt sân", 'Nhắc lịch đặt sân sắp tới.'),
    inAppMatchmaking: toggle("Cập nhật tìm nhóm chơi", 'Cập nhật nhóm tìm người chơi.'),
    inAppTournament: toggle("Thông báo giải đấu", 'Thông báo về giải đấu.'),
    inAppSystem: toggle("Thông báo hệ thống", 'Thông báo vận hành nền tảng.'),
    pushEnabled: toggle("Bật thông báo đẩy", 'Kích hoạt kênh push mẫu.'),
    pushBooking: toggle("Nhắc lịch đặt sân", 'Nhắc lịch qua push notification.'),
    pushTournament: toggle("Cập nhật giải đấu", 'Cập nhật giải đấu qua push.'),
    pushCommunity: toggle("Hoạt động cộng đồng", 'Hoạt động cộng đồng SportNexus.'),
    bookingReminderMinutes: number("Thời gian nhắc lịch đặt sân", 'Nhắc trước thời điểm bắt đầu.', 'phút', 0, 1440),
    retryLimit: number("Số lần thử gửi lại", 'Số lần thử lại khi gửi không thành công.', 'lần', 0, 10),
  },
  security: {
    sessionTimeout: select("Thời gian hết hạn phiên", 'Thời gian hết hạn phiên mẫu; không thay đổi JWT.', [['15', "15 phút"], ['30', "30 phút"], ['60', "60 phút"], ['120', "120 phút"]]),
    maxLoginAttempts: number("Số lần đăng nhập sai tối đa", 'Giới hạn số lần đăng nhập sai.', 'lần', 1, 100),
    strongPasswords: toggle("Yêu cầu mật khẩu mạnh", 'Yêu cầu mật khẩu mạnh (cấu hình mẫu).', true),
    requireTwoFactor: toggle("Yêu cầu xác thực hai yếu tố", 'Yêu cầu 2FA mẫu; không kích hoạt xác thực thật.', true),
    suspiciousLoginAlerts: toggle("Cảnh báo đăng nhập đáng ngờ", 'Cảnh báo hoạt động đăng nhập bất thường.'),
  },
}

export const tournamentFormats = [
  ['single-elimination', "Loại trực tiếp một lần"], ['double-elimination', "Loại trực tiếp hai lần"],
  ['round-robin', "Vòng tròn"], ['group-stage', "Vòng bảng"],
]
export const notificationChannels = [
  { id: 'email', title: "Thông báo qua Email", enabled: 'emailEnabled', fields: ['emailBooking', 'emailPayment', 'emailTournament', 'emailSecurity'] },
  { id: 'inApp', title: "Thông báo trong ứng dụng", enabled: 'inAppEnabled', fields: ['inAppBooking', 'inAppMatchmaking', 'inAppTournament', 'inAppSystem'] },
  { id: 'push', title: "Thông báo đẩy", enabled: 'pushEnabled', fields: ['pushBooking', 'pushTournament', 'pushCommunity'] },
]
export const mockAdministrator = { name: 'Alex Tran', role: "Quản trị viên cấp cao", status: 'Active', lastLogin: '2026-10-13T09:00:00+07:00' }
export const accessRoles = [
  { role: 'Admin', label: "Quản trị viên", description: 'Quản trị hệ thống SportNexus.' },
  { role: 'Player', label: "Người chơi", description: 'Đặt sân, tìm nhóm và tham gia giải đấu.' },
  { role: 'CourtOwner', label: "Chủ sân", description: 'Quản lý cơ sở sân và lịch đặt sân.' },
]
export const mockSessions = [
  { id: 'DEMO-SESSION-01', device: 'Chrome · Windows', location: 'TP. Hồ Chí Minh', time: '2026-10-13T09:00:00+07:00', status: 'Active' },
  { id: 'DEMO-SESSION-02', device: 'Safari · iPhone', location: 'TP. Hồ Chí Minh', time: '2026-10-12T18:30:00+07:00', status: 'Active' },
]
export const initialChangeHistory = [
  { id: 'DEMO-CHANGE-01', at: '2026-10-13T09:05:00+07:00', actor: 'Alex Tran (mẫu)', groups: ['notifications'], changes: [{ path: 'notifications.bookingReminderMinutes', label: "Thời gian nhắc lịch đặt sân", before: 30, after: 60 }] },
  { id: 'DEMO-CHANGE-02', at: '2026-10-12T15:20:00+07:00', actor: 'Alex Tran (mẫu)', groups: ['booking'], changes: [{ path: 'booking.advanceBookingDays', label: "Thời gian được đặt trước", before: 14, after: 30 }] },
]
