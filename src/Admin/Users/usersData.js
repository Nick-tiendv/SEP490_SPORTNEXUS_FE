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

export function userStats(users, now = new Date()) {
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const active = users.filter(user => user.status === 'Active').length
  const percent = value => (users.length ? `${((value / users.length) * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%` : '0%')
  const suspended = users.length - active
  return [
    { label: 'TỔNG NGƯỜI DÙNG', value: users.length, trend: 'Toàn bộ tài khoản', tone: 'green' },
    { label: 'NGƯỜI DÙNG ĐANG HOẠT ĐỘNG', value: active, trend: `${percent(active)} đang hoạt động`, tone: 'green' },
    { label: 'NGƯỜI DÙNG MỚI TRONG THÁNG', value: users.filter(user => user.joined?.startsWith(month)).length, trend: `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`, tone: 'green' },
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
