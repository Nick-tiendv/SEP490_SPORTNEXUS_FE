// Nhãn hiển thị và hàm tiện ích cho trang Quản lý người dùng (dữ liệu thật lấy qua src/api/admin/accountApi.js).

export const roleLabels = {
  Admin: 'Quản trị viên',
  Administrator: 'Quản trị viên',
  Player: 'Người chơi',
  Owner: 'Chủ sân',
  'Court Owner': 'Chủ sân',
  CourtOwner: 'Chủ sân',
}
export const statusLabels = { Active: 'Đang hoạt động', Suspended: 'Đã tạm khóa' }
export const roleLabel = role => roleLabels[role] || role || '—'
export const roleTone = role => (/owner/i.test(role) ? 'owner' : /admin/i.test(role) ? 'administrator' : '')

export const emptyFilters = { search: '', role: 'All', status: 'All', from: '', to: '' }

const normalize = value => String(value ?? '').toLocaleLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')

export function filterUsers(users, filters) {
  const query = normalize(filters.search.trim())
  return users.filter(user =>
    (!query || [user.name, user.username, user.email, user.phone].some(value => normalize(value).includes(query))) &&
    (filters.role === 'All' || user.role === filters.role) &&
    (filters.status === 'All' || user.status === filters.status) &&
    (!filters.from || (user.joined && user.joined >= filters.from)) && (!filters.to || (user.joined && user.joined <= filters.to)))
}

// Vai trò lấy từ chính danh sách tài khoản, vì BE chưa có API danh sách vai trò.
export function roleOptions(users) {
  const map = new Map()
  for (const user of users) if (user.role && !map.has(user.role)) map.set(user.role, user.roleId)
  return [...map.entries()].map(([name, id]) => ({ name, id }))
}

// Số điện thoại Việt Nam như BE yêu cầu (docs 03): 0912345678 hoặc +84912345678; bỏ qua khoảng trắng, dấu chấm, gạch.
export const compactPhone = value => String(value ?? '').replace(/[\s.-]/g, '')
export const isVietnamPhone = value => /^(0|\+84)\d{9}$/.test(compactPhone(value))
// Dạng chuẩn để so trùng: +84xxxxxxxxx → 0xxxxxxxxx.
export const phoneKey = value => compactPhone(value).replace(/^\+84/, '0')

// Danh sách nút phân trang rút gọn: 1 … 4 5 6 … 20 ('…' là dấu ngắt).
export function pageItems(current, count) {
  const pages = [...new Set([1, current - 1, current, current + 1, count])].filter(page => page >= 1 && page <= count).sort((a, b) => a - b)
  return pages.flatMap((page, index) => (index && page - pages[index - 1] > 1 ? [`gap-${page}`, page] : [page]))
}

export function userStats(users, now = new Date()) {
  // Tháng hiện tại theo giờ Việt Nam (yyyy-MM), khớp với user.joined đã quy về ngày Việt Nam.
  const month = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit' }).format(now)
  const active = users.filter(user => user.status === 'Active').length
  const percent = value => (users.length ? `${((value / users.length) * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%` : '0%')
  const suspended = users.length - active
  return [
    { label: 'TỔNG NGƯỜI DÙNG', value: users.length, trend: 'Toàn bộ tài khoản', tone: 'green' },
    { label: 'NGƯỜI DÙNG ĐANG HOẠT ĐỘNG', value: active, trend: `${percent(active)} đang hoạt động`, tone: 'green' },
    { label: 'NGƯỜI DÙNG MỚI TRONG THÁNG', value: users.filter(user => user.joined?.startsWith(month)).length, trend: `Tháng ${Number(month.slice(5))}/${month.slice(0, 4)}`, tone: 'green' },
    { label: 'ĐÃ TẠM KHÓA', value: suspended, trend: `${percent(suspended)} toàn nền tảng`, tone: 'red' },
  ]
}

export function usersCsv(users) {
  const escape = value => {
    let text = String(value ?? '')
    // Prevent spreadsheet formulas from being executed from user-entered fields.
    if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`
    return `"${text.replaceAll('"', '""')}"`
  }
  return '﻿' + [['ID', 'Họ và tên', 'Tên đăng nhập', 'Email', 'Số điện thoại', 'Vai trò', 'Trạng thái', 'Ngày tham gia'],
    ...users.map(user => [user.id, user.name, user.username, user.email, user.phone, roleLabel(user.role), statusLabels[user.status] || user.status, user.joined])]
    .map(row => row.map(escape).join(',')).join('\r\n')
}
