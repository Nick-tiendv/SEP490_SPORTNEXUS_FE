// Hàm tiện ích cho trang Quản lý chủ sân (dữ liệu thật lấy qua src/api/admin/ownerApi.js).

export const emptyOwnerFilters = { search: '', status: 'All', facilities: 'All' }

const normalize = value => String(value ?? '').toLocaleLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')

// Gắn danh sách cơ sở vào từng chủ sân theo ownerId.
export function withFacilities(owners, facilities) {
  return owners.map(owner => ({ ...owner, facilities: facilities.filter(facility => facility.ownerId && facility.ownerId === owner.id) }))
}

export function filterOwners(owners, filters) {
  const query = normalize(filters.search.trim())
  return owners.filter(owner => (!query || [owner.name, owner.username, owner.email, owner.phone, owner.id].some(value => normalize(value).includes(query))) &&
    (filters.status === 'All' || owner.status === filters.status) &&
    (filters.facilities === 'All' || (filters.facilities === '3+' ? owner.facilities.length >= 3 : owner.facilities.length === Number(filters.facilities))))
}

export function ownerStats(owners, facilities) {
  const active = owners.filter(owner => owner.status === 'Active').length
  const withoutFacility = owners.filter(owner => !owner.facilities.length).length
  const percent = value => (owners.length ? `${((value / owners.length) * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%` : '0%')
  return [
    { label: 'Tổng chủ sân', value: owners.length, trend: '', detail: 'tài khoản có vai trò chủ sân' },
    { label: 'Chủ sân đang hoạt động', value: active, trend: percent(active), detail: 'đang hoạt động trên hệ thống' },
    { label: 'Chưa có cơ sở', value: withoutFacility, trend: withoutFacility ? 'Cần theo dõi' : '', detail: 'chủ sân chưa đăng cơ sở nào', pending: withoutFacility > 0 },
    { label: 'Tổng cơ sở thể thao', value: facilities.length, trend: '', detail: 'cơ sở trên nền tảng' },
  ]
}

export function ownersCsv(owners) {
  const escape = value => {
    let text = String(value ?? '')
    if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`
    return `"${text.replaceAll('"', '""')}"`
  }
  return '﻿' + [["ID chủ sân", "Họ và tên", "Tên đăng nhập", 'Email', "Số điện thoại", "Số cơ sở", "Trạng thái tài khoản", "Ngày tham gia"],
    ...owners.map(owner => [owner.id, owner.name, owner.username, owner.email, owner.phone, owner.facilities.length, owner.status, owner.joined])].map(row => row.map(escape).join(',')).join('\r\n')
}
