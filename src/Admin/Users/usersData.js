// Fictional prototype records only; no backend data or persisted account changes.
const profiles = [
  ['Minh Minh Minh', 'minhminh', 'minh.minh@gmail.com', 'Player', 'Active'],
  ['Lê Hoàng Nam', 'nam_le', 'hoangnam.le@vn.vn', 'Player', 'Active'],
  ['Nguyễn Văn Sơn', 'owner_phuongnang', 'nguyen.vanson@sport.vn', 'Court Owner', 'Active'],
  ['Trần Đình Khang', 'hoang_badminton', 'khang.dinh@outlook.com', 'Player', 'Inactive'],
  ['Hoàng Phạm Cường', 'cuong_ph', 'cuong.pham@gmail.com', 'Player', 'Suspended'],
  ['Vũ Thị Mai Anh', 'mai_anh', 'maianh.vt@gmail.com', 'Player', 'Active'],
  ['Alex Tran', 'alextran_admin', 'alex.tran@sportnexus.vn', 'Administrator', 'Active'],
  ['Phạm Thùy Linh', 'thuy_linh', 'linh.pham@example.com', 'Player', 'Active'],
  ['Đặng Quốc Huy', 'quoc_huy', 'huy.dang@example.com', 'Player', 'Inactive'],
  ['Nguyễn Mai Anh', 'mai_nguyen', 'mai.nguyen@example.com', 'Court Owner', 'Active'],
  ['Trần Đức Khang', 'duc_khang', 'khang.tran@example.com', 'Player', 'Active'],
  ['Lê Thanh Bình', 'thanh_binh', 'binh.le@example.com', 'Player', 'Suspended'],
  ['Võ Ngọc Lan', 'ngoc_lan', 'lan.vo@example.com', 'Player', 'Active'],
  ['Bùi Gia Bảo', 'gia_bao', 'bao.bui@example.com', 'Court Owner', 'Inactive'],
  ['Trần Hoài An', 'hoai_an', 'an.tran@example.com', 'Player', 'Active'],
]

export const initialUsers = profiles.map(([name, username, email, role, status], index) => ({
  id: `USER-${94811 + index}`, name, username, email, role, status,
  joined: index === 0 ? '2024-01-14' : `2024-10-${String(index + 1).padStart(2, '0')}`,
  phone: index === 0 ? '0912 778 899' : null,
  lastActive: status === 'Active' ? "10 phút trước (ứng dụng iOS)" : null,
  sport: role === 'Player' ? (index % 2 ? 'Tennis' : 'Pickleball & Cầu Lông') : null,
  skillLevel: role === 'Player' ? (index % 2 === 0 ? 'Trung bình - Khá' : 'Khá - Nâng cao') : null,
  fairplay: status === 'Suspended' ? 72 : role === 'Player' ? 99.4 : null,
  bookings: role === 'Player' ? 32 + index : 0,
  lfg: role === 'Player' ? 18 + index : 0,
  tournaments: role === 'Player' ? 2 : 0,
  reviews: role === 'Player' ? 14 + index : 0,
  wallet: role === 'Player' ? 2450000 + index * 100000 : null,
  totalSpent: role === 'Player' ? 14200000 + index * 200000 : null,
  activities: index === 0 ? [
    { title: "Đã tham gia trận tìm nhóm chơi #BK-8820", text: 'Kèo Pickleball Đôi Nam 4.0 • Sunrise Court 2', time: "18 phút trước" },
    { title: "Đã đặt sân Sunrise Riverside", text: '18:30–20:00 (Court 2B) • Đã thanh toán cọc', time: "Hôm qua lúc 15:42" },
    { title: "Đã hoàn tất điểm danh tại cổng", text: 'Smart Turnstile Gate 3 • PB Center Q7', time: "24/10/2024" },
    { title: "Đã cập nhật mật khẩu", text: "Đã xác minh bảo mật 2FA bằng SMS OTP", time: "12/10/2024" },
  ] : [],
  disputes: status === 'Suspended' ? 1 : 0,
}))

export const userStats = [
  { label: "TỔNG NGƯỜI DÙNG", value: '148.250', trend: "+12,4% so với tháng trước", tone: 'green' },
  { label: "NGƯỜI DÙNG ĐANG HOẠT ĐỘNG", value: '139.410', trend: "94,0% đang hoạt động", tone: 'green' },
  { label: "NGƯỜI DÙNG MỚI TRONG THÁNG", value: '4.820', trend: "+10,2% so với tháng trước", tone: 'green' },
  { label: "ĐÃ TẠM KHÓA / NGỪNG HOẠT ĐỘNG", value: '8.840', trend: "5,9% toàn nền tảng", tone: 'red' },
]
export const emptyFilters = { search: '', role: 'All', status: 'All', from: '', to: '' }

export function filterUsers(users, filters) {
  const query = filters.search.trim().toLocaleLowerCase()
  return users.filter(user =>
    (!query || [user.name, user.username, user.email].some(value => value.toLocaleLowerCase().includes(query))) &&
    (filters.role === 'All' || user.role === filters.role) &&
    (filters.status === 'All' || user.status === filters.status) &&
    (!filters.from || user.joined >= filters.from) && (!filters.to || user.joined <= filters.to))
}

export function usersCsv(users) {
  const escape = value => {
    let text = String(value ?? '')
    // Prevent spreadsheet formulas from being executed from user-entered fields.
    if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`
    return `"${text.replaceAll('"', '""')}"`
  }
  return '\uFEFF' + [['ID', "Họ và tên", "Tên đăng nhập", 'Email', 'Vai trò', "Trạng thái", "Ngày tham gia"],
    ...users.map(user => [user.id, user.name, user.username, user.email, user.role, user.status, user.joined])]
    .map(row => row.map(escape).join(',')).join('\r\n')
}
